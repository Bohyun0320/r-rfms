$(document).ready(function () {
  //  console.log('start');
  cookieInit();
  initInputForm();
});

function initInputForm() {
  $("#inputId").keydown(function (event) {
    if (event.keyCode == 13) {
      $("#inputPassword").focus();
      return false;
    }
  });

  $("#inputPassword").keydown(function (event) {
    if (event.keyCode == 13) {
      submitLogin();
      return false;
    }
  });

  $("#formPw i").on("click", function () {
    $("#formPw input").toggleClass("active");

    if ($("#formPw input").hasClass("active")) {
      $(this).attr("class", "fa fa-eye-slash fa-lg")
      .prev("input").attr("type", "text");
      
    } else {
      $(this).attr("class", "fa fa-eye fa-lg")
      .prev("input").attr("type", "password");
    }
  });
}

function cookieInit() {
  var userInputId = getCookie("userInputId");
  $("#inputId").val(userInputId);

  if ($("#inputId").val() != "") {
    $("#idSaveCheck").attr("checked", true);
    $("#pwdSaveCheck").removeAttr("disabled");
  }

  $("#idSaveCheck").change(function () {
    if ($("#idSaveCheck").is(":checked")) {
      //id 저장 클릭시 pwd 저장 체크박스 활성화
      $("#pwdSaveCheck").removeAttr("disabled");
      $("#pwdSaveCheck").removeClass("no_act");
      var userInputId = $("#inputId").val();
      setCookie("userInputId", userInputId, 365);
    } else {
      deleteCookie("userInputId");
      $("#pwdSaveCheck").attr("checked", false);
      deleteCookie("userInputPwd");
      $("#pwdSaveCheck").attr("disabled", true);
      $("#pwdSaveCheck").addClass("no_act");
    }
  });

  $("#inputId").keyup(function () {
    if ($("#idSaveCheck").is(":checked")) {
      var userInputId = $("#inputId").val();
      setCookie("userInputId", userInputId, 365);
    }
  });

  //Pwd 쿠키 저장
  //  var userInputPwd = getCookie("userInputPwd");
  //  $("#inputPassword").val(userInputPwd);
  //
  //  if($("#inputPassword").val() != ""){
  //      $("#pwdSaveCheck").attr("checked", true);
  //      $("#pwdSaveCheck").removeClass('no_act');
  //  }

  //  $("#pwdSaveCheck").change(function(){
  //      if($("#pwdSaveCheck").is(":checked")){
  //          var userInputPwd = $("#inputPassword").val();
  //          setCookie("userInputPwd", userInputPwd, 365, true);
  //      }else{
  //          deleteCookie("userInputPwd");
  //      }
  //  });

  //  $("#inputPassword").keyup(function(){
  //      if($("#pwdSaveCheck").is(":checked")){
  //          var userInputPwd = $("#inputPassword").val();
  //          setCookie("userInputPwd", userInputPwd, 365, true);
  //      }
  //  });
}

function submitLogin() {
  //  console.log('submitLogin');

  $("#form-login").ajaxForm({
    beforeSubmit: function (data, form, option) {
      if (!checkVailForm()) {
        return false;
      }

      return true;
    },

    error: function (jqXHR, exception) {
      runToastr("error", jqXHR.responseJSON);
    },

    success: function (result) {
      //  console.dir(result);

      if (!result.success) {
        $("#login-msg").removeClass("display-none");
        $("#login-msg-text1").text(result.message);

        if (result.message2 && result.message2.length > 0) {
          $("#login-msg-text2").text(result.message2);
        }
        return;
      }

      //  runToastr('success', result.message);

      location.replace("/");
      // location.href = '/';
      // console.dir(result);

      //      console.log(result);
      //      runToastr('success', result.message);
    },
  });

  $("#form-login").submit();
}

function checkVailForm() {
  if ($("#inputId").val().length == 0) {
    runToastr("error", "아이디를 입력해 주세요");
    return false;
  }

  if ($("#inputPassword").val().length == 0) {
    runToastr("error", "비밀번호를 입력해 주세요");
    return false;
  }

  // if ($('#inputId').val().length > 16) {
  //   runToastr('error', '16자 이해의 id를 입력해 주세요.');
  //   return false;
  // }

  if ($("#inputPassword").val().length > 20) {
    runToastr("error", "20자 이하의 비밀번호를 입력해 주세요.");
    return false;
  }

  return true;
}
