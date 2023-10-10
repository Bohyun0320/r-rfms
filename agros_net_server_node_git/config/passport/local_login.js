var LocalStrategy = require('passport-local').Strategy;
var userDB = require('../../database/user_db');
var userUtil = require('../../utils/user_util.js');
var config = require('../config');
var secureUtil = require('../../utils/secure_util');
var logger = require('../../logger');

module.exports = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,   // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
}, function (req, id, password, done) {

  logger.debug('[func]local_login.LocalStrategy() - id : ' + id + ', pw:' + password);

  //  if (userUtil.checkEmail(id) == false) {
  //      // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
  //      return done(null, false, {success: false, message:'올바른 형식의 email 주소가 아닙니다.'});  
  //  }

  var filteredId;
  var filterdPw;

  try {
    filteredId = secureUtil.check(id);
    // filterdPw = secureUtil.check(password);
    filterdPw = password;
  } catch (ex) {
    logger.error(logger.obj(ex));
    return done(null, false, { message: ex });
  }

  userDB.authUser(filteredId, filterdPw, async function (err, rows) {
    if (err) {
      logger.warn('계정이 일치하지 않음.');

      return done(null, false, { success: false, message: '등록된 계정이 없습니다.' });
    }

    if (rows) {
      logger.info('계정과 비밀번호가 일치함.');
      logger.dir(rows);

      if (rows.user_cond_cd == 2) {
        return done(null, false, {
          success: false,
          message: '계정이 아직 승인되지 않았습니다.',
          message2: '관리자에게 문의하세요.'
        });
      }else if (rows.user_cond_cd == 3) {
        return done(null, false, {
          success: false,
          message: '계정이 사용정지 상태입니다.',
          message2: '관리자에게 문의하세요.'
        });
      }else if (rows.user_cond_cd == 4) {
        return done(null, false, {
          success: false,
          message: '계정이 사용종료 상태입니다.',
          message2: '관리자에게 문의하세요.'
        });
      }else if ((rows.sttus_ty_id == 3)) {
        return done(null, false, {
          success: false,
          message: '계정이 사용정지 상태입니다.',
          message2: '관리자에게 문의하세요.'
        });
      } else if ((rows.sttus_ty_id == 4)) {
        return done(null, false, {
          success: false,
          message: '사용 종료된 계정입니다.',
          message2: '관리자에게 문의하세요.'
        });
      }

      await userDB.resetLoginCountSync(rows.sv_user_id);

      return done(null, rows, { success: true, message: '계정이 일치합니다.' });


    } else {
      const count = await userDB.incLoginCountSync(filteredId);
      
      let msg = `비밀번호가 일치하지 않습니다. (${count}/5회)`;
      let msg2 = null;

      if (count >= 5) {
        await userDB.updateUserCond(filteredId, 3);
        msg2 = '계정이 정지 되었습니다.'
      }
      
      logger.warn(msg);

      return done(null, false, {
        success: false,
        message: msg,
        message2: msg2
      });


  // userDB.increaseLoginCount(filteredId, function(err, counter) {
  //   if(counter >= 5) {
  //     userDB.desableUser(filteredId, function (err, result){
  //       return done(null, false, {
  //         success: false, 
  //         message:'오류횟수 초과로 계정이 비활성화 되었습니다.',
  //         message2: '관리자에게 문의 하세요.'
  //       });  
  //     });
  //   }else {
  //     // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
  //     return done(null, false, {
  //       success: false, 
  //       message:'비밀번호 오류 : ' + counter,
  //       message2: '(5회 오류시 계정이 비활성화 됩니다.)'
  //     });  
  //   }

  // })
}

  });

});

