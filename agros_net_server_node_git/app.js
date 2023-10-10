// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

//Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

//에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');
var pgSession = require('connect-pg-simple')(expressSession);
var postgreUtil = require('./utils/postgres_util');
var cookieConfig = require('./config/secret/cookie_config');

//var MySQLStore = require('express-mysql-session')(expressSession);


//===== Passport 사용 =====//
var passport = require('passport');
var flash = require('connect-flash');

//모듈로 분리한 설정 파일 불러오기
var config = require('./config/config');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');

var dbConfig = require('./config/db_config');

var app = express();

var logUtil = require('./utils/log_util');
logUtil();

var logger = require('./logger');
logger.initSafetyDir();
logger.info('Argos Platform : ' + process.platform);

//var db_config = dbConfig.getConfig();

//var rssUtil = require('./utils/rss_util');

//var i18n = require('./middleware/a1s_i18n');


// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
//console.log('config.server_port : %d', config.server_port);

logger.info('config.server_port : ' + config.server_port);
//logger.debug('config.server_port : '+ config.server_port);
//logger.warn('config.server_port : '+ config.server_port);
//logger.error('config.server_port : '+ config.server_port);

// app.set('port', process.env.PORT || 80);
app.set('port', config.server_port);

// test raw req
// app.use(function(req, res, next) {
//   req.rawBody = '';
//   req.setEncoding('utf8');

//   req.on('data', function(chunk) { 
//     req.rawBody += chunk;
//   });

//   req.on('end', function() {
//     next();
//   });
// });

//body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));
//app.use('/', static(path.join(__dirname, '../static')));
app.use(config.path.storageStatic.static, static(path.join(__dirname, config.path.storageStatic.original)));

if (config.env != 'dev') {
  app.use(config.path.dataNas.static, static(config.path.dataNas.original));
}

//cookie-parser 설정
app.use(cookieParser());

//console.log('cookieConfig.sessionKey : ' + cookieConfig.sessionKey);

app.use(expressSession({
  store: new pgSession({
    pool: postgreUtil.getPool(),// Connection pool
    tableName: 'tn_sesion_info'   // Use another table-name than the default "session" one
  }),
  secret: cookieConfig.sessionKey,
  resave: false,
  saveUninitialized: false,
  //  cookie: { maxAge: 10 * 60 * 1000 } // 10 minutes
}));


// 세션 설정
//app.use(expressSession({
//	secret:'masterpapa.net',
//	resave:true,
//	saveUninitialized:true,
//    cookie: {maxAge: 1000 * 60 * 60 * 3// 쿠키 유효기간 3시간
//    },
//    store:new MySQLStore({
//      host:db_config.host,
//      port:db_config.port,
//      user:db_config.user,
//      password:db_config.password,
//      database:db_config.database
//    })
//}));

//===== Passport 사용 설정 =====//
//Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// Apply Strict-Transport-Security policy 
// 불편사항으로 막음 (브라우저 강제 전환)
// if (config.ssl) {
if (false) {
  const setHSTSHeader = (req, res, next) => {
	  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); 
	  next();
	};

// Apply the middleware to all routes
	app.use(setHSTSHeader);
}

// redirect to https for express
// app.use(function (req, res, next) {
//   if (config.ssl && !req.secure) {
//     let reUrl = "https://" + req.headers.host.split(':')[0] + req.url;
//     // logger.debug("redirect to : " + reUrl);
//     return res.redirect(reUrl);
//   }
//   else {
//     next();
//   }
// });

//라우팅 정보를 읽어들여 라우팅 설정
var router = express.Router();
route_loader.init(app, router);

//패스포트 설정
var configPassport = require('./config/passport');
configPassport(app, passport);

// 패스포트 라우팅 설정
var userPassport = require('./routes/user_passport');
userPassport(router, passport);


//===== 404 에러 페이지 처리 =====//
var errorHandler = expressErrorHandler({
  static: {
    '404': './public/404.html'
  }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//rssUtil.startRssFeedService(60 * 3, 50);

// 코드DB 로딩
var codeUtil = require('./utils/code_util');
codeUtil.init();


// file backdup schedule
var backupUtil = require('./utils/backup_util');
// backupUtil.initSchedule('0 5 * * *');


// App update check
var updateUtil = require('./utils/update_util');
updateUtil.checkUpdate();

/*
fix follow err :
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added. Use emitter.setMaxListeners() to increase limit
*/
require('events').EventEmitter.prototype._maxListeners = 100;


let sslServer = null;

if (config.ssl == true) {
  const https = require('https');
  const fs = require('fs');
  const HTTPS_PORT = 443;

  try {
    let options = {
      key: fs.readFileSync(path.join(__dirname, "cert", "wildcard_geostory_kr.key"), "utf-8"),
      cert: fs.readFileSync(path.join(__dirname, "cert", "wildcard_geostory_kr.crt"), "utf-8"),
      // ciphers: 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384',
      ciphers: 'ALL:!aNULL:!ADH:!eNULL:!LOW:!EXP:RC4+RSA:+HIGH:+MEDIUM',
    };

    sslServer = https.createServer(options, app).listen(HTTPS_PORT, () => {
      logger.info('Express SSL server listening on port ' + HTTPS_PORT);
    });

  } catch (ex) {
    logger.error('ssl server creation failed => ');
    logger.dir(ex);
  }
}

var server = http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
  logger.info('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', (err) => {
  // strgMgr.stopListening();

  setTimeout(function () {
    logger.error("process uncaughtException -> ");
    logger.dir(err);

    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  // strgMgr.stopListening();

  setTimeout(function () {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  }, 1000);
})

// throw new Error("Start Error");
// logger.dir(process.env);



