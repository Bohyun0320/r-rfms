import dataView from "./module/fr_data_view_module.js";

var Grid = tui.Grid;
var gridInstance;
var gridNet;
var gContentList= [];

// navTo
let gCurPageData = null;

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
    el: $('#data-list-data-grid'), // Container element
    scrollY:true,
   rowHeaders: ['rowNum'],
    pagination: true,
//    keyColumnName: 'id',
    showDummyRows: false,
    useClientSort: false,
    columns: [
      { title: '영상데이터ID', name: 'photo_id', sortable:true, minWidth:100, align : 'center'},
      { title: '프로젝트명', name: 'prj_nm', sortable:true, minWidth:150, align : 'center'},
      { title: '프로젝트ID', name: 'prj_id', sortable:true, minWidth:60, align : 'center'},
      // { title: '데이터 유형', name: 'data_ty_nm', sortable:true, minWidth:120, align : 'center'},
      { title: '파일명', name: 'org_file_nm', sortable:true, minWidth:180, align : 'left'},
      { title: '파일 크기', name: 'file_len', sortable:true, minWidth:120, align : 'center', formatter : formatterFileSize },
      { title: '등록일시', name: 'data_reg_dt', sortable:true, minWidth:100, align : 'center', formatter : gridFormatDateTime},
      { title: '처리시작', name: 'prcs_strt_dt', sortable:true, minWidth:100, align : 'center', formatter : gridFormatDateTime},
      { title: '처리종료', name: 'prcs_end_dt', sortable:true, minWidth:100, align : 'center', formatter : gridFormatDateTime},
      { title: '등록 유형', name: 'data_reg_ty_nm', sortable:true, minWidth:120, align : 'center'},

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
      'readData': '/api/data/read/cam',
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

    console.dir(data);

    if (!data.responseData.result) {
      return ;
    }

    var contents = data.responseData.data.contents;
    
    if (!contents) return;

    if (gContentList) {
      gContentList = gContentList.concat(contents);
    }else {
      gContentList = contents;
    }

    console.dir(gContentList);

    // navTo
    gCurPageData = data;
    setTimeout(setNavItem, 300);
  });
  
  
  gridNet = gridInstance.getAddOn('Net');
  
  gridInstance.on('dblclick', onDridDblClik);
}

// navTo
function setNavItem() {
  let curItemId = getCurNavItem();

  console.log('curItemId : ' + curItemId);
  
  if (!curItemId) return;

  const rows = $('.tui-grid-table tr');
  let foundRow = null;

  console.dir(rows);
  rows.each(function (el, index) {
    let row = $(this);
    let idContents = row.find('td[data-column-name=photo_id] .tui-grid-cell-content');

    // console.log(idContents.html());

    if (curItemId == idContents.html()) {
      console.log('find!!');
      foundRow = row;
    }
  });

  if (!foundRow) console.log('not found!')

  foundRow.addClass('nav-selected')
  
}

function getCurNavItem() {
  let url = location.href;
  let splited = url.split(/[=?&]/);
  let curItemId = null;

  // console.dir(splited);

  for(let i=0; i<splited.length; i=i+2) {
    if (splited[i] == "curItemId") {
      return (i+1 < splited.length) ? splited[i+1] : null;
    }
  }

  return curItemId;
}


function formatterDate(value) {
  // console.log(value);
  return new Date(value).format('yy-MM-dd');
}

function gridFormatDateTime(value) {
  if (!value) {
    return '정보없음';
  }
  
  return new Date(value).format('yy-MM-dd / HH:mm');
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

// function formatterFileSize(value) {
//   if (!value) {
//     return '정보없음';
//   }

//   var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
//   var e = Math.floor(Math.log(value) / Math.log(1024));
//   return (value / Math.pow(1024, e)).toFixed(2) + " " + s[e];
// }

function onDridDblClik(gridEvent) {
 console.log('onDridDblClik : ' + gridEvent.rowKey);
//  console.dir(originUserList);
  console.dir(gridEvent);
  // console.dir(vhList);

  // to implement
  // return runToastr('info', '구현예정 기능 입니다.');
  
  if (typeof gridEvent.rowKey ==='undefined' || !gContentList) return;

  var imgInfo = gContentList[gridEvent.rowKey];

  // location.href = '/equip/vehicle/' + vhInfo.vh_id;
  // dataView.init("dataViewModal", dataView.MOD_IMG, gContentList[gridEvent.rowKey]);

  // navTo
  const navOption = {
    reqParams : gCurPageData.requestParameter,
    reqUrl : '/api/data/read/cam',
    returnUrl : '/data/list/cam',
    contents : gCurPageData.responseData.data.contents,
    totalCount : Number(gCurPageData.responseData.data.pagination.totalCount),
    key : 'photo_id'
  }

  dataView.init("dataViewModal", dataView.MOD_IMG, gContentList[gridEvent.rowKey], navOption);
}

// function searchList() {
window.searchList =function() {
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



