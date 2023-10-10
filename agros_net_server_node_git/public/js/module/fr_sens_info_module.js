var equipSensApi = (function () {
  const MOD_INFO_NEW = 'MOD_INFO_NEW';
  const MOD_INFO_VIEW = 'MOD_INFO_VIEW';
  const MOD_INFO_EDIT = 'MOD_INFO_EDIT';

  var equipSensModule = {};
  var gInfoMode = MOD_INFO_NEW;
  var gEquipSensInfo;
  var gSensSpec;
  var gInitialized = false;

  equipSensModule.init = function (vhInfo) {
    console.log('equipSensModule.init()');

    if (gInitialized) {
      return console.log('module already initailized!')
    }

    gInitialized = true;

    pnuApi.init(pnuCode, $('select[name=sido]'), $('select[name=sigungu]'), $('input[name=pnuid]'));
    initPhotoInput();
    initIoFileInput();
    initSensTySelect();
    setModeBtnBar();
    btnInit();

  }

  equipSensModule.setMode = function (mode, sensInfo) {
    console.log('equipSensModule.setMode() - mode :' + mode);
    gInfoMode = mode;

    if (gInfoMode != MOD_INFO_NEW && sensInfo) {
      setSelectEnable();
      setSensInfo(sensInfo);
    }

    setInputEnabled();
    setModeBtnBar();
    setModeFormUrl();
  }

  function setSelectEnable() {
    $('select option').prop('disabled', false);
  }


  function setSensInfo(sensInfo) {
    gEquipSensInfo = sensInfo;
    console.dir(gEquipSensInfo);

    if (!gEquipSensInfo) {
      return console.log('setSensInfo() - setSensInfo is null')
    }

    $("input[name = sensid]").val(sensInfo.sens_id);
    $("select[name = sens_ty]").val(sensInfo.sens_ty);
    $("input[name = name]").val(sensInfo.sens_nm);
    $("input[name = sensno]").val(sensInfo.sens_no);

    $("select[name = vhid]").val(sensInfo.vh_id);

    pnuApi.setValue(sensInfo.mng_sgg);

    $("select[name = owner]").val(sensInfo.sv_user_id);
    $("select[name = cond]").val(sensInfo.cond_cd);

    $("textarea[name = memo]").val(sensInfo.sens_memo_cn);



    setImage(sensInfo.sens_img_file_path);

    setSensSpecInfo();
    setSensSpecVisible();
    setCalInfo()

    // setUser(sensInfo.sv_user_id);
    // setCond(sensInfo.cond_cd);
    // setType(sensInfo.sens_ty);
    // setVhId(sensInfo.vh_id);
  }

  function setSensSpecVisible() {
    console.log('setSensSpecVisible : ' + $('select[name = sens_ty] option:selected').val() )

    if ($('select[name = sens_ty] option:selected').val() == '1') {
      $('#spec-lidar').removeClass('display-none');
      $('#spec-cam').addClass('display-none');

    } else if ($('select[name = sens_ty] option:selected').val() == '2') {
      $('#spec-lidar').addClass('display-none');
      $('#spec-cam').removeClass('display-none');

    } else {
      $('#spec-lidar').removeClass('display-none');
      $('#spec-cam').removeClass('display-none');
    }
  }

  function setSensSpecInfo() {

    if (!gEquipSensInfo || !gEquipSensInfo.sens_spec) {
      console.log('sens spec info not exist!');
      return;
    }

    try {
      gSensSpec = JSON.parse(gEquipSensInfo.sens_spec);
      console.dir(gSensSpec);
    } catch (e) {
      console.dir(e);
    }
    
    setLidarSpec(gSensSpec);
    setCamSpec(gSensSpec);

    // lidar
    // if (gEquipSensInfo.sens_ty == 1) {
    //   setLidarSpec(gSensSpec);

    // } else if {
    //   setCamSpec(gSensSpec);
    // }
  }

  function setLidarSpec(sensSpec) {
    console.log('setLidarSpec');
    $('input[name = lidar_brand]').val(sensSpec.lidar_brand);
    $('input[name = lidar_model]').val(sensSpec.lidar_model);
    $('input[name = lidar_serial]').val(sensSpec.lidar_serial);
    $('input[name = lidar_resol]').val(sensSpec.lidar_resol);
    $('input[name = lidar_range]').val(sensSpec.lidar_range);
    $('input[name = lidar_size]').val(sensSpec.lidar_size);
    $('input[name = lidar_weight]').val(sensSpec.lidar_weight);
    $('textarea[name = lidar_etc]').val(sensSpec.lidar_etc);
  }

  function setCamSpec(sensSpec) {
    $('input[name = cam_brand]').val(sensSpec.cam_brand);
    $('input[name = cam_model]').val(sensSpec.cam_model);
    $('input[name = cam_serial]').val(sensSpec.cam_serial);
    $('input[name = cam_size]').val(sensSpec.cam_size);
    $('input[name = cam_resol]').val(sensSpec.cam_resol);
    $('input[name = cam_pixel]').val(sensSpec.cam_pixel);
    $('input[name = cam_focus]').val(sensSpec.cam_focus);
    $('textarea[name = cam_calbr]').val(sensSpec.cam_calbr);
  }

  function setCalInfo() {
    if (!gEquipSensInfo) return;

    let calText = 'SCALE_XY : ' + (gEquipSensInfo.scale_xy ? gEquipSensInfo.scale_xy : '') + '\n';
    calText +=  'PPS_XY : ' + (gEquipSensInfo.pps_xy ? gEquipSensInfo.pps_xy : '') + '\n';
    calText +=  'IMAGE_SIZE : ' + (gEquipSensInfo.image_size? gEquipSensInfo.image_size:'') + '\n';
    calText +=  'RADIAL_DISTORTION : ' + (gEquipSensInfo.radial_distortion?gEquipSensInfo.radial_distortion:'') + '\n';
    calText +=  'TANGENTIAL_DISTORTION : ' + (gEquipSensInfo.tangential_distortion?gEquipSensInfo.tangential_distortion:'') + '\n';
    calText +=  'ROTATION : ' + (gEquipSensInfo.rotation?gEquipSensInfo.rotation:'') + '\n';
    calText +=  'TRANSLATION : ' + (gEquipSensInfo.translation?gEquipSensInfo.translation:'') ;

    $('textarea[name=sens_cal]').text(calText);

    // for GS Certi 
    $('#sensCalInfo').removeClass('display-none');
  }

  function setInputEnabled() {
    disabled = false;

    if (gInfoMode == MOD_INFO_VIEW) {
      disabled = true;
    }

    console.log('setInputEnabled() - disabled : ' + disabled);

    $('input[name = name]').attr('readonly', disabled);
    $('input[name = sensno]').attr('readonly', disabled);
    $('select[name = sido]').attr('disabled', disabled);
    $('select[name = sigungu]').attr('disabled', disabled);
    $('select[name = owner]').attr('disabled', disabled);
    $('select[name = cond]').attr('disabled', disabled);
    $('input[name = io_file_name]').attr('readonly', disabled);
    $('textarea[name = memo]').attr('readonly', disabled);

    $('select[name = sens_ty]').attr('disabled', disabled);
    $('select[name = vhid]').attr('disabled', disabled);

    $('.card-contents-sub').find('input').attr('disabled', disabled);
    $('.card-contents-sub').find('textarea').attr('disabled', disabled);

    if (disabled) {
      $('.excd-mandatory').addClass('display-none');
    }else {
      $('.excd-mandatory').removeClass('display-none');
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

  // function setCond(cond_cd) {
  //   console.log('function setCond - condCode : ' + cond_cd);
  //   console.dir(condCode);

  //   for (i = 0; i < condCode.length; i++) {
  //     if (condCode[i].vh_cond_id == cond_cd) {
  //       $("select[name='cond']").val(condCode[i].vh_cond_id);
  //       console.log('setCond selected!');
  //       return;
  //     }
  //   }

  //   console.log('setCond not matched !');
  // }

  // function setType(sensTyId) {
  //   for (i = 0; i < sensCode.length; i++) {
  //     if (sensCode[i].sens_ty_id == sensTyId) {
  //       $("select[name='sens_ty']").val(sensCode[i].sens_ty_id);
  //       console.log('setType selected!');
  //       return;
  //     }
  //   }

  //   console.log('setType not matched !');
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

  function setImage(imgUrl) {
    if (!imgUrl) {
      return;
    }

    $('.profile-img').css({
      'background-image': 'url(' + imgUrl + ')',
      'background-size': 'cover',
    });
  }

  function setModeBtnBar() {
    console.log('_setBtnBar() - gInfoMode : ' + gInfoMode);

    $('.info-module-btnbar').addClass('display-none');

    if (gInfoMode == MOD_INFO_NEW) {
      $('#infoBtnbarNew').removeClass('display-none');
    }
    if (gInfoMode == MOD_INFO_VIEW) {
      $('#infoBtnbarView').removeClass('display-none');
    }
    if (gInfoMode == MOD_INFO_EDIT) {
      $('#infoBtnbarEdit').removeClass('display-none');
    }
  }

  function setModeFormUrl() {
    url = '/api/equip/add/sens';

    if (gInfoMode == MOD_INFO_EDIT) {
      url = '/api/equip/update/sens';
    }

    $('#equip-form').attr('action', url);
  }

  function btnInit() {
    $('#cancel').on('click', function () {
      if (confirm('차량 등록을 취소 하시겠습니까?')) {
        return history.back();
      }
    })

    $('#submit').on('click', function () {
      return equipSensModule.submit();
    })

    $('#back').on('click', function () {
      // return history.back();
      return location.href = document.referrer;
    })

    $('#edit').on('click', function () {
      return equipSensModule.setMode(MOD_INFO_EDIT);
    })

    $('#cancelUpdate').on('click', function () {
      if (confirm('업데이트를 취소 하시겠습니까?')) {
        setSensInfo(gEquipSensInfo);
        return equipSensModule.setMode(MOD_INFO_VIEW);
      }
    })

    $('#update').on('click', function () {
      return equipSensModule.submit();
    })

  }

  function checkSensField() {
    if (!$("input[name='name']").val()) {
      runToastr('error', '센서명을 입력해 주세요.');
      return false;
    }

    if ($("input[name='name']").val().length > 40) {
      runToastr('error', '40자 이하의 센서명을 입력해 주세요');
      return false;
    }

    if ($("input[name='sensno']").val().length == 0 ||
      $("input[name='sensno']").val().length > 16) {
      runToastr('error', '16자 이하의 센서번호를 입력해 주세요');
      return false;
    }

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

    if (!$("select[name='sens_ty']").val()) {
      $("select[name='sens_ty']").focus();
      runToastr('error', '선택 가능한 센서 종류를 선택해 주세요.');
      return false;
    }

    if (!$("select[name='vhid']").val()) {
      $("select[name='vhid']").focus();
      runToastr('error', '선택 가능한 차량을 선택해 주세요.');
      return false;
    }


    return true;
  }

  function initPhotoInput() {
    $("#input-sens-photo").on('change', function (event) {
      console.dir(event);

      var reader = new FileReader();

      reader.onload = function (e) {
        $('.profile-img').css({
          'background-image': 'url(' + e.target.result + ')',
          'background-size': 'cover',
        });
      }

      reader.readAsDataURL(event.target.files[0]);

    });
  }

  function initIoFileInput() {
    $("#sens-io-file").on('change', function (event) {
      let path = event.target.value;
      if (!path) return;
      
      let fileName = path.substring(path.lastIndexOf('\\')+1,path.length);
      console.dir(fileName);

      $('input[name=io_file_name]').val(fileName);

    });
  }

  function initSensTySelect() {
    $("select[name=sens_ty]").change(function () {
      console.log('sens type changed');

      setSensSpecVisible();
    });
  }


  equipSensModule.getVhInfo = function () {
    return equpSensInfo;
  }


  equipSensModule.submit = function () {
    var $equipCardFrom = $('#equip-form');

    $equipCardFrom.ajaxForm({

      beforeSubmit: function (data, form, option) {
        // console.dir(data);
        // console.dir(form);
        // console.dir(option);

        return checkSensField();
      },

      error: function () {
        runToastr('error', '폼 전송에 에러가 발생 했습니다.');
      },

      success: function (result) {
        //        console.dir(result);

        if (result.success) {
          if (gInfoMode == MOD_INFO_NEW) {
            location.href = '/equip/list/sensor';
          } else {
            equipSensModule.setMode(MOD_INFO_VIEW);
            
            gEquipSensInfo = result.data;
            setCalInfo();
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

    $equipCardFrom.submit();
  }

  equipSensModule.addPhoto = function () {
    if (gInfoMode == MOD_INFO_VIEW) {
      return;
    }

    $('#input-sens-photo').click();
  }
  
  equipSensModule.addIoFile = function () {
    if (gInfoMode == MOD_INFO_VIEW) {
      return;
    }

    $('#sens-io-file').click();
  }

  // equipSensModule.deleteUser = function () {
  //   if (!confirm('정말 삭제하시겠습니까?')) {
  //     return;
  //   }

  //   $.ajax({
  //     url: '/api/account/delete',
  //     type: 'post',
  //     data: equpSensInfo,
  //     dataType: 'JSON',
  //     success: function (result) {
  //       if (!result.success) {
  //         return runToastr('error', result.msg);
  //       }

  //       //        console.dir(result);
  //       runToastr('success', '사용자가 삭제 되었습니다.');
  //       $('.contents-card-user').trigger('userInfoUpdated', null);
  //       tollgeSafetyBgModal();
  //     },
  //     error: function () {
  //       runToastr('error', 'server error');
  //     }
  //   });

  // }


  return equipSensModule;
})();