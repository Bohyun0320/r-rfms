var logger = require("../../logger");
var sigDB = require("../../database/sig_db");
var objDB = require("../../database/obj_db");

const postSigBySido = async function(req, res){
    logger.debug(req.method + ' : '+req.url +' :  - postSigBySido()');

    try{
        var sidoCd = req.body.sidoCd;

        if(!sidoCd){
            return res.send({ success: false, msg: "invalid sidoCd : " + sidoCd});
        }

        let sigList = await sigDB.SigListBySido(sidoCd);

        if(!sigList) throw ('not valid info');

        res.json(sigList);
    }catch(ex){
        logger.dir(ex);
        res.json({success: true, msg: ex, data: sidoCd})
    }
}

const postSearchMapByPrj = function(req, res){

    logger.debug(req.method + ' : '+req.url + ' : - postSearchMapByPrj()');

    var prjList = req.body.PrjList;
    var signList = req.body.SignList;
    var updtYn = req.body.updtYn;

    var dataset = {
        "prjList" : prjList,
        "signList" : signList,
        "updtYn" : updtYn
    }

    objDB.getObjListByPrj(dataset, function(err, dbResult){
        if(err){
            logger.error("read err accoured!");
            logger.dir(err);
            return res.send({
                result: false,
                message : "DB를 읽어오는데 실패 했습니다.",
                data: null
            });
        }

        return res.send(dbResult);
    });



}

const postSearchMapByRegion = function(req, res){
    logger.debug(req.method + ' : '+req.url +' :  - postSearchMapByRegion()');

    var sidoCd = req.body.sidoCd;
    var sigCd = req.body.sigCd;
    var signList = req.body.SignList;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var updtYn = req.body.updtYn;

    var dataset = {
        "sigCd" : sigCd,
        "signList" : signList,
        "startDate" : startDate,
        "endDate" : endDate,
        "updtYn" : updtYn
    }

    objDB.getObjListByRegion(dataset, function(err, dbResult){
        if(err){
            logger.error("read err accoured!");
            logger.dir(err);
            return res.send({
                result :false,
                message: "DB를 읽어오는데 실패 했습니다.",
                data:null
            });
        }

        return res.send(dbResult);
    });
}

module.exports.postSearchMapByRegion = postSearchMapByRegion;
module.exports.postSearchMapByPrj = postSearchMapByPrj;
module.exports.postSigBySido = postSigBySido;