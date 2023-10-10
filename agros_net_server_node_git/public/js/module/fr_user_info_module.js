var userInfoApi = (function () {
  const MOD_INFO_NEW = 'MOD_INFO_NEW';
  const MOD_INFO_VIEW = 'MOD_INFO_VIEW';
  const MOD_INFO_EDIT = 'MOD_INFO_EDIT';
  const MOD_INFO_CHANGE_PW = 'MOD_INFO_CHANGE_PW';

  var userInfoModule = {};
  var gInfoMode = MOD_INFO_NEW;
  var gUserInfo;
  var gInitialized = false;

  userInfoModule.init = function () {
    console.log('userInfoModule.init()');

    if (gInitialized) {
      return console.log('module already initailized!')
    }

    gInitialized = true;
    initPhotoInput();
    btnInit();
    setModeBtnBar();
  }

  userInfoModule.setMode = function (mode, accountInfo) {
    console.log('userInfoModule.setMode() - mode :' + mode);
    gInfoMode = mode;

    if (gInfoMode != MOD_INFO_NEW && accountInfo) {
      setUserInfo(accountInfo);
    }

    setInputEnabled();
    setModeBtnBar();
    setModeFormUrl();

    setPrevileage();
    setModeInputHint();
  }

  function setUserInfo(accountInfo) {
    gUserInfo = accountInfo;

    console.log('setUserInfo');

    if (!gUserInfo) {
      return console.log('setUserInfo() - accountInfo is null')
    }

    $("input[name = email]").val(gUserInfo.sv_user_id);
    $("input[name = name]").val(gUserInfo.flnm);
    $("input[name = group]").val(gUserInfo.ogdp);
    $("input[name = phone]").val(gUserInfo.telno);

    $("input[name = cur_password]").val('');
    $("input[name = password]").val('');
    $("input[name = confirm-password]").val('');

    setType(gUserInfo.divis);
    setStts(gUserInfo.user_cond_cd);
    setImage(gUserInfo.user_img_file_path);
  }

  function setInputEnabled() {
    disabled = false;

    $('#curPwRow').addClass('display-none');
    $('input[name = cur_password]').attr('disabled', true);
    $('input[name = password]').attr('disabled', true);
    $('input[name = confirm-password]').attr('disabled', true);


    if (gInfoMode == MOD_INFO_CHANGE_PW) {
      $('#curPwRow').removeClass('display-none');
      $('input[name = cur_password]').attr('disabled', false);
      $('input[name = password]').attr('disabled', false);
      $('input[name = confirm-password]').attr('disabled', false);
      return;
    }
    
    
    if (gInfoMode == MOD_INFO_EDIT) {
      $('input[name = email]').attr('readonly', true);
    }

    if (gInfoMode == MOD_INFO_VIEW) {
      $('input[name = email]').attr('readonly', true);
      disabled = true;
    }

    console.log('setInputEnabled() - disabled : ' + disabled);

    $('input[name = name]').attr('readonly', disabled);
    $('input[name = group]').attr('disabled', disabled);
    $('input[name = phone]').attr('disabled', disabled);
    
    
    // cur password


    if (disabled) {
      $('.excd-mandatory').addClass('display-none');
    }else {
      $('.excd-mandatory').removeClass('display-none');
    }
  }

  function setPrevileage() {
    if (gInfoMode == MOD_INFO_VIEW) {
      $('#status').removeClass('display-none');

      if (gUserInfo.user_cond_cd == 3 && user.divis >=10) {
        $('#resetPw').removeClass('display-none');
      }else {
        $('#resetPw').addClass('display-none');
      }
    }

    if (gInfoMode == MOD_INFO_EDIT && user.divis >=10) {
      $('select[name = user_stts]').attr('disabled', false);
      $('select[name = user_type]').attr('disabled', false);
    }else {
      $('select[name = user_stts]').attr('disabled', true);
      $('select[name = user_type]').attr('disabled', true);
    }

    if (gUserInfo.sv_user_id == user.sv_user_id) {
      $('#chgPw').removeClass('display-none')
    }else {
      $('#chgPw').addClass('display-none')
    }

  }

  function setType(type) {
    console.log('function setType - type : ' + type);
    console.dir(userType);

    for (i = 0; i < userType.length; i++) {
      if (userType[i].user_ty_id == type) {
        $("select[name='user_type']").val(userType[i].user_ty_id);
        console.log('setType selected!');
        return;
      }
    }

    console.log('setType not matched !');
  }

  function setStts(stts) {
    console.log('function setStts - stts : ' + stts);
    console.dir(userSttus);

    for (i = 0; i < userSttus.length; i++) {
      if (userSttus[i].user_cond_id == stts) {
        $("select[name='user_stts']").val(userSttus[i].user_cond_id);
        console.log('setCond selected!');
        return;
      }
    }

    console.log('setStts not matched !');
  }

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
      if (user.sv_user_id == gUserInfo.sv_user_id || user.divis >=10)
      $('#infoBtnbarView').removeClass('display-none');
      $('select[name=user_stts]').removeClass('display-none');
    }
    
    if (gInfoMode == MOD_INFO_EDIT || gInfoMode == MOD_INFO_CHANGE_PW) {
      $('#infoBtnbarEdit').removeClass('display-none');
    }
  }

  function setModeFormUrl() {
    url = '/signup';

    if (gInfoMode == MOD_INFO_EDIT) {
      url = '/api/account/update';
    }else if (gInfoMode == MOD_INFO_CHANGE_PW) {
      url = '/api/account/changepw';
    }

    $('#userinfo-form').attr('action', url);
  }

  function setModeInputHint() {
    var hint = '8~16자의 영문, 숫자, 특수문자';

      // if (gInfoMode == MOD_INFO_EDIT) {
      //   hint = '변경을 원할경우 입력해 주세요';
      // }

    $('input[name=cur_password]').attr('placeholder', hint);
    $('input[name=password]').attr('placeholder', hint);
    $('input[name=confirm-password]').attr('placeholder', hint);
  }

  
  function btnInit() {
    $('#cancel').on('click', function () {
      if (confirm('계정 생성을 취소 하시겠습니까?')) {
        return history.back();
      }
    })

    $('#submit').on('click', function () {
      return userInfoModule.submit();
    })

    $('#back').on('click', function () {
      // return history.back();
      return location.href = document.referrer;
    })

    $('#edit').on('click', function () {
      return userInfoModule.setMode(MOD_INFO_EDIT);
    })

    $('#chgPw').on('click', function () {
      return userInfoModule.setMode(MOD_INFO_CHANGE_PW);
    })

    $('#cancelUpdate').on('click', function () {
      if (confirm('업데이트를 취소 하시겠습니까?')) {
        setUserInfo(gUserInfo);
        return userInfoModule.setMode(MOD_INFO_VIEW);
      }
    })

    $('#update').on('click', function () {
      return userInfoModule.submit();
    })

    $('#resetPw').on('click', function() {
      if (!confirm('비밀번호를 초기화 하시겠습니까?')) {
        return;
      }
  
      $.ajax({
        url: '/api/account/reset',
        type: 'post',
        data: {email : gUserInfo.sv_user_id},
        dataType: 'JSON',
        success: function (result) {
          if (!result.success) {
            return runToastr('error', result.msg);
          }
  
          runToastr('success', result.msg);
        },
        error: function () {
          runToastr('error', 'server error');
        }
      });
    })

  }


  function checkUserInfoField() {

    var expEmail = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
    var email = $("input[name='email']").val();
    var regexPw = /^.*(?=^.{8,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
    var regexPhone = /^\d{2,3}-\d{3,4}-\d{4}$/;

    if (email.length == 0) {
      runToastr('error', '이메일을 입력해 주세요.');
      return false;
    }

    if (email.length > 0 && !expEmail.test(email)) {
      $("#email").focus();
      runToastr('error', '올바른 형식의 이메일이 아닙니다.');
      return false;
    }

    if (email.length > 160) {
      $("#email").focus();
      runToastr('error', '160자 이하의 이메일을 입력해 주세요.');
      return false;
    }

    if (gInfoMode == MOD_INFO_EDIT &&
      $("input[name='password']").val().length == 0 &&
      $("input[name='confirm-password']").val().length == 0) {

      //      console.log('skip pw check');

    } else {

      if (gInfoMode ==MOD_INFO_CHANGE_PW && !regexPw.test($("input[name='cur_password']").val())) {
        runToastr('error', '문자/숫자/특수문자 포함 8~16자리 현재 암호를 입력해 주세요');
        return false;
      }

      if (!regexPw.test($("input[name='password']").val())) {
        runToastr('error', '문자/숫자/특수문자 포함 8~16자리 암호를 입력해 주세요');
        return false;
      }

      if ($("input[name='cur_password']").val().length != 0 && 
          $("input[name='cur_password']").val() == $("input[name='password']").val()) {
          runToastr('error', '현재와 다른 비밀번호를 입력해 주세요');
          return false;
      }

      if ($("input[name='password']").val() != $("input[name='confirm-password']").val()) {
        runToastr('error', '비밀번호 확인이 일치하지 않습니다.');
        return false;
      }
    }

    if (!$("input[name='name']").val()) {
      runToastr('error', '이름을 입력해 주세요');
      return false;
    }

    if ($("input[name='name']").val().length > 40) {
      runToastr('error', '40자 이하의 이름을 입력해 주세요');
      return false;
    }

    // if ($("input[name='phone']").val() && $("input[name='phone']").val().length > 20) {
    //   runToastr('error', '20자 이하의 연락처를 입력해 주세요');
    //   return false;
    // }

    if (!regexPhone.test($("input[name='phone']").val())) {
      runToastr('error', '올바른 형식의 연락처를 입력해 주세요 - 예) 000-0000-0000');
      return false;
    }
    

    return true;
  }

  function initPhotoInput() {
    $("#input-profile-photo").on('change', function (event) {

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


  userInfoModule.getUserInfo = function () {
    return gUserInfo;
  }

  
  userInfoModule.submit = function () {
    var $userInfoForm = $('#userinfo-form');

    $userInfoForm.ajaxForm({

      beforeSubmit: function (data, form, option) {
        //      console.dir(data);
        //      console.dir(form);
        //      console.dir(option);

        return checkUserInfoField();
      },

      error: function () {
        runToastr('error', '폼 전송에 에러가 발생 했습니다.');
      },

      success: function (result) {
        //        console.dir(result);

        if (result.success) {
          if (gInfoMode == MOD_INFO_NEW) {
            // location.href = '/equip/list/vehicle';
            window.history.back();

          } else if (gInfoMode == MOD_INFO_CHANGE_PW) {
            userInfoModule.setMode(MOD_INFO_VIEW, gUserInfo);
          }else {

            if (result.data.sv_user_id == user.sv_user_id) {
              setHeader(result.data);
            }

            userInfoModule.setMode(MOD_INFO_VIEW, result.data);
          }

          return runToastr('success', result.msg);

        }


        runToastr('error', result.msg ? result.msg : '비정상적인 접근 입니다.');
      },

      complete: function () {
        //      stopLoading('send-inquiry-loading');
      }
    });

    $userInfoForm.submit();
  }

  function setHeader(user) {
    let profileImg = (user.user_img_file_path && user.user_img_file_path.length>0)? user.user_img_file_path : '/public/images/user.svg';
    $('.profile .photo').prop('style', `background-image:url(${profileImg})`);
    $('.profile .name').html(user.flnm);
  }

  userInfoModule.addPhoto = function () {
    if (gInfoMode == MOD_INFO_VIEW) {
      return;
    }
    $('#input-profile-photo').click();
  }

  
  // userInfoModule.reqAproveUser = function () {
  //   $.ajax({
  //     url: "/api/account/approve/" + gUserInfo.user_id,
  //     type: 'get',
  //     datatype: 'json',
  //     success: function (result) {
  //       if (!result.success) {
  //         return runToastr('error', result.msg);
  //       }

  //       updateUserInfo(result.userInfo);
  //       $('#approve').addClass('display-none');
  //       return runToastr('success', gUserInfo.user_id + ' 계정이 사용 승인 되었습니다.')

  //     },
  //     error: function (xhr, status, err) {
  //       runToastr('error', '에러가 발생했습니다.');
  //     }
  //   });
  // }

  return userInfoModule;
})();