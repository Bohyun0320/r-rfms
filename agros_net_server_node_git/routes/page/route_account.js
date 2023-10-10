var userDb = require('../../database/user_db');
var userUtil = require('../../utils/user_util');
var codeUtil = require('../../utils/code_util');
var logger = require('../../logger');
var secureUtil = require('../../utils/secure_util');

var getSignup = function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  return res.render('signup.ejs', {
    user: req.user ? req.user :null,
    menuBarShrink: req.cookies.menuBarShrink,
    customTool: '사용자 계정 생성',
    userType: codeUtil.getUserType(),
    userSttus: codeUtil.getUserStatus(),
  });
}

var getAccountList = function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  if (!userUtil.checkLogin(req)) {
    return res.redirect('/login');
  }

  // logger.dir(req.cookies);

  return res.render('account_list.ejs', {
    user: req.user,
    menuBarShrink: req.cookies.menuBarShrink,
    tool: 'account',
    menu: 'list',
    userType: codeUtil.getUserType(),
    userSttus: codeUtil.getUserStatus(),
  });

  // userDB.getUserList(null, null, false, function(err, result) {
  //   return res.render('account_list.ejs', {
  //     user: req.user, 
  //     menuBarShrink : req.cookies.menuBarShrink,
  //     tool:'account', 
  //     menu:'list', 
  //     userList : result, 
  //     userType : codeUtil.getUserType(),
  //     userSttus : codeUtil.getUserStatus(),
  //     // scrtDbStatus : scrtDbUtil.getScrtDbStatus(),
  //   });

  // });

}

var getAccountView = function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  if (!userUtil.checkLogin(req)) {
    return res.redirect('/login');
  }

  var email = secureUtil.check(req.params.email);
  logger.debug('email : ' + email);

  if (!email) {
    return res.send({ success: false, msg: 'invalid params' });
  }

  userDb.findOne(email, function(err, result) {
    if (err || !result) {
      return res.redirect('/account/list');
    }

    return res.render('account_view.ejs', {
      user: req.user,
      menuBarShrink: req.cookies.menuBarShrink,
      tool: 'account',
      menu: 'edit',
      accountInfo : result,
      userType: codeUtil.getUserType(),
      userSttus: codeUtil.getUserStatus(),
    });
  })

}

var getAccountMy = function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  if (!userUtil.checkLogin(req)) {
    return res.redirect('/login');
  }

  return res.redirect('/account/view/' + req.user.sv_user_id);
}

module.exports.getSignup = getSignup;
module.exports.getAccountList = getAccountList;
module.exports.getAccountView = getAccountView;
module.exports.getAccountMy = getAccountMy;
