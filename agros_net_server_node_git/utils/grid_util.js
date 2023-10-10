var gridUtil = {};
var logger = require('../logger');

gridUtil.getDefaultInfo = function(req, defaultSort) {
  logger.debug('[func]gridUtil.getDefaultInfo()');

  var gridInfo = {
    page : req.query.page ? Number(req.query.page) : 1,
    perPage : req.query.perPage ? Number(req.query.perPage) : 14,
    sortColumn : req.query.sortColumn ? req.query.sortColumn : defaultSort,
    sortAscending : req.query.sortAscending,
    filter_type : req.query.filter_type,
    filter_value : req.query.filter_value
  }

  return gridInfo;
}

gridUtil.convertGridData = function(listInfo, dbResult) {
  logger.debug('[func]gridUtil.convertGridData()');
  
  var resultJson = {
    result: true,
    message : null,
    data: {
      contents: null,
      pagination: {
        page: listInfo.page,
        totalCount: 0
      }
    },
  };
  
  if (!dbResult || dbResult.length==0) {
    resultJson.result = true;
    resultJson.message = 'equip data is null';
    return resultJson;
  }
  
  resultJson.data.contents = dbResult;
  resultJson.data.pagination.totalCount = dbResult[0].total;
  
  return resultJson;
}

module.exports = gridUtil;