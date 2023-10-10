var Grid = tui.Grid;
var gridInstance;
var gridNet;
var gContentList= null;


$(document).ready(function($) {
  // initFilter();
  
  initGrid();
  
//   $('.contents-card-bsns').on('bsnsInfoUpdated', function(event, bsnsInfo) {
// //    console.log('userInfoUpdated event!!');
//     gridNet.reloadData();
//   });
  
//   $('.contents-container').on('menuBarChanged', function(event, isWide) {
// //    console.log('[event]menuSizeChanged - isWide : ' + isWide);
//     gridInstance.refreshLayout();
//   });

});

function initGrid() {
  tui.usageStatistics =false;
  
  gridInstance = new Grid({
    el: $('#equip-vh-list-grid'), // Container element
    scrollY:true,
   rowHeaders: ['rowNum'],
    pagination: true,
//    keyColumnName: 'id',
    showDummyRows: false,
    useClientSort: false,
    columns: [
      { title: '차량ID', name: 'vh_id', sortable:true, minWidth:70, align : 'center'},
      { title: '차량명', name: 'vh_nm', sortable:true, minWidth:150, align : 'center'},
      { title: '차량번호', name: 'vh_no', sortable:true, minWidth:120, align : 'center'},
      { title: '관리자', name: 'flnm', sortable:true, minWidth:150, align : 'center'},
      { title: '관리지역(시도)', name: 'sido_nm', sortable:true, minWidth:130, align : 'center'},
      { title: '지역(시군구)', name: 'sigungu_nm', sortable:true, minWidth:130, align : 'center'},
      { title: '상태', name: 'vh_cond_nm', sortable:true, minWidth:100, align : 'center'},
      { title: '등록일', name: 'reg_ymd', sortable:true, minWidth:150, align : 'center', formatter : formatterDate},

      // { title: '사업분류', name: 'bsns_ty_nm', sortable:false, minWidth:100, align : 'center'},
      // { title: '대상공간정보', name: 'trg_spt_info_nm', sortable:false, minWidth:120, align : 'center'},
      // { title: '사업명', name: 'bsns_nm', sortable:true, minWidth: 200 },
      // { title: '사업면적', name: 'inspct_ar', sortable:false, minWidth : 120, align : 'right' },
      // { title: '보안건수', name: 'inspct_co', sortable:true, minWidth : 80, align : 'center'},
      // { title: '완료건수', name: 'inspct_compt_co', sortable:true, minWidth: 80, align : 'center'},
      // { title: '검사율', name: 'inspct_compt_rate', sortable:false, minWidth: 80, align : 'center', formatter : formatterPercent},
      // { title: '시작일', name: 'bgn_de', sortable:true, minWidth: 100, align : 'center', formatter : formatterDate},
      // { title: '종료일', name: 'compet_de', sortable:true, minWidth: 100, align : 'center', formatter : formatterDate},
      // { title: '검사관', name: 'user_nm', sortable:true, minWidth: 100, align : 'center',}
    ],
//    data : gridData,
//    fitToParentHeight: true,
//    isFixedHeight: true,
  });
  
  gridInstance.use('Net', {
    el: $('#filter-form'),
    initialRequest: true,
    readDataMethod: 'GET',
    perPage: 14,
    enableAjaxHistory: true,
    withCredentials: false,
    api: {
      'readData': '/api/equip/read/vh',
//      'downloadExcel': '/api/scrtdb/download/excel',
//      'downloadExcelAll': '/api/scrtdb/download/excelAll'
    }
  });


  Grid.applyTheme('clean'); // Call API of static method
  
  gridInstance.on('beforeRequest', function(data) {
//    console.log('grid beforeRequest :');
//    console.dir(data);
  });
  
  gridInstance.on('response', function(data) {
//    console.log('grid response :');
//    console.dir(data);
    
    if (!data) return;

    // console.dir(data);
    // return;
    
    var contents = data.responseData.data.contents;
    
    if (!contents) return;
    

    if (gContentList) {
      gContentList = gContentList.concat(contents);
    }else {
      gContentList = contents;
    }
    // console.dir(vhList);
  });
  
  
  gridNet = gridInstance.getAddOn('Net');
  
  gridInstance.on('dblclick', onDridDblClik);

}

function formatterDate(value) {
  return new Date(value).format('yy-MM-dd');
}

function formatterPercent(value) {
  if (value == undefined) {
    return '';
  }
  
  if (value == '해당없음') {
    return value;
  }
  
  return value + ' %';
}

function onDridDblClik(gridEvent) {
 console.log('onDridDblClik : ');
//  console.dir(originUserList);
  console.dir(gridEvent);
  // console.dir(vhList);
  
  if (typeof gridEvent.rowKey ==='undefined' || !gContentList) return;

  var vhInfo = gContentList[gridEvent.rowKey];

  location.href = '/equip/vehicle/' + vhInfo.vh_id;
  
  //  console.dir(gridEvent);
//  console.dir(gridData[gridEvent.rowKey]);
}

function searchVhList() {
  var formData = gridNet._getFormData(); //form
  gridNet.readData(1, formData, true);
}

// $(".contents-card-wrapper").on("click", function(event){
//   event.stopPropagation();
// });

// function isBookmarked(bsnsId) {
//   for (var i=0; i< favoriteList.length; i++) {
//     if (favoriteList[i].bsns_id == bsnsId) {
//       return true;
//     }
//   }
//   return false;
// }

function exportExcel() {
//  console.log('func : exportExcel');
  
  var formData = $('#filter-form').serialize();
//  console.dir(formData);
  
  location.href = '/bsns/list/download' + '?' + formData;
}

// function initFilter() {
//   $('#searchValue').keydown(function(event) {
//     if (event.keyCode == 13) {
//       serchVhList();
//       return false;
//     }
//   });
// }



