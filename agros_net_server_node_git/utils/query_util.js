var logger = require('../logger');
var queryUtil = {};

queryUtil.addBsnsFilterQuery = function(filterInfo, query, firstWhere) {
  if (!query || !filterInfo) {
    return null;
  }
  
  var filterQuery = query;
  
  if (filterQuery.values == 'undefined') {
    filterQuery.values = [];
  }
  
  var filter =[];
  var valueCount = filterQuery.values.length;
  
  if (filterInfo.filter_year && filterInfo.filter_year > 0) {
    filter.push({ 
      field : 'b.bgn_de',
      key : filterInfo.filter_year + '-01-01',
      strict : true
    });
    
    filter.push({ 
      field : 'b.bgn_de',
      key : filterInfo.filter_year + '-12-31',
      strict : true
    });
  }
  
  if (filterInfo.filter_type && filterInfo.filter_type > 0) {
    filter.push({ 
      field : 'b.bsns_ty_id',
      key : filterInfo.filter_type,
      strict : true
    });
  }
  
  if (filterInfo.filter_spt_type && filterInfo.filter_spt_type > 0) {
    filter.push({ 
      field : 'b.trg_spt_info_id',
      key : filterInfo.filter_spt_type,
      strict : true
    });
  }
  
  if (filterInfo.filter_name && filterInfo.filter_name.length > 0) {
    filter.push({ 
      field : 'b.bsns_nm',
      key : filterInfo.filter_name,
      strict : false
    });
  }

  if (filterInfo.filter_usr_name && filterInfo.filter_usr_name.length > 0) {
    filter.push({ 
      field : 'u.user_nm',
      key : filterInfo.filter_usr_name,
      strict : false
    });
  }
  
  if (filterInfo.bsns_id) {
    filter.push({ 
      field : 'b.bsns_id',
      key : filterInfo.bsns_id,
      strict : true
    });
  }
  
  logger.debug('filter : ');
  logger.dir(filter);
  

  for (var i=0; i<filter.length; i++) {
    if (i ==0 && firstWhere == true) {
      filterQuery.text += ' WHERE ';  
    }else if (filterQuery.text.includes('WHERE') ||  filterQuery.text.includes('where') ) {
      filterQuery.text += ' AND ';
    }else {
      filterQuery.text += ' WHERE ';
    }
    
    if (filter[i].field =='b.bgn_de') {
      filterQuery.text += filter[i].field + ' >= $' + ++valueCount + ' AND ' + filter[i+1].field + ' <= $' + ++valueCount ;  
      filterQuery.values.push(filter[i].key);
      filterQuery.values.push(filter[i+1].key);
      i++
      continue;
    }
    
    if (filter[i].strict) {
      filterQuery.text += filter[i].field + ' = $' + ++valueCount;
      filterQuery.values.push(filter[i].key);
    }else {
      filterQuery.text += filter[i].field + ' LIKE $' + ++valueCount;
      filterQuery.values.push("%" + filter[i].key + "%");
    }
  }
  
  
  return filterQuery;
}

queryUtil.addBsnsSortQuery = function(sortInfo, query) {
  if (!query || !sortInfo) {
    return null;
  }
  
  var filterQuery = query;
  
  if (filterQuery.values == 'undefined') {
    filterQuery.values = [];
  }
  
  var valueCount = filterQuery.values.length;
  
  if (sortInfo.sortColumn) {
    filterQuery.text += ' ORDER BY ' + sortInfo.sortColumn + ' ';
    
    if (sortInfo.sortAscending == 'false') {
      filterQuery.text += ' DESC ';
    }
    
  }else {
    filterQuery.text += ' ORDER BY b.bsns_id DESC';
  }
  
  return filterQuery;
}

queryUtil.addFilterQuery = function(listInfo, query, strict) {
  if (!query || !listInfo) {
    return query;
  }
  
  var filterQuery = query;
  var valueCount = filterQuery.values.length;

  // logger.dir(listInfo);
  
  if (listInfo.filter_value) {

    if(strict || strict==undefined && listInfo.filter_type.includes('_id')) {
      filterQuery.text +=  (valueCount < 1 ? ' WHERE ' : ' AND ') + listInfo.filter_type + ' = $' + ++valueCount;
      filterQuery.values.push(listInfo.filter_value);
    }else {
      filterQuery.text += (valueCount < 1 ? ' WHERE ' : ' AND ') + listInfo.filter_type + ' ILIKE $' + ++valueCount;
      filterQuery.values.push("%" + listInfo.filter_value + "%");
    }
  }

  // logger.dir(filterQuery);
  
  return filterQuery;
}


queryUtil.addSortQuery = function(sortInfo, query, subSort) {
  if (!query || !sortInfo) {
    return null;
  }

  if (!sortInfo.sortColumn) {
    return query;
  }

  logger.dir(sortInfo)
  logger.dir(subSort)
  
  var filterQuery = query;
  
  if (filterQuery.values == 'undefined') {
    filterQuery.values = [];
  }
  
  var valueCount = filterQuery.values.length;
  
  if (sortInfo.sortColumn && sortInfo.sortAscending) {
    filterQuery.text += ' ORDER BY ' + sortInfo.sortColumn + ' ';
    
    if (sortInfo.sortAscending == 'false') {
      filterQuery.text += 'DESC ';
    }
    
  }else {
    filterQuery.text += ' ORDER BY ' + sortInfo.sortColumn + ' DESC ';
    // filterQuery.text += ' ORDER BY ' + sortInfo.sortColumn;
  }

  if(subSort && subSort != sortInfo.sortColumn) {
    filterQuery.text += ', ' + subSort + ' ';
  }
  
  return filterQuery;
}
// queryUtil.addSortQuery = function(sortInfo, defSort, query) {
//   if (!query || !sortInfo) {
//     return null;
//   }
  
//   var filterQuery = query;
  
//   if (filterQuery.values == 'undefined') {
//     filterQuery.values = [];
//   }
  
//   var valueCount = filterQuery.values.length;
  
//   if (sortInfo.sortColumn) {
//     filterQuery.text += ' ORDER BY ' + sortInfo.sortColumn + ' ';
    
//     if (sortInfo.sortAscending == 'false') {
//       filterQuery.text += 'DESC ';
//     }
    
//   }else {
//     filterQuery.text += ' ORDER BY ' + defSort + ' DESC ';
//   }
  
//   return filterQuery;
// }

queryUtil.addLimitQuery = function(limitInfo, query) {
  if (!query || !limitInfo) {
    return null;
  }
  
  var filterQuery = query;
  
  if (filterQuery.values == 'undefined') {
    filterQuery.values = [];
  }
  
  var valueCount = filterQuery.values.length;
  
  if (limitInfo.page && limitInfo.perPage) {
    var valIdx = filterQuery.values.length;
    
    filterQuery.text += ' LIMIT $' + ++valueCount  + ' OFFSET $' + ++valueCount;
    filterQuery.values.push(limitInfo.perPage);
    filterQuery.values.push((limitInfo.page - 1) * limitInfo.perPage);
  }
  
  return filterQuery;
  
}

module.exports = queryUtil;