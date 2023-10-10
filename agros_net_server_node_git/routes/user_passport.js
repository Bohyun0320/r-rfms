var config = require('../config/config');
var localStorage = require('../storage/local_storage');
var logger = require('../logger');
// var userCnnDb = require('../database/user_cnn_hist_db');
  
module.exports = function(router, passport) {
//    console.log('user_passport 호출됨.');
    logger.debug('init user_passport');

    // 로그아웃
    router.route('/logout').get(function(req, res) {
      console.log('get : /logout');
      
      var usageTime = '없음';
      
      if (req.user) {
        var secsDiff = (new Date().getTime() - req.user.loginTime) / 1000;
        usageTime = formatSecondsAsTime(secsDiff);
      }
      
      req.logout();

      return res.render('logout.ejs', {user: null, menuBarShrink : req.cookies.menuBarShrink, customTool:'로그아웃', usageTime : usageTime});
//        res.redirect('/');
    });

    // 로그인 인증
    router.route('/login').post(function(req, res) {
      console.log('post : /login');
      
      passport.authenticate('local-login', function(err, user, result) {
        if (err) { 
          res.status(500).send('login error');
          console.dir(err);
          return res.send({success:false, msg:'유효하지 않은 접근입니다.'}); 
        }
        
        if (!user) { 
          console.log('login failure');
          return res.send(result);
        }
        
        user.loginTime = new Date().getTime();
//        console.dir(user);
        
        req.logIn(user, function(err) {
          if (err) { 
            logger.error('local passport login failed!');
            logger.dir(err);
            return res.send({success: false, message: '로그인이 실패 했습니다.'}); 
          }

          var usrCnnInfo = {
            conectIp : req.headers['x-forwarded-for'] ||  req.connection.remoteAddress,
            userId : user.user_id,
            conectDt : new Date(user.loginTime),
          }

          logger.dir(usrCnnInfo);

          // userCnnDb.insertCnnInfo(usrCnnInfo, function(err, result) {
          //   if (err) logger.error(err);
          // })
          
          console.log('[msg] login success')
          // console.dir(req.user);

          return res.send(result);
        });
          // return res.send(result);
        
      })(req, res);
    });
  
    // 회원가입 인증
    router.route('/signup').post(localStorage.multer('photo', config.path.profileimage.original), function(req, res) {
      console.log('[passport]post : /signup');
      
      passport.authenticate('local-signup', function(err, user, info) {
        if (err) { 
          res.status(500).send('signup error');
          console.dir(err);
          return ; 
        }
        
        if (!user) { 
          console.log('invalid user value : ' + info.signupMessage);
//          return res.render('signup', {msg:info.signupMessage}); 
          return res.send({success: false, msg:info.signupMessage});
        }
        
        return res.send({success: true, msg: '계정이 생성 되었습니다.'});
        
//        req.logIn(user, function(err) {
//          if (err) { 
//            return res.status(500).send('passport login error : '+ err); 
//          }
//          return res.send({success: true, msg: '계정이 생성 되었습니다.'});
//        });
      })(req, res);
    });
};
                                
function formatSecondsAsTime(secs, format) {
  var hr  = Math.floor(secs / 3600);
  var min = Math.floor((secs - (hr * 3600))/60);
  var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

  if (hr < 10)  { hr    = "0" + hr; }
  if (min < 10) { min = "0" + min; }
  if (sec < 10) { sec  = "0" + sec; }
  if (hr)       { hr   = "00"; }

  if (format != null) {
    var formatted_time = format.replace('hh', hr);
    formatted_time = formatted_time.replace('h', hr*1+""); // check for single hour formatting
    formatted_time = formatted_time.replace('mm', min);
    formatted_time = formatted_time.replace('m', min*1+""); // check for single minute formatting
    formatted_time = formatted_time.replace('ss', sec);
    formatted_time = formatted_time.replace('s', sec*1+""); // check for single second formatting
    return formatted_time;
  } else {
    return hr + '시간 ' + min + '분 ' + sec + '초';
  }
}
                                