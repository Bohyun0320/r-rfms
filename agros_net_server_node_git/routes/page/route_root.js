// var strgMgr = require('../../manage/strg_mgr');
var logger = require('../../logger');

var getRoot = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  
//  console.log('[params] user : ');
//  console.dir(req.user);
  
  if (!req.user) {
    return res.redirect('/login');
  }
  
  res.redirect('/stat/dashboard');
  
//  return res.render('index.ejs', {user: req.user, tool:'statistics', menu:'dashboard'});
}

var getLogin = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  
  return res.render('login.ejs', {
    user: null, 
    menuBarShrink : req.cookies.menuBarShrink, 
    // strgStatus : strgMgr.getStrgStatus(),
  });
}

var getLogout = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  
  return res.render('logout.ejs', {
    user: null, 
    menuBarShrink : req.cookies.menuBarShrink, 
    customTool:'로그아웃',
    // strgStatus : strgMgr.getStrgStatus(),
  });
}

module.exports.getRoot = getRoot;
module.exports.getLogin = getLogin;
module.exports.getLogout = getLogout;
