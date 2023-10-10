var winston = require('winston');
var winstonDaily = require('winston-daily-rotate-file');
var fs = require('fs');
var util = require('util');

require('date-utils');

var config = require('./config/config');
var logDir = config.path.log.original;

/* ==========================
log level : { 
  error: 0,
  warn: 1, 
  info: 2, 
  verbose: 3, 
  debug: 4,
  silly: 5 
}
========================== */
var logger = winston.createLogger({
  
  format : winston.format.printf(
        info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`),
  
  transports: [
    new (winstonDaily)({
      name : 'debug-file',
      filename : logDir + '/server/excode_node_debug_%DATE%.log',
      datePattern : 'YYYY-MM-DD',
      colorize : false,
      maxsize : 50000000,
      maxFile : 1000,
      level : 'debug',
//      format : winston.format.printf(
//        info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)

    }),
    
    new (winstonDaily)({
      name : 'info-file',
      filename : logDir + '/server/excode_node_info_%DATE%.log',
      datePattern : 'YYYY-MM-DD',
      colorize : false,
      maxsize : 50000000,
      maxFile : 1000,
      level : 'info',
//      format : winston.format.printf(
//        info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)

    }),
    
    new(winston.transports.Console)({
      name : 'debug-console',
      colorize : true,
      level : 'debug',
//      format : winston.format.printf(
//        info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)

    })
    
  ],
  
  exceptionHandlers : [
    new (winstonDaily)(
    {
      name : 'exception-file',
      filename : logDir + '/exception/exception_%DATE%.log',
      datePattern : 'YYYY-MM-DD',
      colorize : false,
      maxsize : 50000000,
      maxFile : 1000,
      level : 'debug',
//      format : winston.format.printf(
//        info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
    }),
    
    new(winston.transports.Console)({
      name : 'exception-console',
      colorize : true,
      level : 'debug',
//      format : winston.format.printf(
//        info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
    })
  ]

});

logger.initSafetyDir = function() {
  
  if (!fs.existsSync(logDir)) {
    console.log('make log dir : ' + logDir);
    fs.mkdirSync(logDir);
  }
}

logger.object = function(object) {
  return util.inspect(object, {depth:null});
}

logger.obj = function(object) {
  return util.inspect(object, {depth:null});
}

logger.dir = function(object) {
  return logger.debug(util.inspect(object, {depth:null}));
}



module.exports = logger;