var equipVhApi = (function () {
  const MOD_INFO_NEW = 'MOD_INFO_NEW';
  const MOD_INFO_VIEW = 'MOD_INFO_VIEW';
  const MOD_INFO_EDIT = 'MOD_INFO_EDIT';

  var equipVhModule = {};
  var gInfoMode = MOD_INFO_NEW;
  var gEquipVhInfo;
  var gInitialized = false;

  equipVhModule.init = function (vhInfo) {
    console.log('equipVhModule.init()');

    if (gInitialized) {
      return console.log('module already initailized!')
    }

    gInitialized = true;

    // console.dir(userList);

    pnuApi.init(pnuCode, $('select[name=sido]'), $('select[name=sigungu]'), $('input[name=pnuid]'));
    initPhotoInput();
    setModeBtnBar();
    btnInit();

  }

  equipVhModule.setMode = function (mode, vhInfo) {
    console.log('equipVhModule.setMode() - mode :' + mode);
    gInfoMode = mode;

    if (gInfoMode != MOD_INFO_NEW && vhInfo) {
      setVhInfo(vhInfo);
      setSelectEnable();
    }

    setInputEnabled();
    setModeBtnBar();
    setModeFormUrl();
  }

  function setSelectEnable() {
    $('select option').prop('disabled', false);
  }


  function setVhInfo(vhInfo) {
    gEquipVhInfo = vhInfo;

    if (!gEquipVhInfo) {
      return console.log('setVhInfo() - setVhInfo is null')
    }

    $("input[name = vhid]").val(vhInfo.vh_id);
    $("input[name = name]").val(vhInfo.vh_nm);
    $("input[name = vhno]").val(vhInfo.vh_no);
    
    $("select[name = owner]").val(vhInfo.sv_user_id);
    $("select[name = cond]").val(vhInfo.cond_cd);

    $("textarea[name = memo]").val(vhInfo.vh_memo_cn);

    pnuApi.setValue(vhInfo.mng_sgg);

    
    // setUser(vhInfo.sv_user_id);
    // setCond(vhInfo.cond_cd);
    setImage(vhInfo.vh_img_file_path);
  }

  function setInputEnabled() {
    disabled = false;

    if (gInfoMode == MOD_INFO_VIEW) {
      disabled = true;
    }

    console.log('setInputEnabled() - disabled : ' + disabled);

    $('input[name = name]').attr('readonly', disabled);
    $('input[name = vhno]').attr('readonly', disabled);
    $('select[name = sido]').attr('disabled', disabled);
    $('select[name = sigungu]').attr('disabled', disabled);
    $('select[name = owner]').attr('disabled', disabled);
    $('select[name = cond]').attr('disabled', disabled);
    $('textarea[name = memo]').attr('readonly', disabled);

    if (disabled) {
      $('.excd-mandatory').addClass('display-none');
    }else {
      $('.excd-mandatory').removeClass('display-none');
    }
  }

  // function setUser(email) {
  //   // console.log('function _setUser - email : ' + email);
  //   // console.dir(userList);

  //   for (i = 0; i < gContentList.length; i++) {
  //     if (gContentList[i].sv_user_id == email) {
  //       $("select[name=owner]").val(gContentList[i].sv_user_id);
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
    url = '/api/equip/add/vehicle';

    if (gInfoMode == MOD_INFO_EDIT) {
      url = '/api/equip/update/vehicle';
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
      return equipVhModule.submit();
    })

    $('#back').on('click', function () {
      // return history.back();
      return location.href = document.referrer;
    })

    $('#edit').on('click', function () {
      return equipVhModule.setMode(MOD_INFO_EDIT);
    })

    $('#cancelUpdate').on('click', function () {
      if (confirm('업데이트를 취소 하시겠습니까?')) {
        setVhInfo(gEquipVhInfo);
        return equipVhModule.setMode(MOD_INFO_VIEW);
      }
    })

    $('#update').on('click', function () {
      return equipVhModule.submit();
    })

  }

  function checkVhField() {
    if (!$("input[name='name']").val()) {
      runToastr('error', '차량명을 입력해 주세요.');
      return false;
    }

    if ($("input[name='name']").val().length > 40) {
      runToastr('error', '40자 이하의 차량명을 입력해 주세요');
      return false;
    }

    if ($("input[name='vhno']").val().length == 0 ||
      $("input[name='vhno']").val().length > 16) {
      runToastr('error', '16자 이하의 차량번호를 입력해 주세요');
      return false;
    }

    console.log('owner : ' + $("select[name='owner']").val());

    // if ($("select[name='owner']").val().length > 40) {
    //   runToastr('error', '관리자를 지정해 주세요');
    //   return false;
    // }

    if ($("textarea[name='memo']").val() && $("textarea[name='memo']").val().length > 160) {
      $("#email").focus();
      runToastr('error', '160자 이하의 메모를 입력해 주세요.');
      return false;
    }


    return true;
  }

  function initPhotoInput() {
    $("#input-vh-photo").on('change', function (event) {
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


  equipVhModule.getVhInfo = function () {
    return gEquipVhInfo;
  }


  equipVhModule.submit = function () {
    var $equipCardFrom = $('#equip-form');

    $equipCardFrom.ajaxForm({

      beforeSubmit: function (data, form, option) {
        console.log('before submit');
        // console.dir(data);
        // console.dir(form);
        // console.dir(option);

        // if (gInfoMode == MOD_INFO_EDIT) {
        //   option.url.replace('add', 'update');
        // }

        return checkVhField();
      },

      error: function () {
        runToastr('error', '폼 전송에 에러가 발생 했습니다.');
      },

      success: function (result) {
        //        console.dir(result);

        if (result.success) {
          if (gInfoMode == MOD_INFO_NEW) {
            location.href = '/equip/list/vehicle';
          } else {
            equipVhModule.setMode(MOD_INFO_VIEW);
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

  equipVhModule.addPhoto = function () {
    if (gInfoMode == MOD_INFO_VIEW) {
      return;
    }

    $('#input-vh-photo').click();
  }

  // equipVhModule.deleteUser = function () {
  //   if (!confirm('정말 삭제하시겠습니까?')) {
  //     return;
  //   }

  //   $.ajax({
  //     url: '/api/account/delete',
  //     type: 'post',
  //     data: gEquipVhInfo,
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


  return equipVhModule;
})();