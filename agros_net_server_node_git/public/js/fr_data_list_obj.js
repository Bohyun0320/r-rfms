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
    el: $('#data-list-obj-grid'), // Container element
    scrollY:true,
   rowHeaders: ['rowNum'],
    pagination: true,
//    keyColumnName: 'id',
    showDummyRows: false,
    useClientSort: false,
    columns: [
      { title: '객체 ID', name: 'obj_rs_id', sortable:true, minWidth:70, align : 'center'},
      // { title: '객체명', name: 'obj_nm', sortable:true, minWidth:100, align : 'center'},
      { title: '코드', name: 'cd', sortable:true, minWidth:80, align : 'center'},
      { title: '교통표지명', name: 'sign_nm', sortable:true, minWidth:180, align : 'center'},
      { title: '프로젝트 ID', name: 'prj_id', sortable:true, minWidth:80, align : 'center'},
      { title: '프로젝트명', name: 'prj_nm', sortable:true, minWidth:280, align : 'center'},
      // { title: '영상파일 ID', name: 'photo_id', sortable:true, minWidth:90, align : 'center'},
      { title: '영상파일명', name: 'org_file_nm', sortable:true, minWidth:280, align : 'center'},

      // { title: 'DL모델', name: 'dlm_id', sortable:true, minWidth:60, align : 'center'},
      // { title: '표지코드', name: 'cd', sortable:true, minWidth:80, align : 'center'},
      // { title: '코드구분', name: 'trffc_sign_ty_nm', sortable:true, minWidth:60, align : 'center'},
      // { title: '수집날짜', name: 'clct_ymd', sortable:true, minWidth:100, align : 'center', formatter : formatterDate},
      // { title: '작업날짜', name: 'job_ymd', sortable:true, minWidth:100, align : 'center', formatter : formatterDate},
      { title: '갱신필요', name: 'updt_yn', sortable:true, minWidth:80, align : 'center', formatter : formatterUpdtYn},
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
      'readData': '/api/data/read/obj',
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
    // return;
    // console.dir(gContentList);

    if (!data.responseData.result) {
      return ;
    }
    
    console.log("fr_data_list_obj - contents : "+data.responseData.data.contents);

    var contents = data.responseData.data.contents;
    
    if (!contents) return;
    

    if (gContentList) {
      gContentList = gContentList.concat(contents);
      console.log("gContentList : "+gContentList);
    }else {
      gContentList = contents;
      console.log("gContentList : "+gContentList);
    }

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
    let idContents = row.find('td[data-column-name=obj_rs_id] .tui-grid-cell-content');

    // console.log(idContents.html());

    if (curItemId == idContents.html()) {
      console.log('find!!');
      foundRow = row;
    }
  });

  if (!foundRow)  {
    return console.log('not found!')
  }

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
  if (!value) {
    return '정보없음';
  }

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

function formatterUpdtYn(value) {
  if (value == undefined) {
    return '정보 없음 ';
  }

  switch(value) {
    case 1: 
      return '추가';

    case 2:
      return '수정';
    
    case 3:
      return '삭제';

    case 4:
      return '유지';
  }

  return value;
}

function onDridDblClik(gridEvent) {
 console.log('onDridDblClik : ');
//  console.dir(originUserList);
  console.dir(gridEvent);
  // console.dir(vhList);

  // to implement
  // return runToastr('info', '구현예정 기능 입니다.');
  
  if (typeof gridEvent.rowKey ==='undefined' || !gContentList) return;

  var dataInfo = gContentList[gridEvent.rowKey];

  // dataView.init("dataViewModal", dataView.MOD_OBJ, dataInfo);

  // navTo
  const navOption = {
    reqParams : gCurPageData.requestParameter,
    reqUrl : '/api/data/read/obj',
    returnUrl : '/data/list/obj',
    contents : gCurPageData.responseData.data.contents,
    totalCount : Number(gCurPageData.responseData.data.pagination.totalCount),
    key : 'obj_rs_id'
  }

  dataView.init("dataViewModal", dataView.MOD_OBJ, gContentList[gridEvent.rowKey], navOption);
}

// function searchList() {
window.searchList = function () {
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



