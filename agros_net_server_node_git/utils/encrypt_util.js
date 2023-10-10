var crypto = require('crypto');
var encptConfig = require('../config/secret/encrypt_config');
var logger = require('../logger');

var encptUtil = {};

encptUtil.makeSalt = function (callback) {
  crypto.randomBytes(encptConfig.saltLen, function (err, buf) {
    if (err) {
      callback(err);
      return;
    }

    var salt = buf.toString(encptConfig.encoding);
    logger.debug('salt value : ' + salt);

    return callback(null, salt);
  });
}

encptUtil.encryptPassword = function(password, salt, callback) {
  logger.debug('encptUtil.encryptPassword - password : ' +  password, + 'salt : ' + salt);
  if (salt) {
    crypto.pbkdf2(password, salt, encptConfig.iterations, encptConfig.keyLen, encptConfig.digest, function(err, key) {
      if (err) {
        logger.error('err accoured : ' + err);
        return callback(err);
      }

      var encrypted = key.toString(encptConfig.encoding);
      return callback(null, encrypted);
    });

  }else {
    logger.debug('no salt value');
    return callback(null, password);
  }
}


module.exports = encptUtil;