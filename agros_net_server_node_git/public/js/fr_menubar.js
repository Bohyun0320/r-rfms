$(document).ready(function($) {
  menuBarInit();
  sidoChange('11');
  initDatePicker();
  PrjBtnActive();
});

var cookieShrink = 'menuBarShrink';

var ajaxResult;

function menuBarInit() {
  var shrink = $.cookie(cookieShrink);
  
//  console.log('menuBarInit - shrink :' + shrink);
  
  if (!shrink) {
    shrink = false;
    $.cookie(cookieShrink, shrink, {path:'/'});
//    setCookie(cookieShrink, shrink, null);
  }
}

function toggleMenuBar() {
  console.log('toggleMenuBar');
  
  $('#menubar').toggleClass('shrink');
  
  $('.contents-container').toggleClass('contents-container-wide');
  
  var shrink = $('#menubar').hasClass('shrink');
  $.cookie(cookieShrink, shrink, {path:'/'});
  console.dir('set Cookie shrink : ' + shrink)
  
//  $('.contents-container').trigger('menuBarChanged');
  
//  console.log('toggleMenuBar');
  
//  console.log($('.contents-container'));
  
  $('.contents-container').trigger('menuBarChanged', [$('.contents-container').hasClass('contents-container-wide')]);
}

$('#sido_list').on("change", function(){
  sidoChange(this.value);
})

function sidoChange(sidoCd){

  $.ajax({
    url: '/api/map/sig',
    type: 'POST',
    data: {
      "sidoCd" : sidoCd,
    },
    dataType: 'JSON',
    success: function(result){
      removeOptions();
      addOptions(result);
    },
    error: function(data, textStatus, errorThrown){
      console.log("sidoChange ajax() - fail");
      callback(data);
    }
    
  });
}

function removeOptions(){
  $('#sig_list').empty();

}

function addOptions(data){
  for(var i = 0; i<data.length; i++){
    $('#sig_list').append("<option value='"+data[i]['sig_cd']+"'>"+data[i]['sig_kor_nm']+"</option>");
  }
}

function initDatePicker() {
  var today = new Date();
  var lastYear = new Date();

  lastYear.setFullYear(lastYear.getFullYear() - 1);

  startDatePicker = new tui.DatePicker('#stat-start-date-picker-container', {
      date: lastYear,
      input: {
          element: '#start-date',
          format: 'yyyy-MM-dd'
      },
      language: 'ko',
  });

  endDatePicker = new tui.DatePicker('#stat-end-date-picker-container', {
      date: today,
      input: {
          element: '#end-date',
          format: 'yyyy-MM-dd'
      },
      language: 'ko',
  });

}

function typeClick(signTyNm){
  console.log("typeClick() - signTyId : "+signTyNm);
  const obj = document.getElementById(signTyNm);

  const divisCheckboxes = document.getElementsByName(signTyNm);

  divisCheckboxes.forEach((divis)=>{
    divis.checked = obj.checked;
  });
}

function signClick(signNm){
  console.log("signClick() - signTyNm : "+signNm);
  
  const obj = document.getElementById(signNm);
  const divisCheckboxes = document.getElementsByName(signNm);

  for(var i = 0; i<divisCheckboxes.length;i++){
    if(divisCheckboxes[i].checked==false){
      obj.checked=false;
      break;
    }else{
      obj.checked=true;
    }
  }
}

// function mapViewSearch(){
//   console.log("mapViewSearch()");

//   const selectedPrjList = [];
//   const selectedSignList = [];

//   var sidoCd, sigCd, startDate, endDate, sidoList, sigList, selectedList, 
//       signTyList, updtYn, signList, startDateVal, endDateVal;

//   selectedList = document.getElementById('prj_list');

//   if(!selectedList.disabled){
//     for(var i = 0; i<selectedList.length;i++){
//       if(selectedList.options[i].selected){
//         var value = selectedList.options[i].value;
//         selectedPrjList.push(Number(value));
//       }
//     }
//   }

//   sidoList = document.getElementById('sido_list');
//   sigList = document.getElementById('sig_list');

//   if(!sidoList.disabled){
//     for(var i = 0; i<sidoList.length;i++){
//       if(sidoList.options[i].selected){
//         sidoCd =sidoList.options[i].value;
//       }
//     }
//   }else{
//     sidoCd = null;
//   }

//   if(!sigList.disabled){
//     for(var i = 0; i<sigList.length;i++){
//       if(sigList.options[i].selected){
//         sigCd = sigList.options[i].value;
//       }
//     }
//   }else{
//     sigCd = null;
//   }

//   signTyList = document.getElementsByClassName('signTy');
//   for(var i = 0 ; i<signTyList.length;i++){
//     signList = document.getElementsByName(signTyList[i].id);
//     for(var j = 0; j<signList.length; j++){
//       if(signList[j].checked){
//         selectedSignList.push(signList[j].value);
//       }
//     }
//   }

//   startDate = document.getElementById('start-date');
//   endDate = document.getElementById('end-date');
  
//   if(!startDate.disabled){
//     startDateVal = startDate.value;
//   }else{
//     startDateVal = null;
//   }

//   if(!endDate.disabled){
//     endDateVal = endDate.value;
//   }else{
//     endDateVal = null;
//   }

//   updtYn = document.getElementById('updtYn').checked;

//   if(selectedSignList==""){
//     alert("객체를 하나 이상 선택하세요!");
//   }else{
//     if(selectedPrjList == ''){
//       console.log("지역 검색");
//       var apiUrl = '/api/map/searchMapRegion';
//       var data = {
//         "sidoCd" : sidoCd,
//         "sigCd" : sigCd,
//         "SignList" : selectedSignList,
//         "startDate" : startDateVal,
//         "endDate" : endDateVal,
//         "updtYn" : updtYn
//       };
//       ajaxMapSearch(apiUrl, data);
//     }else if(sidoCd == null && sigCd == null){
//       console.log("프로젝트 검색" );
//       var apiUrl = '/api/map/searchMapPrj';
//       var data = {
//         "PrjList" : selectedPrjList,
//         "SignList" : selectedSignList,
//         "updtYn" : updtYn
//       };
//       ajaxMapSearch(apiUrl, data);
//     }
//   }
// }

// function ajaxMapSearch(urlPath, dataSet){
//   $.ajax({
//     url: urlPath,
//     type: 'POST',
//     data: dataSet,
//     dataType: 'JSON',
//     success: function(result){
//       console.log(result);
//     },
//     error: function(data, textStatus, errorThrown){
//       console.log("ajaxMapSearch ajax() - fail");
//       callback(data);
//     }
//   }); 
// }

function PrjBtnActive(){
  const prjSelect = document.getElementById('prj_list');
  prjSelect.disabled = false;

  const sidoSelect = document.getElementById('sido_list');
  const sigSelect = document.getElementById('sig_list');
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  sidoSelect.disabled = true;
  sigSelect.disabled =true;
  startDate.disabled = true;
  endDate.disabled = true;
}

function RegionBtnActive(){

  const prjSelect = document.getElementById('prj_list');
  prjSelect.disabled = true;

  const sidoSelect = document.getElementById('sido_list');
  const sigSelect = document.getElementById('sig_list');
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  sidoSelect.disabled = false;
  sigSelect.disabled =false;
  startDate.disabled = false;
  endDate.disabled = false;

}

function setMarker(){

}