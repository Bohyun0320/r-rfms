var LocalStrategy = require('passport-local').Strategy;
var userDB= require('../../database/user_db');
var userUtil = require('../../utils/user_util.js');
var local = require('../../storage/local_storage');
var config = require('../../config/config');
var secureUtil = require('../../utils/secure_util');
var logger = require('../../logger');

module.exports = new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
  }, function(req, id, password, done) {
  
  logger.debug('[func] passport LocalStrategy() : id ' + id + ', password : ' + password);
  logger.debug(logger.obj(req.file));

  try {
    var newUser = {
      email : secureUtil.check(req.body.email),
      name : secureUtil.check(req.body.name),
      group : secureUtil.check(req.body.group),
      phone : secureUtil.check(req.body.phone),
      photo : req.file === undefined ? null : config.path.profileimage.static + req.file.filename,
      type : req.body.user_type, // 개발자
      status : 2, // 승인대기,
      join_ymd : new Date()
    }
  }catch(ex) {
    logger.error(logger.obj(ex));
    return done(null, false, {signupMessage: ex}); 
  }

  userDB.findOne(id, function(err, user) {
    if (user) {
      if (user.sttus_ty_id == 4) {
        logger.debug('삭제된 아이디.');
        return done(null, false, {signupMessage: '기존에 삭제된 ID 입니다.'}); 
      }
      
      logger.debug('기존에 계정이 있음.');
      logger.debug(logger.obj(user));
      return done(null, false, {signupMessage: '동일한 ID가 이미 있습니다.'}); 

    } else {
      
      logger.warn('계정 없음');
      
      userDB.addUser(newUser, password, function(err, result) {
        if (err) {
          logger.error('err : ' + err);
          return done(null, false, {signupMessage: err}); 
        }
        
        logger.debug(logger.obj(result));
        
        return done(null, result, {signupMessage: 'signup success'});     
      })
      
//      console.dir(user);
      
      
//      userDB.addUser(email, password, null, function(err, result) {
//        if (err) {
//          return done(err);
//        }
//
//        console.log("사용자 데이터 추가함.");
////              console.dir(result);
//
//        return done(null, result);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
//      });
    }
  });
});