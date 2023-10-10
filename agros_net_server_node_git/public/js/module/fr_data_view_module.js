import MapModule from './fr_map_module.js';

export default (function () {
  var dataViewModule = {};

  dataViewModule.MOD_IMG = 'MOD_IMG'
  dataViewModule.MOD_LAS = 'MOD_LAS'
  dataViewModule.MOD_OBJ = 'MOD_OBJ'

  var gMode = null;
  var gData = null;
  var gInitialized = false;
  var gModalId = null;

  var gMapModule;

  var gImgaViewer = null;

  // navTo
  let gNavOption = null;
  const NAV_TO_PREV = 'PREV';
  const NAV_TO_NEXT = 'NEXT';


  dataViewModule.init = function (modalId, mode, data, navOption) {
    console.log('dataViewModule.init - mode : ' + mode + ', data =>');
    console.dir(data);

    gModalId = modalId;

    // navTo
    gNavOption = navOption;

    if (!mode || !data) {
      return console.log('dataViewModule.init failed - param invalid');
    }

    $('#' + gModalId).removeClass('display-none');

    gMode = mode;
    _setView(gMode);
    setData(data);

    _setBtnEvent();
    // _setMapMarker();
    gInitialized = true;
  }

  function _setView(mode) {
    if (mode != dataViewModule.MOD_IMG) {
      $('#dataViewImg').remove();
    }
    if (mode != dataViewModule.MOD_LAS) {
      $('#dataViewLas').remove();
    }
    if (mode != dataViewModule.MOD_OBJ) {
      $('#dataViewObj').remove();
    }
  }

  function setData(data) {
    if (!data) {
      return 'setData Failed!';
    }

    gData = data;

    if (gMode == dataViewModule.MOD_IMG) {
      return _setImgData(data);
    } else if (gMode == dataViewModule.MOD_LAS) {
      return _setLasData(data);
    } else {
      return _setObjData(data);
    }
  }

  function destroy() {
    console.log('destroy data view');

    // var imgTag = $('#dataImg');
    // console.dir(imgTag)

    $('#dataImg')[0].exifdata = null;

    // $('.excd-map').addClass('display-none');
    $('#' + gModalId).addClass('display-none');

    //navTo 
    if (gNavOption) {
      return location.href = gNavOption.returnUrl + '#read/' + getNavFilterString();
    }

    gModalId = null;
    gMode = null;
    gData = null;
    gInitialized = false;

    if (gMapModule) {
      gMapModule.destroyMap();
      gMapModule = null;
    }

  }

  function _setImgData(data) {
    $('#dataImg').attr("src", getStaticUrl(data.data_file_path));
    $('#dataImg').one("load", _getExif);

    _setImageViewer(data);

    $('.contents-data-meta input').val('');

    $('input[name=dataPhotoId]').val(data.photo_id);
    $('input[name=dataPrjId]').val(data.prj_id);
    $('input[name=dataPrjNm]').val(data.prj_nm);
    $('input[name=dataRegTypeNm]').val(data.data_reg_ty_nm);
    $('input[name=dataFileNm]').val(data.org_file_nm);
    $('input[name=dataRegEndDt]').val(new Date(data.data_reg_dt).format('yy-MM-dd / hh:mm'));
    $('input[name=dataPrcsEndDt]').val(data.prcs_end_dt ? new Date(data.prcs_end_dt).format('yy-MM-dd / hh:mm') : '미완료');
    $('input[name=dataLat]').val(data.latitude);
    $('input[name=dataLng]').val(data.longtitude);
    $('input[name=dataAlt]').val(data.altitude);
    $('input[name=dataUtmX]').val(data.utm_x);
    $('input[name=dataUtmY]').val(data.utm_y);
    $('input[name=dataPitch]').val(data.pitch);
    $('input[name=dataRoll]').val(data.roll);
    $('input[name=dataYaw]').val(data.yaw);


    $('.excd-map').addClass('display-none');
  }

  function _setLasData(data) {
    $('.contents-data-meta input').val('');

    $('input[name=dataLasId]').val(data.las_id);
    $('input[name=dataPrjId]').val(data.prj_id);
    $('input[name=dataPrjNm]').val(data.prj_nm);
    $('input[name=dataRegTypeNm]').val(data.data_reg_ty_nm);
    $('input[name=dataFileNm]').val(data.org_file_nm);
    $('input[name=dataRegEndDt]').val(new Date(data.data_reg_dt).format('yy-MM-dd / hh:mm'));
    $('input[name=dataPrcsEndDt]').val(data.prcs_end_dt ? new Date(data.prcs_end_dt).format('yy-MM-dd / hh:mm') : '미완료');
    $('textarea[name=dataGetArea]').val(data.ar_text && data.ar_text.length > 0 ? data.ar_text : '데이터 없음');

    // _setLasGeoJson(data);
    _setLasBtn();
    _setLasLatLng(data);
  }

  function _setLasLatLng(data) {
    $.ajax({
      url: '/api/data/lidar/img?prjId=' + data.prj_id + '&fileNm=' + data.org_file_nm,
      type: 'GET',
      dataType: 'JSON',
      success: function (result) {
        if (!result.success) {
          console.log('ajax error : ' + result.msg);
          return;
        }

        console.log('ajax succeed');
        console.dir(result);

        data.latitude = result.data.latitude;
        data.longtitude = result.data.longtitude;

        $('input[name=dataLat]').val(data.latitude);
        $('input[name=dataLng]').val(data.longtitude);

        _setMapMarker();
        // runToastr('success', '사업정보가 삭제 되었습니다.');
        // return;
      },
      error: function () {
        console.log('ajax error');
      }
    });
  }

  function setPreProObjData(data) {
    data.updatStr = '';

    switch (data.updt_yn) {
      case 1:
        data.updatStr = '추가';
        break;
      case 2:
        data.updatStr = '수정';
        break;
      case 3:
        data.updatStr = '삭제';
        break;
      case 4:
        data.updatStr = '유지';
        break;
    }

    data.bbox = [data.lh_x, data.lh_y, data.rl_x, data.rl_y];

    var regex = /POINT\(([-]?[\d.]+) ([-]?[\d.]+)\)/;
    var matches = data.point.match(regex);

    if (matches && matches.length === 3) {
      // console.log(matches);
      data.longtitude = parseFloat(matches[1]);
      data.latitude = parseFloat(matches[2]);
    }

    return data;
  }

  function _setImageViewer(data) {
    if (gImgaViewer) {
      gImgaViewer.destroy();
    }

    // 이미지 로드
    let imgUrl = getStaticUrl(data.data_file_path);

    var viewer = OpenSeadragon({
      id: "imageViewer", // 뷰어를 표시할 엘리먼트의 ID를 지정합니다.
      prefixUrl: "/public/libs/openseadragon-bin-4.1.0/images/",
      tileSources: {
        type: 'image',
        url: imgUrl,
      },
    });

    viewer.addHandler("tile-loaded", function(event) {
      var originalWidth = event.tiledImage.source.dimensions.x;
      var originalHeight = event.tiledImage.source.dimensions.y;
      console.log("Original Image Width:", originalWidth, "pixels");
      console.log("Original Image Height:", originalHeight, "pixels");

      let ovrRect = {
        x : data.lh_x / originalWidth,
        y : (originalHeight - data.lh_y ) / originalWidth,
        width : (data.rl_x - data.lh_x) / originalWidth,
        height : (data.lh_y - data.rl_y) / originalWidth
      }

      // console.log(ovrRect);

        // 사각형 오버레이 생성
      var overlay = {
        element: document.createElement("div"),
        // location: new OpenSeadragon.Rect(0, 0, 1, 0.75), // 왼쪽 상단 모서리의 비율 위치와 사각형 크기 설정
        location: new OpenSeadragon.Rect(ovrRect.x, ovrRect.y, ovrRect.width, ovrRect.height), // 왼쪽 상단 모서리의 비율 위치와 사각형 크기 설정
        placement: OpenSeadragon.Placement.BOTTOM_LEFT, // 오버레이 위치 설정
      };

      // 오버레이 스타일 설정
      overlay.element.style.border = "2px solid red";

      // 오버레이 추가
      viewer.addOverlay(overlay);

      
      // var tile = event.tile;
      // var image = tile.getImage();
    
      // let imgEl = event.tiledImage.source;
      // _getExifFromImgEl(imgEl);
    });

    gImgaViewer = viewer;

  }
  

  function _setObjData(data) {
    data = setPreProObjData(data)

    // $('#dataImg').attr("src", getStaticUrl(data.data_file_path));
    _setImageViewer(data);
    $('#dataImg').attr("src", getStaticUrl(data.data_file_path));
    $('#dataImg').one("load", _getExif);

    $('.contents-data-meta input').val('');

    $('input[name=dataObjId]').val(data.obj_rs_id);
    $('input[name=dataObjNm]').val(data.sign_nm);
    $('input[name=dataObjPrjNm]').val(data.prj_nm);
    $('input[name=dataObjPhotoId]').val(data.photo_id);
    $('input[name=dataObjFileNm]').val(data.org_file_nm);
    $('input[name=dataObjDlModel]').val(data.dlm_id);
    $('input[name=dataObjSignCd]').val(data.cd);
    $('input[name=dataObjSignTy]').val(data.trffc_sign_ty_nm);
    $('input[name=dataObjSignNm]').val(data.sign_nm);

    $('#signImg').attr("src", getStaticUrl(data.sign_img_file_path));

    // $('input[name=dataObjClctDate]').val(new Date(data.clct_ymd).format('yy-MM-dd / hh:mm'));
    // $('input[name=dataObjJobDate]').val(new Date(data.job_ymd).format('yy-MM-dd / hh:mm'));

    $('input[name=dataLat]').val(data.latitude);
    $('input[name=dataLng]').val(data.longtitude);

    $('input[name=dataUpdt]').val(data.updatStr);

    $('textarea[name=dataObjBbox]').val(data.bbox);

    $('.excd-map').addClass('display-none');
  }

  function _setObjSvg() {
    if (!gData.svg) return;

    console.log('_setObjSvg - svg : ' + gData.svg);

    let naturalWitdh = $('#dataImg')[0].naturalWidth;
    let naturalHeight = $('#dataImg')[0].naturalHeight;
    console.log('naturalWitdh : ' + naturalWitdh + ', naturalHeight : ' + naturalHeight);

    // var width = $img.width();
    var width = $(this).width();
    var height = $(this).height();

    console.log('dataImg loaded - width : ' + width + ', height: ' + height);

    let svgEl = document.querySelector('#svgLabling');
    svgEl.setAttribute('viewBox', "0 -1536 2048 1536");

    var $svg = $('#svgLabling');
    $svg.attr('width', width);
    $svg.attr('height', height);
    // $svg.attr('viewBox', '0 -' + naturalHeight + ' ' + naturalWitdh + ' ' + naturalHeight + '');
    // $svg.attr('viewBox', "0 -1536 2048 1536");      

    // console.log("data.svg : " + g.svg);

    $svg.html('<path d="' + gData.svg + '" />');
  }

  function _setLasBtn() {
    $('#hide-map').addClass('display-none');
  }

  function _setLasGeoJson(data) {
    gMapModule = new MapModule($('.excd-map'));

    try {
      var geoJson = JSON.parse(data.geojson);

      gMapModule.setGeoJson(geoJson);
      gMapModule.init();
    } catch (e) {
      console.dir(e);
    }
  }

  // function _getExif(elId) {
  function _getExif() {
    console.log('getExif()')

    // var img1 = document.getElementById(elId);
    // var img1 = this;
    EXIF.getData(this, function () {
      var exif = {};

      var all = EXIF.getAllTags(this);
      // console.log( JSON.stringify(all, null, "\t") );

      console.dir(all);

      try {
        var lat = EXIF.getTag(this, "GPSLatitude");
        // console.dir(lat);
        exif.lat = String(lat[0]) + '.' + String(lat[1]) + (String(lat[2]).replace('.', ''));

        var long = EXIF.getTag(this, "GPSLongitude");
        exif.long = String(long[0]) + '.' + String(long[1]) + (String(long[2]).replace('.', ''));

        exif.alt = Number(EXIF.getTag(this, "GPSAltitude"));

        var gpsDir = EXIF.getTag(this, "GPSImgDirectionRef");
        // console.dir(gpsDir);
        var imu = JSON.parse("[" + gpsDir + "]");

        exif.roll = imu[0];
        exif.pitch = imu[1];
        exif.yaw = imu[2];

        var comment = EXIF.getTag(this, "UserComment");
        // console.log('comment : ' + comment );

        var utmArray = JSON.parse('[' + comment + ']');

        utmArray = utmArray.slice(8);
        // console.log('utmArray =>');
        // console.dir(utmArray);

        var utmString = '';
        utmArray.forEach(code => {
          utmString += String.fromCharCode(code);
        })

        // utmString.trim().replace(' ', '');
        // utmString = utmString.replaceAll(' ', '');
        // utmString = utmString.replaceAll('?', 'null');
        // utmString = '{' + utmString + '}';

        // console.log('utmString : ' + utmString);

        utmString = utmString.slice(utmString.search('UTM:') + 4);
        // console.log('utmString : ' + utmString);

        exif.utm = JSON.parse('[' + utmString + ']');

      } catch (ex) {
        console.dir(ex);
      }

      // console.log('exif => ');
      // console.dir(exif);

      if (!gData.latitude) {
        _setExifData(exif);
      } else {
        $('.contents-data-meta input').removeClass('exif');
      }

    });

  }

  
  function _setExifData(exif) {
    // console.log('_setExifData');

    try {
      $('input[name=dataLat]').val(exif.lat);
      $('input[name=dataLat]').addClass('exif');

      $('input[name=dataLng]').val(exif.long);
      $('input[name=dataLng]').addClass('exif');

      $('input[name=dataAlt]').val(exif.alt);
      $('input[name=dataAlt]').addClass('exif');

      $('input[name=dataUtmX]').val(exif.utm[0]);
      $('input[name=dataUtmX]').addClass('exif');

      $('input[name=dataUtmY]').val(exif.utm[1]);
      $('input[name=dataUtmY]').addClass('exif');

      $('input[name=dataPitch]').val(exif.pitch);
      $('input[name=dataPitch]').addClass('exif');

      $('input[name=dataRoll]').val(exif.roll);
      $('input[name=dataRoll]').addClass('exif');

      $('input[name=dataYaw]').val(exif.yaw);
      $('input[name=dataYaw]').addClass('exif');
    } catch (e) {
      // console.dir(e);
    }

  }

  function _setBtnEvent() {
    $("#btnPrjInfo").off('click');
    $("#btnPrjInfo").on('click', function () {
      console.log("click");
      console.dir(gData);

      if (!gData) return;

      location.href = '/data/view/prj/' + gData.prj_id;
    })

    $('#view-map').off('click');
    $('#view-map').on('click', function () {
      console.log("viewMap");

      $('.excd-map').removeClass('display-none');

      if (gMode != dataViewModule.MOD_LAS) {
        _setMapMarker();
      }

      // var lat = $('input[name=dataLat]').val();
      // var long = $('input[name=dataLng]').val();

      // var latLon = null;
      // if (lat) {
      //   latLon = {
      //    lat : Number(lat),
      //    long : Number(long)
      //  }
      // }
      // gMapModule = new MapModule($('.excd-map'));
      // gMapModule.setMarker(latLon);
      // gMapModule.init();
    })

    $('#closeBtn').one('click', destroy);
    $('#btnConfirm').one('click', destroy);

    // navTo
    $('.img-nav').off('click');
    $('#imgNavPrev').on('click', () => {
      if (gNavOption) getNavTo(NAV_TO_PREV);
    })

    $('#imgNavNext').on('click', () => {
      if (gNavOption) getNavTo(NAV_TO_NEXT);
    })
  }

  function _setMapMarker() {
    console.log('_setMapMarker()');
    var lat = $('input[name=dataLat]').val();
    var long = $('input[name=dataLng]').val();

    var latLon = null;
    if (lat) {
      latLon = {
        lat: Number(lat),
        long: Number(long)
      }
    }
    gMapModule = new MapModule($('.excd-map'));
    gMapModule.setMarker(latLon);
    gMapModule.init();
  }

  // navTo
  async function getNavTo(navTo) {
    console.log('getNavTo : ' + navTo);
    console.dir(gNavOption);

    const pageContents = gNavOption.contents;

    let index = getNavPageIdx(pageContents, gData);
    navTo == NAV_TO_PREV ? index-- : index++;

    console.log('selected index : ' + index);


    if (index >= 0 && index < pageContents.length) {
      // dataView.init("dataViewModal", dataView.MOD_IMG, gCurPageData.contents[index]);
      return setData(pageContents[index]);
    }

    // console.log('need req');

    try {
      let curData = await reqNavToPage(navTo);
      setData(curData);
    } catch (e) {
      runToastr('error', e);
    }
  }


  function getNavPageIdx(pageContents, curData) {
    for (let i = 0; i < pageContents.length; i++) {
      if (pageContents[i][gNavOption.key] == curData[gNavOption.key]) {
        return i;
      }
    }

    return -1;
  }


  function reqNavToPage(navTo) {
    return new Promise((resolve, reject) => {

      if (!gNavOption) return reject('no nav data');

      let navToPage = navTo == NAV_TO_PREV ? gNavOption.reqParams.page - 1 : gNavOption.reqParams.page + 1;
      let lastPage = Math.ceil(gNavOption.totalCount / gNavOption.reqParams.perPage);

      console.log('lastPage : ' + lastPage);

      if (navToPage < 1) return reject('첫번째 데이터 입니다.')
      if (navToPage > lastPage) return reject('마지막 데이터 입니다.')

      let queryStr = '?' + getNavFilterString(navToPage)

      console.log('requesting : ' + queryStr);

      $.ajax({
        url: gNavOption.reqUrl + queryStr,
        type: 'GET',
        dataType: 'JSON',
        success: function (result) {
          console.log(result);

          if (!result.result) {
            return reject(result.msg);
          }

          gNavOption.reqParams.page = result.data.pagination.page;
          gNavOption.contents = result.data.contents;

          const curData = navTo == NAV_TO_PREV ? gNavOption.contents[gNavOption.contents.length - 1] : gNavOption.contents[0];
          return resolve(curData);
        },
        error: function () {
          console.log('ajax error');
          return reject('데이터를 가져오지 못했습니다.');
        }
      });

    });
  }

  function getNavFilterString(navToPage) {
    let queryStr = 'page=' + (navToPage ? navToPage : gNavOption.reqParams.page);
    queryStr += '&perPage=' + gNavOption.reqParams.perPage;

    if (gNavOption.reqParams.filter_value) {
      queryStr += '&filter_type=' + gNavOption.reqParams.filter_type;
      queryStr += '&filter_value=' + gNavOption.reqParams.filter_value;
    }

    if (gNavOption.reqParams.sortColumn) {
      queryStr += '&sortColumn=' + gNavOption.reqParams.sortColumn;
      queryStr += '&sortAscending=' + gNavOption.reqParams.sortAscending;
    }

    queryStr += '&curItemId=' + gData[gNavOption.key];

    return queryStr;
  }

  return dataViewModule;
})();