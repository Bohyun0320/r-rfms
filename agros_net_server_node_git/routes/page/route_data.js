var logger = require('../../logger');
const userDb = require('../../database/user_db');
const vhDb = require('../../database/vehicle_db');
const sensDb = require('../../database/sens_db');
const userUtil = require('../../utils/user_util');
const prjDb = require('../../database/prj_db');
const codeUtil = require('../../utils/code_util');

const getListPrj = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    return res.render('data_list_prj.ejs', {
        user: req.user,
        menuBarShrink: req.cookies.menuBarShrink,
        tool: 'data',
        menu: 'listprj',
        // customTool : '사용자 계정 생성', 
    });
}



const getAddPrj = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    vhDb.getSimpleList(function (vhErr, vhResult) {
        sensDb.getSimpleList(function (sensErr, sensResult) {
            userDb.getSimpleList(function (usrErr, usrResult) {

                if (vhErr || sensErr || usrErr) {
                    var errMsg = vhErr + ' | ' + sensErr + ' | ' + usrErr;
                    logger.error(errMsg);
                    return res.send({ success: false, })
                }

                return res.render('data_add_prj.ejs', {
                    user: req.user,
                    menuBarShrink: req.cookies.menuBarShrink,
                    tool: 'data',
                    menu: 'addprj',
                    vhList: vhResult,
                    sensList: sensResult,
                    userList: usrResult,
                    pnuCode: codeUtil.getPnuCode(),
                    weatherCode: codeUtil.getWeatherCode(),
                });
            })
        })
    })
}

const getListDataCam = function(req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    return res.render('data_list_cam.ejs', {
        user: req.user,
        menuBarShrink: req.cookies.menuBarShrink,
        tool: 'data',
        menu: 'listDataCam',
        // customTool : '사용자 계정 생성', 
    });
}

const getListDataLidar = function(req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    return res.render('data_list_lidar.ejs', {
        user: req.user,
        menuBarShrink: req.cookies.menuBarShrink,
        tool: 'data',
        menu: 'listDataLidar',
        // customTool : '사용자 계정 생성', 
    });
}

const getListObj = function(req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    return res.render('data_list_obj.ejs', {
        user: req.user,
        menuBarShrink: req.cookies.menuBarShrink,
        tool: 'data',
        menu: 'listobj',
        // customTool : '사용자 계정 생성', 
    });
}



const getViewPrj = function(req, res) {
    logger.debug(req.method + ' : ' + req.url);

    var prjId = Number(req.params.prjid);

    if (!prjId) {
        logger.error('invalid prjId');
        return res.send({success: false, msg: 'invalid params'});
    }

    vhDb.getSimpleList(function (vhErr, vhResult) {
        sensDb.getSimpleList(function (sensErr, sensResult) {
            userDb.getSimpleList(function (usrErr, usrResult) {
                prjDb.getPrjInfo(prjId, function(prjErr, prjResult) {
                    if (vhErr || sensErr || usrErr || prjErr) {
                        var errMsg = vhErr + ' | ' + sensErr + ' | ' + usrErr + ' | ' + prjErr;
                        logger.error(errMsg);
                        return res.status(400);
                    }
                    
                    return res.render('data_view_prj.ejs', {
                        user: req.user,
                        menuBarShrink: req.cookies.menuBarShrink,
                        tool: 'data',
                        menu: 'listprj',
                        vhList: vhResult,
                        sensList: sensResult,
                        userList: usrResult,
                        prjInfo: prjResult,
                        pnuCode: codeUtil.getPnuCode(),
                        weatherCode: codeUtil.getWeatherCode(),
                    });
                })

            })
        })
    })
}

const getViewData = function(req, res) {
    logger.debug(req.method + ' : ' + req.url);
}



module.exports.getListPrj = getListPrj;
module.exports.getAddPrj = getAddPrj;
module.exports.getListDataCam = getListDataCam;
module.exports.getListDataLidar = getListDataLidar;
module.exports.getListObj = getListObj;

module.exports.getViewPrj = getViewPrj;
module.exports.getViewData = getViewData;


// module.exports.getListVh = getListVh;
// module.exports.getListSens = getListSens;
// module.exports.getAddVehicle = getAddVehicle;
// module.exports.getAddSensor = getAddSensor;
// module.exports.getViewVh = getViewVh;
// module.exports.getViewSens = getViewSens;
