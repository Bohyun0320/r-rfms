var pgUtil = require('./postgres_util');

var codeUtil = {};

var userType = null;
var userStatus = null;
var pnuCode = null;
var vhCondCode = null;
var sensTyCode = null;
var weatherCode = null;


var logger = require('../logger');

codeUtil.init = function() {
  logger.debug('[func]codeUtil.init()');
  
  loadUserType();
  loadUserStatus();
  loadPnuCode();
  loadCondCode();
  loadSensCode();
  loadWeatherCode();

  // loadBsnsType();
  // loadSptInfoType();
  // loadImpchHistType();
  // loadImpchType();
  // loadStrgHistType();
}

codeUtil.getUserType = function() {
  return userType;
}

codeUtil.getUserStatus = function() {
  return userStatus;
}

codeUtil.getUserStatusName = function(code) {

  logger.debug('codeUtil.getUserStatusName - code :' + code);
  logger.debug('user status : ' + logger.object(userStatus));
  
  for (var i=0; i<userStatus.length; i++) {
    if (userStatus[i].user_cond_id == code) {
      logger.debug('code found : ' + userStatus[i].user_cond_nm );
      return userStatus[i].user_cond_nm;
    }
  }
  
//  console.log('code not found');
  logger.warn('code not found');
}

codeUtil.getPnuCode = function() {
  return pnuCode;
}

codeUtil.getCondCode = function() {
  return vhCondCode;
}

codeUtil.getSensCode = function() {
  return sensTyCode;
}

codeUtil.getWeatherCode = function() {
  return weatherCode;
}


function loadUserType() {
  logger.debug('[msg] loadUserType...')
  const query = {
    text: `SELECT *  FROM tc_user_ty ORDER BY user_ty_id`, 
  }
  
  pgUtil.query(query, function(err, result) {
    userType = result.rows;

    // console.dir(userType);
  });
}

function loadUserStatus() {
  logger.debug('[msg] loadUserStatus...')
  const query = {
    text: `SELECT *  FROM tc_user_cond ORDER BY user_cond_id`, 
  }
  
  pgUtil.query(query, function(err, result) {
    userStatus = result.rows;
  });
}

function loadPnuCode() {
  logger.debug('[msg] loadPnuCode...')
  const query = {
    text: `SELECT *  FROM tc_pnu_sigungu ORDER BY sido_cd, sigungu_cd`, 
  }
  
  pgUtil.query(query, function(err, result) {
    pnuCode = result.rows;
    // logger.dir(pnuCode);
  });
}

function loadCondCode() {
  logger.debug('[msg] loadCondCode...')
  const query = {
    text: `SELECT *  FROM tc_vh_cond`, 
  }
  
  pgUtil.query(query, function(err, result) {
    vhCondCode = result.rows;
  });
}

function loadSensCode() {
  logger.debug('[msg] loadSensCode...')
  const query = {
    text: `SELECT *  FROM tc_sens_ty`, 
  }
  
  pgUtil.query(query, function(err, result) {
    sensTyCode = result.rows;
  });
}

function loadWeatherCode() {
  logger.debug('[msg] loadWeatherCode...');
  const query = {
    text: `SELECT *  FROM tc_weather order by weather_cd`, 
  }

  pgUtil.query(query, function(err, result) {
    weatherCode = result.rows;
    // logger.dir(weatherCode);
  });
}

module.exports = codeUtil;