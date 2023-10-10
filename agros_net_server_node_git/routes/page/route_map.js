var userUtil = require('../../utils/user_util');
var codeUtil = require('../../utils/code_util');
var userDb = require('../../database/user_db');
var logger = require('../../logger');
const {user} = require('../../config/secret/db_config_dev');
var prjDb = require('../../database/prj_db');
var sidoDB = require('../../database/sido_db');
var sigDB = require('../../database/sig_db');
var trffcSignDB = require('../../database/trffc_sign_db');
var trffcSignTyDB = require('../../database/trffc_sign_ty_db');

const getListMap = function(req, res){
    logger.debug(req.method + ' : ' + req.url);

    if (!userUtil.checkLogin(req)) {
        return res.redirect('/login');
    }

    prjDb.getPrjList(function(prjErr, prjResult){
        sidoDB.getSidoList(function(sidoErr, sidoResult){
            sigDB.getSigList(function(sigErr, sigResult){
                trffcSignTyDB.getTrffcSignTyList(function(trffcTyErr, trffcTyResult){
                    trffcSignDB.getTrffcSignList(function(trffcErr, trffcResult){
                        if(prjErr || sidoErr || sigErr|| trffcTyErr || trffcErr ){
                            var errMsg = prjErr+' | '+sidoErr+' | '+sigErr+' | '+trffcTyErr+' | '+trffcTyErr;
                            logger.error(errMsg);
                            return res.send({success:false, })
                        }
        
         
                        return res.render('data_view_map.ejs',{
                            user: req.user,
                            menuBarShrink: req.cookies.menuBarShrink,
                            tool: 'map',
                            menu: 'list_map',
                            prjList: prjResult,
                            sidoList: sidoResult,
                            sigList: sigResult,
                            trffcList : trffcResult,
                            trffcTyList : trffcTyResult
                        });
                    })
                })
            })
        })
    })
}

const getSigListBySidoCd = function(req, res){
    logger.debug(req.method + ' : '+req.url);

    var sidoCd = req.params.sidoCd;
    
    if(!sidoCd){
        logger.error('invalid sidoCd');
        return res.send({success: false, msg : 'invalid params'});
    }

    prjDb.getPrjList(function(prjErr, prjResult){
        sidoDB.getSidoList(function(sidoErr, sidoResult){
            sigDB.getSigListBySido(sidoCd, function(sigErr, sigResult){
                if(prjErr || sidoErr || sigErr ){
                    var errMsg = prjErr+' | '+sidoErr+' | '+sigErr;
                    logger.error(errMsg);
                    return res.send({success:false, })
                }


                return res.render('data_view_map.ejs',{
                    user: req.user,
                    menuBarShrink: req.cookies.menuBarShrink,
                    tool: 'map',
                    menu: 'list_map',
                    prjList: prjResult,
                    sidoList: sidoResult,
                    sigList: sigResult
                });
            })
        })
    })
}

module.exports.getListMap = getListMap;