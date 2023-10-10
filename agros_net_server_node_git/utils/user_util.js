var logger =require('../logger');
var userUtil = {}

userUtil.checkEmail = function( email ) {
    
    var regex=/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    return (email != '' && email != 'undefined' && regex.test(email));
}


userUtil.checkPassword = function(password) {
  var pw = password;
  var num = pw.search(/[0-9]/g);
  var eng = pw.search(/[a-z]/ig);
  var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

  if(pw.length < 8 || pw.length > 20){
    return '8~20 자리로 입력해주세요.';
  }

  if(pw.search(/₩s/) != -1){
    return '공백업이 입력해 주세요.';
  } 
  
  if(num < 0 || eng < 0 || spe < 0 ){
    return '영문,숫자,특수문자를 혼합하여 입력해주세요.';
  }
  return null;
}

userUtil.checkLogin = function(req) {
  if (!req.user) {
    return false;
  }
  
  return true;
}

userUtil.checkAdmin = function(user) {
  if (!user) {
    logger.warn('err : user is not valid');
    return false;
  }
  
  if (user.user_ty_id < 3) {
    logger.warn('err : user is not superUser');
    return false;
  }
  
  return true;
}

module.exports = userUtil;

