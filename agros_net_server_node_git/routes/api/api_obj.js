var logger = require('../../logger');
var config = require('../../config/config');
var secureUtil = require('../../utils/secure_util');
var gridUtil = require('../../utils/grid_util');
var objDb = require('../../database/obj_db');


var readObjList = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);

  var dataListInfo = gridUtil.getDefaultInfo(req, 'o.obj_rs_id');

  logger.dir(dataListInfo);

  objDb.getReadObjList(dataListInfo, function(err, dbResult) {
    if (err) {
      logger.error('read err accoured!');
      logger.dir(err);
      return res.send({result:false, message:'DB를 읽어오는데 실패 했습니다.', data:null});
    }

    return res.send(gridUtil.convertGridData(dataListInfo, dbResult));
  });
}

var readObj = function(req, res){
  logger.debug(req.method + ' : '+req.url);

  console.log("obj_rs_id : "+req.params.objRsId);

  objDb.getReadObj(req.params.objRsId, function(err, dbResult){
    if(err){
      logger.error("read err accoured!");
      logger.dir(err);
      return res.send({
        result: false,
        message: "DB를 읽어오는데 실패 했습니다.",
        data: null
      });
    }

    return res.send(dbResult);
  })
}

// var getDataDownload = function(req, res) {
//   logger.debug(req.method + ' : ' + req.url);

//   var dataId = Number(req.params.dataid);
//   if (!dataId) return res.send({success: false, msg: 'invalid params'})

//   logger.debug(dataId);

//   dataDb.getSingleData(dataId, function(err, result) {
//     if (err || !result) {
//       logger.err('getSingleData failed!');
//       return res.send({success: false, msg : '데이터를 가져오지 못했습니다.'})
//     }

//     // logger.dir(result);
//     return res.download(result.data_file_path, result.org_file_nm);
    
//     // return res.send({success: true, msg : 'test done', data : null});
//   });

// }


module.exports.readObjList = readObjList;
module.exports.readObj = readObj;
