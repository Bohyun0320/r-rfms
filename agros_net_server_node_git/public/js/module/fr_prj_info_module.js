import ExcdFilebox from './fr_filebox_module.js';
import MapModule from './fr_map_module.js';

// var prjInfoApi = (function () {
// export const prjInfoApi = (function () {
export default (function () {
  const MOD_INFO_NEW = 'MOD_INFO_NEW';
  const MOD_INFO_CREATED = 'MOD_INFO_CREATED';
  const MOD_INFO_VIEW = 'MOD_INFO_VIEW';
  const MOD_INFO_EDIT = 'MOD_INFO_EDIT';

  var prjInfoModule = {};
  var gInfoMode = MOD_INFO_NEW;
  var gPrjInfo;
  var gInitialized = false;

  var gFileBoxCam;
  var gFileBoxLidar;
  var gFileBoxMeta;

  var gCamPagination;
  var gLidarPagination;
  var gMetaPagination;

  var gMapModule;


  prjInfoModule.init = function () {
    console.log('prjInfoModule.init()');

    if (gInitialized) {
      return console.log('module already initailized!')
    }

    gInitialized = true;

    pnuApi.init(pnuCode, $('select[name=sido]'), $('select[name=sigungu]'), null, $('input[name=pnucd]'));
    initFileBox();
    initSelect();

    setModeBtnBar();
    btnInit();
    inputInit();

    console.dir(userList);

    // console.dir(sensList);
    // setProgressVisible('uploadProgress', true);
    // setProgressCircle('uploadProgress', 0);
  }

  prjInfoModule.setMode = function (mode, prjInfo) {
    console.log('prjInfoModule.setMode() - mode :' + mode);
    gInfoMode = mode;

    if (gInfoMode != MOD_INFO_NEW && prjInfo) {
      setSelectEnable();
      setPrjInfo(prjInfo);
      getDataPackage();
    }

    setInputEnabled();
    setModeBtnBar();
    setModeFormUrl();
    setModePagenation();

    extBtnInit();
  }

  function setSelectEnable() {
    $('select option').prop('disabled', false);
  }


  function setPrjInfo(prjInfo) {
    gPrjInfo = prjInfo;
    console.dir(prjInfo);

    if (!gPrjInfo) {
      return console.log('setPrjInfo() - setPrjInfo is null')
    }

    $("input[name = prjid]").val(prjInfo.prj_id);
    $("input[name = name]").val(prjInfo.prj_nm);
    $("input[name = prjno]").val(prjInfo.prj_no);

    $("select[name = vhid]").val(prjInfo.vh_id);
    
    $("select[name = camsensid]").val(prjInfo.cam_sens_id);
    $("select[name = lidarsensid]").val(prjInfo.lidar_sens_id);
    $("select[name = sensSetId]").val(prjInfo.sens_set_id);

    if (prjInfo.cam_sens_id < 0 && prjInfo.lidar_sens_id < 0) {
      $("#sensCamSelect").addClass('display-none');
      $("#sensLidarSelect").addClass('display-none');
      $("#sensSetSelect").removeClass('display-none');
    }else {
      $("#sensCamSelect").removeClass('display-none');
      $("#sensLidarSelect").removeClass('display-none');
      $("#sensSetSelect").addClass('display-none');
    }


    $("select[name = owner]").val(prjInfo.sv_user_id);

    $("textarea[name = memo]").val(prjInfo.prj_memo_cn);

    $('.prj-ext-info').removeClass('display-none');

    // if (prjInfo.prcs_strt_dt) {
    //   $('.prcs-start').html(new Date(prjInfo.prcs_strt_dt).format('yy-MM-dd / HH:mm'));
    // }
    
    // if (prjInfo.prcs_end_dt) {
    //   $('.prcs-end').html(new Date(prjInfo.prcs_end_dt).format('yy-MM-dd / HH:mm'));
    // }

    pnuApi.setPnuCd(prjInfo.pnu_cd);

    setPrjStts(prjInfo);
    setPrjSttsBtn(prjInfo);
  }

  function setPrjStts(prjInfo) {
    if (prjInfo.prj_stts_cd) {
      console.log(prjInfo.prj_stts_cd);
      if (prjInfo.prj_stts_cd >= 5) {
        $('.process-item').addClass('active')
      }else {
        
        $('.process-item:nth-child(' + (prjInfo.prj_stts_cd +1) + ')').prevAll().addClass('active')
      }
    }

    // $('.process-item').children().remove();

    // if (gPrjInfo.prj_crt_dt) {
    //   var $prscInfo = $('<div />', {
    //     class: 'process-info',
    //     text: new Date(gPrjInfo.prj_crt_dt).format('yy-MM-dd HH:mm'),
    //   });
    //   $('.process-item:nth-child(1)').append($prscInfo);
    // }

    // if (gPrjInfo.data_clct_dt) {
    //   var $prscInfo = $('<div />', {
    //     class: 'process-info',
    //     text: new Date(gPrjInfo.data_clct_dt).format('yy-MM-dd HH:mm'),
    //   });

    //   $('.process-item:nth-child(2)').append($prscInfo);
    // }
  }

  function setPrjSttsBtn(prjInfo) {
    $('.btn-process-start').addClass('btn-disabled');

    if (!prjInfo) return;
    // console.log('setPrjSttsBtn : ' + prjInfo.prj_stts_cd);
    console.log(prjInfo);

    if (prjInfo.prj_stts_cd >= 2 && prjInfo.prj_stts_cd < 5) {
      $('.process-item:nth-child(3)').find('.btn-process-start').removeClass('btn-disabled');
    }

    if (prjInfo.prj_stts_cd >= 3 && prjInfo.prj_stts_cd < 5) {
      $('.process-item:nth-child(4)').find('.btn-process-start').removeClass('btn-disabled');
    }
  }

  function setInputEnabled() {
    var disabled = false;

    if (gInfoMode == MOD_INFO_VIEW || gInfoMode == MOD_INFO_CREATED) {
      disabled = true;
    }

    console.log('setInputEnabled() - disabled : ' + disabled);

    $('input[name = name]').attr('readonly', disabled);
    $('input[name = prjno]').attr('readonly', disabled);
    $('input[name = pnucd]').attr('readonly', disabled);
    $('input[name = weathercd]').attr('disabled', disabled);
    $('select[name = sido]').attr('disabled', disabled);
    $('select[name = sigungu]').attr('disabled', disabled);
    $('select[name = vhid]').attr('disabled', disabled);
    $('select[name = camsensid]').attr('disabled', disabled);
    $('select[name = lidarsensid]').attr('disabled', disabled);
    $('select[name = sensSetId]').attr('disabled', disabled);
    $('select[name = owner]').attr('disabled', disabled);
    $('textarea[name = memo]').attr('readonly', disabled);

    // $('input[name = autostart]').attr('disabled', disabled);

    if (disabled) {
      $('.excd-mandatory').addClass('display-none');
    }else {
      $('.excd-mandatory').removeClass('display-none');
    }
    
    // fileBox Settings
    if (gInfoMode == MOD_INFO_CREATED || gInfoMode == MOD_INFO_EDIT) {
      $('#prj-data-form').removeClass('excd-disabled');
    } else {
      $('#prj-data-form').addClass('excd-disabled');
    }

    // fileBox Message
    if (gInfoMode != MOD_INFO_NEW) {
      $('.contents-group-msg').addClass('display-none')
    }
  }

  // function setUser(email) {
  //   // console.log('function _setUser - email : ' + email);
  //   // console.dir(userList);

  //   for (i = 0; i < userList.length; i++) {
  //     if (userList[i].sv_user_id == email) {
  //       $("select[name='owner']").val(userList[i].sv_user_id);
  //       console.log('_setUser selected!');
  //       return;
  //     }
  //   }

  //   console.log('_setUser not matched !');
  // }

  // function setVhId(vhId) {
  //   for (i = 0; i < vhList.length; i++) {
  //     if (vhList[i].vh_id == vhId) {
  //       $("select[name='vhid']").val(vhList[i].vh_id);
  //       console.log('setVhId selected!');
  //       return;
  //     }
  //   }

  //   console.log('setVhId not matched !');
  // }

  function setModeBtnBar() {
    console.log('_setBtnBar() - gInfoMode : ' + gInfoMode);

    $('.info-module-btnbar').addClass('display-none');

    if (gInfoMode == MOD_INFO_NEW ) {
      $('#infoBtnbarNew').removeClass('display-none');
    }
    if (gInfoMode == MOD_INFO_VIEW || gInfoMode == MOD_INFO_CREATED) {
      $('#infoBtnbarView').removeClass('display-none');
    }
    if (gInfoMode == MOD_INFO_EDIT) {
      $('#infoBtnbarEdit').removeClass('display-none');
    }
  }

  function setModeFormUrl() {
    var url = '/api/data/add/prj';

    if (gInfoMode == MOD_INFO_EDIT) {
      url = '/api/data/update/prj';
    }
    $('#prj-form').attr('action', url);

    // set prjID to data url 
    if (gInfoMode != MOD_INFO_EDIT) {
      var prjID = $('input[name="prjid"]').val();
      var dataUrl = $('#prj-data-form').attr('action');

      $('#prj-data-form').attr('action', dataUrl += '/' + prjID);
    }

  }

  function setModePagenation() {
    if (gInfoMode == MOD_INFO_EDIT) {
      $('.excd-page-filebox').addClass('display-none');
    }else {
      $('.excd-page-filebox').removeClass('display-none');      
    }
  }

  function inputInit() {
    $('input[name=weathercd][value="1"]').prop('checked', true);
  }

  function btnInit() {
    $('#cancel').on('click', function () {
      if (confirm('프로젝트 생성을 취소 하시겠습니까?')) {
        return history.back();
      }
    })

    $('#submit').on('click', function () {
      return prjInfoModule.submit();
    })

    $('#back').on('click', function () {
      // return history.back();
      return location.href = document.referrer;
    })

    $('#edit').on('click', function () {
      return prjInfoModule.setMode(MOD_INFO_EDIT);
    })

    $('#cancelUpdate').on('click', function () {
      if (confirm('업데이트를 취소 하시겠습니까?')) {
        setPrjInfo(gPrjInfo);
        return prjInfoModule.setMode(MOD_INFO_VIEW);
      }
    })

    $('#update').on('click', function () {
      return prjInfoModule.submit();
    })

    // fileBox
    $('#cancelData').on('click', function () {
      if (confirm('데이터 업로드를 취소 하시겠습니까?')) {
        console.log('cancel data');
      }
    })

    $('#uploadData').on('click', function () {
      return prjInfoModule.uploadData();
    })

    $('#btn_prj_data_cam').on('click', function () {
      return location.href = '/data/list/cam#read/filter_type=p.prj_id&filter_value=' + gPrjInfo.prj_id;
    })
    
    $('#btn_prj_data_lidar').on('click', function () {
      return location.href = '/data/list/lidar#read/filter_type=p.prj_id&filter_value=' + gPrjInfo.prj_id;
    })

    $('#prj-delete').on('click', function () {
      return deletePrj();
    })

    $('#view-map').on('click', function() {
      return showMap();
    })
    
    $('#btn_meta_sync').on('click', function() {
      return syncMetaData();
    })

    $('#startPrjData').on('click', function() {
      console.log('startPrjData cliked') ;
      _startDataProc();
    })

    $('#startPrjEdit').on('click', function() {
      // const editUrl = "edit.excute.r-rfms.geostory.kr://" + gPrjInfo.prj_id;
      const editUrl = "edit.r-rfms.geostory.kr://" + gPrjInfo.prj_id;
      console.log('startPrjEdit cliked : ' + editUrl) ;

      location.href=editUrl;
    })
    
  }

  function _startDataProc() {
    var data = {
      prjId : gPrjInfo.prj_id
    }

    $.ajax({
      url : '/api/data/proc/start',
      type : 'post',
      data : data,
      dataType : 'JSON',
      success : function(result) {
        if (!result.success) {
          return runToastr('error', result.msg);
        }

        console.dir(result.data);
        setPrjInfo(result.data);

        return runToastr('success', '데이터 처리가 시작 되었습니다.');
      },
      error : function() {
        runToastr('error', '오류가 발생 했습니다.');
      }
    });
  }

  function extBtnInit() {
    if (gInfoMode != MOD_INFO_NEW && gPrjInfo) {
      $('#btn_prj_data').addClass('always-enabled');
    }
  }

  function checkPrjField() {
    if (!$("input[name='name']").val()) {
      runToastr('error', '프로젝트명을 입력해 주세요.');
      return false;
    }

    if ($("input[name='name']").val().length > 40) {
      runToastr('error', '40자 이하의 프로젝트 번호를 입력해 주세요');
      return false;
    }

    if (!$("input[name='prjno']").val()) {
      runToastr('error', '프로젝트 번호를 입력해 주세요.');
      return false;
    }

    // if ($("input[name='prjno']").val().length == 0 ||
    //   $("input[name='prjno']").val().length > 16) {
    //   runToastr('error', '16자 이하의 프로젝트 번호를 입력해 주세요');
    //   return false;
    // }

    // console.log('owner : ' + $("select[name='owner']").val());

    // if ($("select[name='owner']").val().length > 40) {
    //   runToastr('error', '관리자를 지정해 주세요');
    //   return false;
    // }

    if ($("textarea[name='memo']").val() && $("textarea[name='memo']").val().length > 160) {
      $("#email").focus();
      runToastr('error', '160자 이하의 메모를 입력해 주세요.');
      return false;
    }

    if (!$("select[name='vhid']").val() || $("select[name='vhid']").val() == -1) {
      $("select[name='vhid']").focus();
      runToastr('error', '선택 가능한 차량을 선택해 주세요.');
      return false;
    }

    // if (!$("select[name='sensSetId']").val() || $("select[name='sensSetId']").val() == -1) {
    //   $("select[name='sensSetId']").focus();
    //   runToastr('error', '선택 가능한 센서를 선택해 주세요.');
    //   return false;
    // }




    return true;
  }

  function initFileBox() {
    gFileBoxCam = new ExcdFilebox($('#cam-file-box'), 'cam_file', 'image/*, .zip', $('#prj-data-count-cam'));
    gFileBoxCam.init();
    gCamPagination = initFilePagination('cam_file', 'pageCam', gFileBoxCam);
    
    gFileBoxLidar = new ExcdFilebox($('#lidar-file-box'), 'lidar_file', '.las, .rlf, .zip', $('#prj-data-count-lidar'));
    gFileBoxLidar.init();
    gLidarPagination = initFilePagination('lidar_file', 'pageLidar', gFileBoxLidar);
    
    gFileBoxMeta = new ExcdFilebox($('#meta-file-box'), 'meta_file', '.csv', $('#prj-data-count-meta'));
    gFileBoxMeta.init();
    gMetaPagination = initFilePagination('meta_file', 'pageMeta', gFileBoxMeta);
    
  }

  function initSelect() {
    console.log('initSelect()');
    let selVh = $('select[name=vhid]');

    selVh.change(() => {
      const vhId = Number(selVh.val());
      console.log('vhId selected : ' + vhId);

      // console.dir(sensList);

      const findSens = sensList.find(el => {return el.vh_id == vhId && el.sens_ty == 3 && el.cond_cd ==1});
      // console.dir(find);

      if (findSens) {
        console.log('find');
        $('select[name=sensSetId]').val(findSens.sens_id);
        console.log('selected : ' + $('select[name=sensSetId]').val());
        console.dir(findSens);
      }else {
        console.log('not found');
        console.dir(sensList);
      }

    });
    
  }

  function initFilePagination(dataType, elId, fileBox) {
    var pagination = new tui.Pagination(elId, {
      // totalItems: 100,
      itemsPerPage: 10,
      visiblePages: 10,
      page: 1,
      centerAlign: false,    
    });

    pagination.on('beforeMove', function(evt) {
      var ePage = evt.page;

      console.log('type : ' + dataType + ', ePage : ' + ePage);

      if (fileBox) {
        var option = {
          page : ePage,
          perPage : 10
        }

        var prjId = $('input[name=prjid]').val();

        fileBox.getDataPackage(prjId, option);
      }


    });

    return pagination;


  }

  function getDataPackage() {
    const prjId = $('input[name=prjid]').val();

    console.log('prjid : ' + prjId);

    gFileBoxCam.getDataPackage(prjId, {page : 1, perPage: 10, pagination : gCamPagination});
    gFileBoxLidar.getDataPackage(prjId, {page : 1, perPage: 10, pagination : gLidarPagination});
    gFileBoxMeta.getDataPackage(prjId, {page : 1, perPage: 10, pagination : gMetaPagination});
  }

  prjInfoModule.getVhInfo = function () {
    return equpPrjInfo;
  }


  prjInfoModule.submit = function () {
    var $prjInfoFrom = $('#prj-form');

    $prjInfoFrom.ajaxForm({

      beforeSubmit: function (data, form, option) {
        // console.dir(data);
        // console.dir(form);
        // console.dir(option);

        return checkPrjField();
      },

      error: function () {
        runToastr('error', '폼 전송에 에러가 발생 했습니다.');
      },

      success: function (result) {
               console.dir(result);

        if (result.success) {
          if (gInfoMode == MOD_INFO_NEW) {
            $('input[name="prjid"]').val(result.data.prj_id);

            prjInfoModule.setMode(MOD_INFO_CREATED, result.data)
            // location.href = '/data/list/prj';
          } else {
            prjInfoModule.setMode(MOD_INFO_VIEW, result.data);
          }

          return runToastr('success', result.msg);

        }

        // console.dir(result);

        runToastr('error', result.msg ? result.msg : '비정상적인 접근 입니다.');
      },

      complete: function () {
        //      stopLoading('send-inquiry-loading');
      }
    });

    $prjInfoFrom.submit();
  }

  prjInfoModule.uploadData = function () {
    var $prjDataFrom = $('#prj-data-form');

    $prjDataFrom.ajaxForm({

      beforeSubmit: function (data, form, option) {
        // console.dir(data);
        // console.dir(form);
        // console.dir(option);

        if (checkFileUpload()) {
          setProgressCircle('uploadProgress', 0);
          setProgressVisible('uploadProgress', true);
          return true;
        }

        return false ;
      },

      uploadProgress: function(event, position, total, percentComplete) {
        console.log('uploadProgress - position : ' + position + ', total: ' + total + ', percentComplete: ' + percentComplete);
        // console.dir(event);

        setProgressCircle('uploadProgress', percentComplete);
      },

      error: function () {
        runToastr('error', '업로드 중 에러가 발생 했습니다.');
      },

      success: function (result) {
        //        console.dir(result);

        if (result.success) {
          // if (gInfoMode == MOD_INFO_CREATED || 
          //     gInfoMode == MOD_INFO_EDIT) {
          //   prjInfoModule.setMode(MOD_INFO_VIEW)
          // } 

          // location.href = '/data/list/prj';

          prjInfoModule.setMode(MOD_INFO_VIEW, gPrjInfo);

          return runToastr('success', result.msg);

          
        }

        // console.dir(result);

        runToastr('error', result.msg ? result.msg : '비정상적인 접근 입니다.');
      },

      complete: function () {
        //      stopLoading('send-inquiry-loading');
        setProgressVisible('uploadProgress', false);
      }
    });

    $prjDataFrom.submit();
  }

  function checkFileUpload() {
    var fileCount = gFileBoxCam.getFileList().length;
    fileCount += gFileBoxLidar.getFileList().length;
    fileCount += gFileBoxMeta.getFileList().length;

    if (fileCount < 1) {
      runToastr('error', '업로드할 파일을 선택해 주세요.');
      return false;
    }

    var prjID = $('input[name="prjid"]').val();
    if (!prjID || prjID.length == 0) {
      runToastr('error', '프로젝트가 생성되지 않았습니다.');
      return false;
    }

    return true;
  }

  function deletePrj() {
    if (!confirm('프로젝트 정보를 정말 삭제 하시겠습니까?')) {
      return;
    }
    var data = {
      prjId : gPrjInfo.prj_id
    }

    $.ajax({
      url : '/api/data/delete/prj',
      type : 'post',
      data : data,
      dataType : 'JSON',
      success : function(result) {
//        console.dir(result);
        if (!result.success) {
          return runToastr('error', result.msg);
        }

        runToastr('success', '사업정보가 삭제 되었습니다.');
        // return history.back();
        return location.href = document.referrer;
      },
      error : function() {
        runToastr('error', 'server error');
      }
    });
  }

  function showMap() {
    var $map = $('.excd-map');

    if($map.hasClass('display-none')) {
      $map.removeClass('display-none');
      initMapModule();
    }
  }


  function initMapModule() {
    if (!gMapModule) {

      $.ajax({
        url : '/api/data/path/' + gPrjInfo.prj_id,
        type : 'get',
        dataType : 'JSON',
        success : function(result) {
          var pathList = null;

          // console.dir(result);

          if (result.success) {
            pathList = result.data;
          }
          gMapModule = new MapModule($('.excd-map'));
          gMapModule.setPath(pathList)
          gMapModule.init();
        },
        error : function() {
          runToastr('error', 'server error');
        }
      });
    }
  }

  function syncMetaData() {
    if (!confirm('메타데이터를 싱크 시킬까요?')) {
      return;
    }
    var data = {
      prjid : gPrjInfo.prj_id
    }

    $.ajax({
      url : '/api/project/sync',
      type : 'post',
      data : data,
      dataType : 'JSON',
      success : function(result) {
//        console.dir(result);
        if (!result.success) {
          return runToastr('error', result.msg);
        }

        // console.dir(result);
        // gPrjInfo = result.data;
        setPrjInfo(result.data);
        runToastr('success', '메타데이터가 싱크 되었습니다.');;
        // location.reload();

        return ;
      },
      error : function() {
        runToastr('error', 'server error');
      }
    });
  }

  return prjInfoModule;
})();