var Grid = tui.Grid;
var gridInstance;
var gridNet;
var userList = null;


$(document).ready(function ($) {
  console.dir(userList);
  //  console.dir(userType);
  initGrid();

});

function initGrid() {
  tui.usageStatistics = false;

  gridInstance = new Grid({
    el: $('#account-list-grid'), // Container element
    scrollY: true,
    rowHeaders: ['rowNum'],
    pagination: true,
    //    keyColumnName: 'id',
    showDummyRows: false,
    useClientSort: false,
    columns: [
      { title: '이름', name: 'flnm', sortable: true, align: 'center' },
      { title: '이메일', name: 'sv_user_id', sortable: true, minWidth: 120 },
      { title: '소속', name: 'ogdp', sortable: true, align: 'center' },
      { title: '전화번호', name: 'telno', sortable: true, align: 'center', minWidth: 120 },
      { title: '회원구분', name: 'user_ty_nm', sortable: true, align: 'center' },
      { title: '상태', name: 'user_cond_nm', sortable: true, align: 'center' },
      { title: '가입일', name: 'join_ymd', sortable: true, align: 'center', formatter: formatterDate },
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
      'readData': '/api/account/read',
      //      'downloadExcel': '/api/scrtdb/download/excel',
      //      'downloadExcelAll': '/api/scrtdb/download/excelAll'
    }
  });

  Grid.applyTheme('clean'); // Call API of static method

  gridInstance.on('beforeRequest', function (data) {
    //    console.log('grid beforeRequest :');
    //    console.dir(data);
  });

  gridInstance.on('response', function (data) {
    //    console.log('grid response :');
    //    console.dir(data);

    if (!data) return;

    // console.dir(data);
    // return;

    var contents = data.responseData.data.contents;

    if (!contents) return;


    if (userList) {
      userList = userList.concat(contents);
    } else {
      userList = contents;
    }
    // console.dir(vhList);
  });


  gridNet = gridInstance.getAddOn('Net');

  gridInstance.on('dblclick', onDridDblClik);

}

function formatterDate(value) {
  return new Date(value).format('yy-MM-dd');
}

function onDridDblClik(gridEvent) {
  console.log('onDridDblClik : ');
  //  console.dir(gridEvent);
  //  console.dir(originUserList);

  if (typeof gridEvent.rowKey === 'undefined' || !userList) return;

  var userInfo = userList[gridEvent.rowKey];
  console.dir(userInfo);

  location.href = '/account/view/' + userInfo.sv_user_id;

}

function searchUserList() {
  var formData = gridNet._getFormData(); //form
  gridNet.readData(1, formData, true);
}


