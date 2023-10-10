var logger = require('../../logger');

const userUtil = require('../../utils/user_util');
const codeUtil = require('../../utils/code_util');

const getDashboard = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    return res.render('stat_dashboard.ejs', {
        user: req.user,
        menuBarShrink: req.cookies.menuBarShrink,
        tool: 'statistics',
        menu: 'dashboard',
        // customTool : '사용자 계정 생성', 
    });
}




module.exports.getDashboard = getDashboard;
