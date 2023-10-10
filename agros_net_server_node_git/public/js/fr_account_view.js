$(document).ready(function($) {
  
  userInfoApi.init();
  userInfoApi.setMode("MOD_INFO_VIEW", accountInfo);
  openAuthModal();
});

// ------------ auth modal

function openAuthModal() {
  // console.log(user);
  // if (user.divis >= 10 && user.sv_user_id != accountInfo.sv_user_id) {
  if (user.sv_user_id != accountInfo.sv_user_id) {
    return;
  }

  $('#headerModalBg').removeClass('display-none');
  $('#authCard input[name=authId]').val(user.sv_user_id);
  $('#authCard input[name=authPassword]').val('');
}

function closeAuthModal() {
  $('#headerModalBg').addClass('display-none');
  $('#authCard input[name=authPassword]').val('');
}

function cancelAuth() {
  // location.href ='/';
  history.back();
}

$("#form-auth i").on("click", function () {
  $("#formPw input").toggleClass("active");

  if ($("#formPw input").hasClass("active")) {
    $(this).attr("class", "fa fa-eye-slash fa-lg")
    .prev("input").attr("type", "text");
    
  } else {
    $(this).attr("class", "fa fa-eye fa-lg")
    .prev("input").attr("type", "password");
  }
});

function submitAuth() {
  console.log('submitAuth');
  
  let authForm = $('#form-auth');
  console.log(authForm);
  
  authForm.ajaxForm({
    error: function () {
      runToastr('error', '인증 에러가 발생했습니다.');
    },
    success: function(result) {
      console.dir(result);

      if (result.success) {
        runToastr('success', '인증 되었습니다.');
        return closeAuthModal();
      }else {
        runToastr('error', '인증에 실패 했습니다.');
      }
    }
  });

  authForm.submit();
}



// function tollgeSafetyBgModal() {
//   history.back();
// }
