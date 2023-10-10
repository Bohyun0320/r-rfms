var userDb= require('../../database/user_db');
var userUtil = require('../../utils/user_util');
var localStorage = require('../../storage/local_storage');
var config = require('../../config/config');
var secureUtil = require('../../utils/secure_util');
var logger = require('../../logger');
var gridUtil = require('../../utils/grid_util');

var uploadUserPhoto = localStorage.multer('photo', config.path.profileimage.original);

var readUserList = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);

  var userListInfo = gridUtil.getDefaultInfo(req, 'join_ymd');

  logger.dir(userListInfo);

  userDb.getReadUserList(userListInfo, function(err, dbResult) {
    return res.send(gridUtil.convertGridData(userListInfo, dbResult));
  });
}

var postUpdateUser = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  logger.dir(req.file);

  try {
    var user = {
      email : secureUtil.check(req.body.email),
      password : req.body.password ? req.body.password : null,
      name : secureUtil.check(req.body.name),
      group : secureUtil.check(req.body.group),
      phone : secureUtil.check(req.body.phone),
      photo : req.file === undefined ? null : config.path.profileimage.static + req.file.filename,
      type : req.body.user_type, // 개발자
      status : req.body.user_stts,
    }
  }catch(ex) {
    logger.error(logger.obj(ex));
    return res.send({success : false, msg : 'invalid parameters'});
  }

  userDb.updateUser(user, function(err, userResult) {

    logger.dir(userResult);
    
    if (user.password) {
      userDb.updatePw(user, function(err, pwResult) {
      })
    }else {

      if (req.user.sv_user_id != userResult.sv_user_id) {
        logger.debug('update other profile ');
        return res.send({success : err ? false: true, msg : err? err : '사용자 정보가 수정 되었습니다.', data : userResult});
      }

      req.logIn(userResult, function(err) {
        logger.debug('login Error => ');
        logger.dir(err);

        return res.send({success : err ? false: true, msg : err? err : '사용자 정보가 수정 되었습니다.', data : userResult});
      }) 
    }
  });

}

const postChangePw = async function(req, res) {
  logger.debug(req.method + ' : ' + req.url);

  try {
    var user = {
      email : secureUtil.check(req.body.email),
      curPassword : req.body.cur_password ? req.body.cur_password : null,
      password : req.body.password ? req.body.password : null,
    }

    const findUser = await userDb.authUserSync(user.email, user.curPassword);

    if (!findUser) {
      return res.send({success: false, msg : '현재 비밀번호가 일치하지 않습니다.'});
    }

    userDb.updatePw(user, function(err, result) {
      return res.send({success : err ? false: true, msg : err? err : '비밀번호가 변경 되었습니다.'});
    });

  }catch(ex) {
    logger.error(logger.obj(ex));
    return res.send({success : false, msg : 'invalid parameters'});
  }
}

const postUserReset = async function(req, res) {
  logger.debug(req.method + ' : ' + req.url);

  const email = req.body.email;

  let result = await userDb.resetUser(email);

  if (result) {
    return res.send({success: true, msg : `비밀번호가 초기화 되었습니다. (${config.DEFAULT_USER_PW})`});
  }else {
    return res.send({success: false, msg : '오류가 발생 했습니다.'});
  }

}

module.exports.uploadUserPhoto = uploadUserPhoto;
module.exports.readUserList = readUserList;
module.exports.postUpdateUser = postUpdateUser;
module.exports.postChangePw = postChangePw;
module.exports.postUserReset = postUserReset;

// module.exports.getUserList = getUserList;
// module.exports.getApproveUser = getApproveUser;
// module.exports.postUpdateUser = postUpdateUser;
// module.exports.uploadPhoto = uploadPhoto;
// module.exports.deleteUser = deleteUser;

