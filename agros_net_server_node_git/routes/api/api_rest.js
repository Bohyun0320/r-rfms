var authUtil = require("../../utils/auth_util");
var secureUtil = require("../../utils/secure_util");
var config = require("../../config/config");
var logger = require("../../logger");
var prjDb = require("../../database/prj_db");
var vhDb = require("../../database/vehicle_db");
var sensDb = require("../../database/sens_db");
var dataCamDb = require("../../database/data_cam_db");
var dataLidarDb = require("../../database/data_lidar_db");
var dataMetaDb = require("../../database/data_meta_db");
var dataUtil = require("../../utils/data_util");

// const path = require("path");
// const fse = require("fs-extra");
// const { file } = require("jszip");
// const fs = require("fs").promises;

var postAuthTokken = function (req, res) {
  logger.debug(req.method + " : " + req.url);

  var id = req.body.id;
  var pw = req.body.password;

  if (!id && req.body.authId)
    id =req.body.authId;

  if (!pw && req.body.authPassword) {
    pw = req.body.authPassword;
  }

  logger.debug("id : " + id + ", pw : " + pw);

  authUtil.getTokenByIdPw(id, pw, function (err, result) {
    if (err || !result) {
      return res.send({ success: false, msg: "Failed to get token" });
    }

    return res.send({ success: true, msg: "success!", token: result });
  });
};

var getEquipList = function (req, res) {
  logger.debug(req.method + " : " + req.url);

  var tokenInfo = authUtil.verifyReq(req);

  if (!tokenInfo) {
    logger.debug("[err]Authentication failed");
    return res.send({ success: false, msg: "Authentication failed" });
  }

  // logger.debug('Authorized req');
  // logger.dir(tokenInfo);

  vhDb.getSimpleList(function (vhErr, vhResult) {
    sensDb.getSimpleList(function (sensErr, sensResult) {
      if (vhErr || sensErr) {
        logger.error("error accoured!");
        logger.dir(vhErr || sensErr);

        return res.send({ success: false, msg: "select db failed!" });
      }

      return res.send({
        success: true,
        msg: "get equipList success",
        vhList: vhResult,
        sensList: sensResult,
      });
    });
  });
};

var postPrjAdd = function (req, res) {
  logger.debug(req.method + " : " + req.url);

  var tokenInfo = authUtil.verifyReq(req);

  if (!tokenInfo) {
    logger.debug("[err]Authentication failed");
    return res.send({ success: false, msg: "Authentication failed" });
  }

  try {
    var prjInfo = {
      name: secureUtil.check(req.body.name),
      prjno: secureUtil.check(req.body.prjno),
      vhid: Number(req.body.vhid),
      camsensid: Number(req.body.camsensid),
      lidarsensid: Number(req.body.lidarsensid),
      userid: tokenInfo.user_id,
      memo: req.body.memo,
      pnucd: req.body.pnucd,
      weathercd: req.body.weathercd,
    };
  } catch (ex) {
    logger.error(logger.obj(ex));
    return res.send({ success: false, msg: ex });
  }

  logger.dir(prjInfo);

  prjDb.insertPrjInfo(prjInfo, function (err, result) {
    if (err) {
      logger.error("err : " + err);
      return res.send({ result: false, msg: err, data: null });
    }

    // result.path = path.resolve(config.getDataPath().original, String(result.prj_id));
    // fse.ensureDirSync(result.path);

    dataUtil.mkPrjDir(result.prj_id);

    logger.dir(result);

    return res.send({
      success: err ? false : true,
      msg: "프로젝트 정보가 저장 되었습니다.",
      data: result,
    });
  });
};

var getPrjScan = async function (req, res) {
  logger.debug(req.method + " : " + req.url + " - getPrjScan");

  var prjId = Number(req.params.prjid);

  try {
    let prjFiles = await dataUtil.scanPrjData(prjId);
    return res.send({success: true, msg : 'project scan succeed', data : prjFiles});

  }catch(e) {
    logger.error(e);
    return res.send({success: false, msg: "e", data: null,});
  }
};

var getPrjData = function (req, res) {
  logger.debug(req.method + " : " + req.url);

  var prjId = Number(req.params.prjid);
  logger.debug("getPrjData() - prjId : " + prjId);

  dataCamDb.getPrjData(prjId, function (err, result) {
    if (err) {
      return res.send({ success: false, msg: "read data failed!" });
    }

    return res.send({ success: true, msg: "read data succeed!", data: result });
  });
};

var postPrcData = function (req, res) {
  logger.debug(req.method + " : " + req.url);

  var prcInfo = {
    photo_id: req.body.photo_id,
    prc_ty: req.body.prc_ty,
    prj_update: req.body.prj_update ? req.body.prj_update == "true" : false,
  };

  if (prcInfo.prc_ty == "start") {
    dataCamDb.updateStartDt(prcInfo.photo_id, function (err, result) {
      if (err || !result || !result.rows) {
        return res.send({ success: false, msg: "update start time failed!" });
      }

      if (prcInfo.prj_update) {
        var prjId = result.rows[0].prj_id;
        prjDb.updateStartDt(prjId, function (err, prjResult) {
          if (err || !prjResult) {
            return res.send({ success: false, msg: "project update failed" });
          }
          return res.send({
            success: true,
            msg: "update start time (data & project) succeed!",
            data: result.rows[0],
          });
        });
      } else {
        return res.send({
          success: true,
          msg: "update start time (data) succeed!",
          data: result.rows[0],
        });
      }
    });
  } else {
    dataCamDb.updateEndDt(prcInfo.photo_id, function (err, result) {
      if (err || !result || !result.rows || !result.rows[0]) {
        return res.send({ success: false, msg: "update end time failed!" });
      }

      if (prcInfo.prj_update) {
        var prjId = result.rows[0].prj_id;

        prjDb.updateEndDt(prjId, function (err, prjResult) {
          if (err || !prjResult) {
            return res.send({ success: false, msg: "project update failed" });
          }
          return res.send({
            success: true,
            msg: "update end time (data & project) succeed!",
            data: result.rows[0],
          });
        });
      } else {
        return res.send({
          success: true,
          msg: "update end time (data) succeed!",
          data: result.rows[0],
        });
      }
    });
  }

  // return res.send({success: true, msg: 'test done', data : prcInfo});
};


var postFinishPrcData = async function (req, res) {
  logger.debug(req.method + " : " + req.url + " - postFinishPrcData()");

  var prjId = req.body.prjId ? Number(req.body.prjId) : null;

  if (!prjId) {
    var errMsg = "no prjid";
    logger.error(errMsg);

    return res.send({ success: false, msg: errMsg });
  }

  try {
    let result = await prjDb.updatePrjStts(prjId, 4);

    if (!result.rows || result.rows.length==0) {
      throw('no updated project');
    }

    return res.send({success: true, msg: "prj status updated", data: result.rows[0],});

  } catch (err) {
    logger.error(err);

    return res.send({ success: false, msg: err, data: null });
  }
};

var postPrjSync = async function (req, res) {
  logger.debug(req.method + " : " + req.url + " - postSyncData()");

  var prjId = req.body.prjid ? Number(req.body.prjid) : null;
  var startPrcs = req.body.startPrcs ? startPrcs == "true" : true;

  if (!prjId) {
    var errMsg = "no prjid";
    logger.error(errMsg);

    return res.send({ success: false, msg: errMsg });
  }

  // const dataUtil = require("../../utils/data_util");

  try {
    var updateRes = await dataUtil.syncMetaData(prjId);

    let statResult = await prjDb.updatePrjStts(prjId, 2);

    if (!statResult || !statResult.rows || statResult.rows.length == 0) throw 'invalid pid';

    logger.debug("start process : " + startPrcs);

    return res.send({
      success: true,
      msg: "sync Meta data done",
      data: statResult.rows[0],
    });
  } catch (err) {
    logger.error(err);

    return res.send({ success: false, msg: '데이터 싱크에 실패 했습니다.', data: err });
  }
};

var postMetaData = async function (req, res) {
  logger.debug(req.method + " : " + req.url + " - postMetaData()");

  var tokenInfo = authUtil.verifyReq(req);

  if (!tokenInfo) {
    logger.debug("[err]Authentication failed");
    return res.send({ success: false, msg: "Authentication failed" });
  }

  var params = {
    prjId: req.body.prjId ? Number(req.body.prjId) : null,
    fileNm: req.body.fileNm ? req.body.fileNm : null,
    time: req.body.time ? dataUtil.getDate(req.body.time) : null,
    // time : req.body.time ? new Date(Number(req.body.time)) : null,
    // time : req.body.time ? req.body.time : null,
    lat: req.body.lat ? req.body.lat : null,
    lon: req.body.lon ? req.body.lon : null,
    x: req.body.x ? req.body.x : null,
    y: req.body.y ? req.body.y : null,
    z: req.body.z ? req.body.z : null,
    roll: req.body.roll ? req.body.roll : null,
    pitch: req.body.pitch ? req.body.pitch : null,
    yaw: req.body.time ? req.body.yaw : null,
  };

  // return res.send({success: true, msg: 'test done', data: params});

  if (!params.prjId || !params.fileNm || !params.time) {
    return res.send({ success: false, msg: "invalid params", data: params });
  }

  var fileStat = dataUtil.getFileInfo(params.prjId, "cam", params.fileNm);
  logger.dir(params);

  if (!fileStat) {
    var errMsg = "invalid file name : " + params.fileNm;
    return res.send({ success: false, msg: errMsg, data: null });
  }

  params.fileLen = fileStat.size;
  params.path = fileStat.path;
  params.regTy = 3; // FTP 업로드
  params.dateReg = new Date();

  dataCamDb.insertWithMeta(params, function (err, result) {
    if (err) {
      logger.error(err);
      return res.send({ success: false, msg: "db insert failed", data: err });
    }

    return res.send({
      success: true,
      msg: "db insert succeed",
      data: result.rows[0],
    });
  });
};

var postFinishData = async function (req, res) {
  logger.debug(req.method + " : " + req.url + " - postFinishData()");

  var tokenInfo = authUtil.verifyReq(req);

  if (!tokenInfo) {
    logger.debug("[err]Authentication failed");
    return res.send({ success: false, msg: "Authentication failed" });
  }

  var params = {
    prjId: req.body.prjId ? Number(req.body.prjId) : null,
    use: req.body.use && req.body.use.toLowerCase() === "y" ? true : false,
  };

  if (!params.prjId) {
    return res.send({ success: false, msg: "invalid params", data: params });
  }

  await prjDb.updatePrjStts(params.prjId, 2);
  await prjDb.updateUse(params.prjId, params.use);

  try {
    let prjFiles = await dataUtil.scanPrjData(params.prjId);
    let updated = await dataUtil.syncMetaData(params.prjId);

    return res.send({success: true, msg : 'prj data update succeed ', data: prjFiles});

  }catch(e) {
    logger.error(e);
    return res.send({ success: false, msg: "db insert failed", data: e });
  }

  // to scan and insert DB
  // var prjDataList = {
  //   lidar: await dataUtil.getDataList(params.prjId, "lidar"),
  //   meta: await dataUtil.getDataList(params.prjId, "meta"),
  // };

  // logger.dir(prjDataList);

  // var insertList = {};

  // try {
  //   if (prjDataList.lidar && prjDataList.lidar.length > 0) {
  //     insertList.lidar = await dataLidarDb.insertDataInfoListSync(prjDataList.lidar);
  //   }

  //   if (prjDataList.meta && prjDataList.meta.length > 0) {
  //     insertList.meta = await dataMetaDb.insertDataInfoListSync(prjDataList.meta);
  //   }

  //   return res.send({ success: true, msg: "project data finished", data: prjDataList });
  // } catch (e) {
  //   logger.error(e);
  //   return res.send({ success: false, msg: "db insert failed", data: e });
  // }
};

var postClonePrj = async function (req, res) {
  logger.debug(req.method + " : " + req.url + " - postClonePrj()");

  var tokenInfo = authUtil.verifyReq(req);

  if (!tokenInfo) {
    logger.debug("[err]Authentication failed");
    return res.send({ success: false, msg: "Authentication failed" });
  }

  var params = {
    srcPrjId: req.body.srcPrjId ? Number(req.body.srcPrjId) : null,
    prjNm: req.body.prjNm ? req.body.prjNm : null,
    prjNo: req.body.prjNo ? req.body.prjNo : null,
  };

  logger.dir(params);

  if (!params.srcPrjId) {
    return res.send({ success: false, msg: "invalid params", data: params });
  }

  var srcPrjInfo = await prjDb.getPrjInfoSync(params.srcPrjId);

  if (!srcPrjInfo) {
    return res.send({ success: false, msg: "no prjInfo", data: params });
  }

  var dateString = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");

  var newPrjIngo = {
    name: params.prjNm ? params.prjNm : srcPrjInfo.prj_nm + "-c" + "-" + dateString,
    prjno: params.prjNo ? params.prjNo : srcPrjInfo.prj_no + "-c" + "-" + dateString,
    vhid: srcPrjInfo.vh_id,
    camsensid: srcPrjInfo.cam_sens_id,
    lidarsensid: srcPrjInfo.lidar_sens_id,
    userid: tokenInfo.user_id,
    memo: srcPrjInfo.prj_memo_cn,
    pnucd: srcPrjInfo.pnu_cd,
    weathercd: srcPrjInfo.weather_cd,
  };

  prjDb.insertPrjInfo(newPrjIngo, async function (err, result) {
    if (err || !result) {
      logger.error(err);
      return res.send({ success: false, msg: err, data: null });
    }

    result.renDirErr = dataUtil.rmPrjDir(params.srcPrjId, result.prj_id);

    if (result.renDirErr) {
      await prjDb.delPrjInfo(result.prj_id);
      return res.send({ success: false, msg: "rename directory failed!", data: result.renDirErr });
    }
    await dataCamDb.moveData(params.srcPrjId, result.prj_id);
    await dataLidarDb.moveData(params.srcPrjId, result.prj_id);
    await dataMetaDb.moveData(params.srcPrjId, result.prj_id);

    result.mkDirErr = dataUtil.mkPrjDir(params.srcPrjId);
    result.path = dataUtil.getPrjPath(result.prj_id);

    // logger.dir(result);

    return res.send({ success: true, msg: "clone project succeed", data: result });
  });
};

module.exports.postAuthTokken = postAuthTokken;
module.exports.getEquipList = getEquipList;

module.exports.postPrjAdd = postPrjAdd;
module.exports.getPrjScan = getPrjScan;
module.exports.getPrjData = getPrjData;
module.exports.postPrjSync = postPrjSync;

module.exports.postMetaData = postMetaData;
module.exports.postFinishData = postFinishData;
module.exports.postClonePrj = postClonePrj;

module.exports.postPrcData = postPrcData;
module.exports.postFinishPrcData = postFinishPrcData;
