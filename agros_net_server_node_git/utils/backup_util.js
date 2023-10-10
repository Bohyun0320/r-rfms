var backup = require('backup');
var logger = require('../logger');
var config = require('../config/config');
var fs = require('fs');
var fsEx = require('fs-extra');
require('date-util');
var schedule = require('node-schedule');

var backupUtil = {};

backupUtil.backup = function(callback) {
  var srcPath = config.path.storage.original;
  var trgPath = config.path.backupStorage.original;

  logger.info('backupUtil.backup() - srcPath : ' + srcPath + ', trgPath : ' + trgPath);
  


  // if (!fs.existsSync(trgPath)){
  //   fs.mkdirSync(trgPath);
  //   logger.debug('mkdir : ' + trgPath);
  // }

  try {
    fsEx.ensureDirSync(trgPath);

    trgPath += '/' + new Date().format("yyyy-mm-dd-HH_MM_ss") + '.backup'; 
  
    logger.debug('srcPath : ' + srcPath + ', trgPath : ' + trgPath);
    
    backup.backup(srcPath, trgPath, function(err, filename) {
      return callback(err, filename);
    });
  }catch(e) {
    logger.error(e);
    return callback(e, null);
  }
  
      
  
}


backupUtil.restore = function(filename, callback) {
  logger.info('backupUtil.restore()');
  
  var backupFile = config.path.backupStorage.original + '/' + filename;
  var restore = config.path.restoreStorage.original; 
  
  logger.debug('backupFile : ' + backupFile + ', restore : ' + restore);
  
  try {
    if (!fs.existsSync(restore)){
      fs.mkdirSync(restore);
      logger.debug('mkdir : ' + restore);
    }
    
    backup.restore(backupFile, restore, function(err, path) {
      return callback(err, path);
    });
  }catch(e) {
    logger.error(e);
    return callback(e, null);
  }
  
}

backupUtil.removeOldBackup = function(ageSecond, callback) {
  logger.info('backupUtil.restore()');
  var findRemoveSync = require('find-remove');
  
  var backupPath = config.path.backupStorage.original;
  
  logger.debug('backupPath : ' + backupPath + ', ageSecond : ' + ageSecond);
  
  try {
    var result = findRemoveSync(backupPath, {age: {seconds: ageSecond}, extensions: '.backup'});
  }catch(e) {
    logger.error(e);
    return callback(e, null);
  }
  
  return callback(null, result);
  
}

backupUtil.initSchedule = function(scheduleStr) {
  if (!scheduleStr) {
    scheduleStr = '0 5 * * *';
  }
  
  logger.info('backupUtil.initSchedule() - schedule : ' + scheduleStr);
  
  var j = schedule.scheduleJob(scheduleStr, function() {
    backupUtil.backup(function (err, result) {
      logger.info('backupScheduled - err : ' + logger.object(err) + ', result : ' + result );
    });
    
    var removeAgeSeconds = 60 * 60 * 24 * 30; // 30일
    
    backupUtil.removeOldBackup(removeAgeSeconds, function (err, result) {
      logger.info('removeScheduled - err : ' + logger.object(err) + ', result : ' + result );
    });
  })
  
//  logger.info('backup schedule : ' + logger.object(j));
}

module.exports = backupUtil;