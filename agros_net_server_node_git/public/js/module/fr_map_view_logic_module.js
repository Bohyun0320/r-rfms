import MapViewModule from './fr_map_view_module.js';
// import dataView from "./fr_data_view_module.js";
import dataView from "./fr_data_view_module_map.js";

export default(function mapFirst(){

    $(document).ready(function($){
        showMapView();
    })

    var mapViewLogicModule= {};
    var gInitialized = false;
    var map;
    var gResult;

    var gMapViewModule;

    mapViewLogicModule.init = function(){
        console.log('mapViewLogicModule.init()');
        
        if(!gInitialized){
            return console.log('module already initalized!');
        }

        gInitialized = true;

        showMapView();

    }


    function showMapView(){
        initMapViewModule();
    }

    function initMapViewModule(){
        gMapViewModule = new MapViewModule($('.geo-map'));
        map = gMapViewModule.init();
    }

    $('#searchBtn').on('click',function(){
        console.log("click searchBtn");
        mapViewSearch();
    })

    function mapViewSearch(){
        console.log("mapViewSearch()");
      
        const selectedPrjList = [];
        const selectedSignList = [];
      
        var sidoCd, sigCd, startDate, endDate, sidoList, sigList, selectedList, 
            signTyList, updtYn, signList, startDateVal, endDateVal;
      
        selectedList = document.getElementById('prj_list');
      
        if(!selectedList.disabled){
          for(var i = 0; i<selectedList.length;i++){
            if(selectedList.options[i].selected){
              var value = selectedList.options[i].value;
              selectedPrjList.push(Number(value));
            }
          }
        }
      
        sidoList = document.getElementById('sido_list');
        sigList = document.getElementById('sig_list');
      
        if(!sidoList.disabled){
          for(var i = 0; i<sidoList.length;i++){
            if(sidoList.options[i].selected){
              sidoCd =sidoList.options[i].value;
            }
          }
        }else{
          sidoCd = null;
        }
      
        if(!sigList.disabled){
          for(var i = 0; i<sigList.length;i++){
            if(sigList.options[i].selected){
              sigCd = sigList.options[i].value;
            }
          }
        }else{
          sigCd = null;
        }
      
        signTyList = document.getElementsByClassName('signTy');
        for(var i = 0 ; i<signTyList.length;i++){
          signList = document.getElementsByName(signTyList[i].id);
          for(var j = 0; j<signList.length; j++){
            if(signList[j].checked){
              selectedSignList.push(signList[j].value);
            }
          }
        }
      
        startDate = document.getElementById('start-date');
        endDate = document.getElementById('end-date');
        
        if(!startDate.disabled){
          startDateVal = startDate.value;
        }else{
          startDateVal = null;
        }
      
        if(!endDate.disabled){
          endDateVal = endDate.value;
        }else{
          endDateVal = null;
        }
      
        updtYn = document.getElementById('updtYn').checked;
      
        if(selectedSignList==""){
          alert("객체를 하나 이상 선택하세요!");
        }else{
          if(selectedPrjList == ''){
            var apiUrl = '/api/map/searchMapRegion';
            var data = {
              "sidoCd" : sidoCd,
              "sigCd" : sigCd,
              "SignList" : selectedSignList,
              "startDate" : startDateVal,
              "endDate" : endDateVal,
              "updtYn" : updtYn
            };
            ajaxMapSearch(apiUrl, data);
          }else if(sidoCd == null && sigCd == null){
            var apiUrl = '/api/map/searchMapPrj';
            var data = {
              "PrjList" : selectedPrjList,
              "SignList" : selectedSignList,
              "updtYn" : updtYn
            };
            ajaxMapSearch(apiUrl, data);
          }
        }
      }
      
    function ajaxMapSearch(urlPath, dataSet){
      $.ajax({
        url: urlPath,
        type: 'POST',
        data: dataSet,
        dataType: 'JSON',
        success: function(result){
          gResult = result;

          if(result.length == 0){
            alert("객체가 없습니다.")
          }
          console.log(result);
          gMapViewModule.removeMarker();
          gMapViewModule.setMarker(map, result);
          gMapViewModule.setBounds();


          for(var i=0, ii=gMapViewModule.markers.length; i<ii; i++){
            naver.maps.Event.addListener(gMapViewModule.markers[i], 'dblclick', onDridDblClick(i));
          }

        },
        error: function(data, textStatus, errorThrown){
          console.log("ajaxMapSearch ajax() - fail");
          callback(data);
        }
      }); 
    }

    function onDridDblClick(seq){
      return function(e){
        console.log(seq+", "+gResult[seq].sign_nm);
        dataView.init("dataViewModal", dataView.MOD_OBJ, gResult[seq]);
        const imgPrev = document.getElementById('imgNavPrev');
        const imgNext = document.getElementById('imgNavNext');
        imgPrev.remove();
        imgNext.remove();
      }
    }



    return mapViewLogicModule;
})();
