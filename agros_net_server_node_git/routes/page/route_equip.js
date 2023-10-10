var userUtil = require('../../utils/user_util');
var codeUtil = require('../../utils/code_util');
var userDb = require('../../database/user_db');
var vhDb = require('../../database/vehicle_db');
var logger = require('../../logger');
const { user } = require('../../config/secret/db_config_dev');
const sensDb = require('../../database/sens_db');

var getListVh = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    return res.render('equip_list_vh.ejs', {
        user: req.user,
        menuBarShrink: req.cookies.menuBarShrink,
        tool: 'equip',
        menu: 'list_vh',
        // customTool : '사용자 계정 생성', 
    });
}

var getListSens = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    return res.render('equip_list_sens.ejs', {
        user: req.user,
        menuBarShrink: req.cookies.menuBarShrink,
        tool: 'equip',
        menu: 'list_sens',
        // customTool : '사용자 계정 생성', 
    });
}

var getAddVehicle = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    userDb.getUserList('', '', false, function (err, result) {
        return res.render('equip_add_vh.ejs', {
            user: req.user,
            menuBarShrink: req.cookies.menuBarShrink,
            tool: 'equip',
            menu: 'add_vh',
            pnuCode: codeUtil.getPnuCode(),
            condCode: codeUtil.getCondCode(),
            userList: result
        });
    })


}

var getAddSensor = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    userDb.getUserList('', '', false, function (err, userResult) {

        vhDb.getSimpleList(function (err, vhListResult) {

            return res.render('equip_add_sens.ejs', {
                user: req.user,
                menuBarShrink: req.cookies.menuBarShrink,
                tool: 'equip',
                menu: 'add_sens',
                pnuCode: codeUtil.getPnuCode(),
                condCode: codeUtil.getCondCode(),
                sensCode: codeUtil.getSensCode(),
                userList: userResult,
                vhList: vhListResult
            });
        })
    })
}

var getViewVh = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);
    var vhId = Number(req.params.vhid);
    logger.debug('vhId : ' + vhId);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    if (!vhId) {
        return res.send({ success: false, msg: 'invalid params' });
    }

    userDb.getUserList('', '', false, function (err, userResult) {

        vhDb.getVhInfo(vhId, function (err, vhResult) {
            return res.render('equip_info_vh.ejs', {
                user: req.user,
                menuBarShrink: req.cookies.menuBarShrink,
                tool: 'equip',
                menu: 'list_vh',
                pnuCode: codeUtil.getPnuCode(),
                condCode: codeUtil.getCondCode(),
                sensCode: codeUtil.getSensCode(),
                userList: userResult,
                vhInfo: vhResult
            });
        })
    })
}

var getViewSens = function (req, res) {
    logger.debug(req.method + ' : ' + req.url);

    var sensId = Number(req.params.sensid);
    logger.debug('vhId : ' + sensId);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    if (!sensId) {
        return res.send({ success: false, msg: 'invalid params' });
    }

    userDb.getUserList('', '', false, function (err, userResult) {

        vhDb.getSimpleList(function (err, vhListResult) {

            sensDb.getSensInfo(sensId, function (err, sensResult) {
                return res.render('equip_info_sens.ejs', {
                    user: req.user,
                    menuBarShrink: req.cookies.menuBarShrink,
                    tool: 'equip',
                    menu: 'list_sens',
                    pnuCode: codeUtil.getPnuCode(),
                    condCode: codeUtil.getCondCode(),
                    sensCode: codeUtil.getSensCode(),
                    userList: userResult,
                    vhList: vhListResult,
                    sensInfo: sensResult
                });
            })
        });
    });

}



module.exports.getListVh = getListVh;
module.exports.getListSens = getListSens;
module.exports.getAddVehicle = getAddVehicle;
module.exports.getAddSensor = getAddSensor;
module.exports.getViewVh = getViewVh;
module.exports.getViewSens = getViewSens;
