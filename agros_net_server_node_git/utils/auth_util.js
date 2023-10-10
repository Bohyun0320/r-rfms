var jwtConfig = require('../config/secret/jwt_config');
var jwt = require('jsonwebtoken');
var userDb = require('../database/user_db');
var logger = require('../logger');

var authUtil = {};


authUtil.getToken = function(req) {
  if (!req || !req.user || req.user.sttus_ty_id != 2)  return null;
  
  var data = {
    user_id : req.user.user_id,
    user_ty_id : req.user.user_ty_id,
    sttus_ty_id : req.user.sttus_ty_id,
  }
  

  try {
    var token = jwt.sign(data, jwtConfig.secret, jwtConfig.option);
    logger.debug('token issued : ' + token);
    return token
    
  }catch(e) {
    logger.error(logger.obj(e));
    return null;
  }
}

authUtil.getTokenByIdPw = function(id, pw, callback) {
  userDb.authUser(id, pw, function(err, resultUser) {
    if (err || !resultUser) {
      return callback('auth failed', null);
    }

    var data = {
      user_id : resultUser.sv_user_id,
      user_ty_id : resultUser.divis,
      sttus_ty_id : resultUser.user_cond_cd
    }

    try {
      var token = jwt.sign(data, jwtConfig.secret, jwtConfig.option);
      logger.debug('token issued : ' + token);
      return callback(null, token);
      
    }catch(e) {
      logger.error(logger.obj(e));
      return ('Failed to get token', null);
    }
  });
}

authUtil.getDebugToken = function() {
  var data = {
    user_id : 'admin',
    user_ty_id : 3,
    sttus_ty_id : 2,
  }
  
  try {
    var token = jwt.sign(data, jwtConfig.secret, jwtConfig.option);
//    console.log(token);
    return token
    
  }catch(e) {
    logger.error(logger.obj(e));
    return null;
  }
}

authUtil.verify = function(token, callback) {
  if (!token) {
    logger.debug('token is null', null);
    
    return callback('token is null', null);
  }
  
  var decoded = jwt.verify(token, jwtConfig.secret, jwtConfig.option);
  
  if (!decoded) {
    return callback('token is not valid', null);
  }
  
  userDb.findOne(decoded.user_id, function(err, dbUser) {
    if (err || !dbUser) {
      return callback('user auth failed', null);
    }
    
    if (dbUser.sttus_ty_id != 2) {
      return callback('user is not allowed', null);
    }
    
    logger.debug('token verified');
//    console.dir(decoded);
    
    return callback(null, decoded);
  });
}

authUtil.verifyReq = function(req) {
  logger.debug('[func] authUtil.verifyReq');
  if (!req) return null;
  
//  console.dir(req.headers);
//  console.dir(jwtConfig.authKey);
  
  var authHeader = req.headers[jwtConfig.authKey];
  
  if (!authHeader) {
    logger.dir(req.headers);
    return null;
  }
  
//  console.log('authHeader : ' + y);
  
  var reg = /{(.*)}/;
  var bearer = authHeader.match(reg);
  if (!bearer) return false;
  
  var token = bearer[0].replace(reg, '$1')
  if (!token) return null;
  
  logger.debug('token : ' + token);
  
  try{
    var decoded = jwt.verify(token, jwtConfig.secret, jwtConfig.option);
    logger.debug('[msg] Authoized API Request! - user_id : ' + decoded.user_id);
  
    return decoded;
  }catch(er) {
    logger.error(logger.obj(er));
    return (null)
  }
}

module.exports = authUtil;