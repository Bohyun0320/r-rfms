var config = require('../../config/config');
var secureUtil = require('../../utils/secure_util');
var localStorage = require('../../storage/local_storage');
var logger = require('../../logger');
var vhDb = require('../../database/vehicle_db');
var sensDb = require('../../database/sens_db');
var gridUtil = require('../../utils/grid_util');
var paramUtil = require('../../utils/param_util');
var csvUtil = require('../../utils/csv_util');

var uploadEquipPhoto = localStorage.multer('photo', config.path.equipImage.original);

let uploadSensFiles = localStorage.multerFileds(
    [{name : 'photo'}, {name : 'io_file'} ], config.path.equipImage.original, false, false);

var postAddVehicle = function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  try {
    var vhInfo = {
      name: secureUtil.check(req.body.name),
      pnuid: Number(req.body.pnuid),
      owner: secureUtil.check(req.body.owner),
      no: secureUtil.check(req.body.vhno),
      vhid: Number(req.body.vhid),
      cond: Number(req.body.cond),
      memo: secureUtil.check(req.body.memo),
      photo: req.file === undefined ? null : config.path.equipImage.static + req.file.filename,
    }

  } catch (ex) {
    logger.error(logger.obj(ex));
    return res.send({ success: false, msg: ex });
  }

  // logger.dir(vhInfo);

  vhDb.insertVhInfo(vhInfo, function (err, result) {
    if (err) {
      logger.error('err : ' + err.stack);
    }

    return res.send({ success: err ? false : true, msg: '차량정보가 저장 되었습니다.', data: vhInfo });

  })

}

var postUpdateVehicle = function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  try {
    var vhInfo = {
      vhid: Number(req.body.vhid),
      name: secureUtil.check(req.body.name),
      pnuid: Number(req.body.pnuid),
      owner: secureUtil.check(req.body.owner),
      no: secureUtil.check(req.body.vhno),
      cond: Number(req.body.cond),
      memo: secureUtil.check(req.body.memo),
      photo: req.file === undefined ? null : config.path.equipImage.static + req.file.filename,
    }

  } catch (ex) {
    logger.error(logger.obj(ex));
    return res.send({ success: false, msg: ex });
  }

  logger.dir(vhInfo);

  
  vhDb.updateVhInfo(vhInfo, function (err, result) {
    if (err) {
      logger.error('err : ' + err.stack);
      return res.send({success: false, msg : err});
    }
    
    return res.send({ success: err ? false : true, msg: '차량정보가 수정 되었습니다.', data: vhInfo });
    
  })
  
  // return res.send({success: true, msg : 'test done'});
}

async function addIoFileInfo (req, info) {
  if (!req || !req.files || !req.files.io_file) {
    return info;
  }

  logger.dir(req.files.io_file);
  let csv = await csvUtil.parseCsvSync(req.files.io_file[0].path);

  // logger.dir(csv);

  info.scaleXy = csv[0].SCALE_XY;
  info.ppsXy = csv[0].PPS_XY;
  info.imgSize = csv[0].IMAGE_SIZE;
  info.radDist = csv[0].RADIAL_DISTORTION;
  info.tanDist = csv[0].TANGENTIAL_DISTORTION;
  info.rotation = csv[0].ROTATION;
  info.trans = csv[0].TRANSLATION;

  return info;
}

var postAddSens = async function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  try {
    var sensInfo = {
      type: Number(req.body.sens_ty),
      name: secureUtil.check(req.body.name),
      no: secureUtil.check(req.body.sensno),
      vhid: Number(req.body.vhid),
      pnuid: Number(req.body.pnuid),
      owner: secureUtil.check(req.body.owner),
      cond: Number(req.body.cond),
      memo: secureUtil.check(req.body.memo),
      // photo: req.file === undefined ? null : config.path.equipImage.static + req.file.filename,
    }

    // logger.dir(req.files);

    if (req.files && req.files.photo) {
      sensInfo.photo = config.path.equipImage.static + req.files.photo[0].filename;
    }

    sensInfo = await addIoFileInfo(req, sensInfo);

    sensInfo.spec = JSON.stringify(paramUtil.getSpecObj(sensInfo.type, req.body));

  } catch (ex) {
    logger.error(logger.obj(ex));
    return res.send({ success: false, msg: ex });
  }

  logger.dir(sensInfo);

  sensDb.inserSensInfo(sensInfo, function(err, result) {
    if (err) {
      logger.error('err : ' + err.stack);
    }

    return res.send({success : err ? false:true, msg : '센서정보가 저장 되었습니다.', data : sensInfo});

  })
  // return res.send({success :true, msg : 'test done!', data : null});
}

var postUpdateSens = async function (req, res) {
  logger.debug(req.method + ' : ' + req.url);

  try {
    var sensInfo = {
      sensid : Number(req.body.sensid),
      type: Number(req.body.sens_ty),
      name: secureUtil.check(req.body.name),
      no: secureUtil.check(req.body.sensno),
      vhid: Number(req.body.vhid),
      pnuid: Number(req.body.pnuid),
      owner: secureUtil.check(req.body.owner),
      cond: Number(req.body.cond),
      memo: secureUtil.check(req.body.memo),
      // photo: req.file === undefined ? null : config.path.equipImage.static + req.file.filename,
    }

    if (req.files && req.files.photo) {
      sensInfo.photo = config.path.equipImage.static + req.files.photo[0].filename;
    }

    sensInfo = await addIoFileInfo(req, sensInfo);

    sensInfo.spec = JSON.stringify(paramUtil.getSpecObj(sensInfo.type, req.body));

    logger.dir(sensInfo);

    sensDb.updateSensInfo(sensInfo, async function(err, result) {
      if (err) {
        logger.error('err : ' + err.stack);
        return res.send({success: false, msg : err});
      }

      if (sensInfo.scaleXy) {
        logger.debug('need to update cal info');
        result = await sensDb.updateSensCalInfo(sensInfo);
      }
      
      return res.send({ success: err ? false : true, msg: '센서정보가 수정 되었습니다.', data: result });
    })

  } catch (ex) {
    logger.error(logger.obj(ex));
    return res.send({ success: false, msg: ex });
  }

  
  // return res.send({success :true, msg : 'test done!', data : null});
}

var readVhList = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);

  var vhListInfo = gridUtil.getDefaultInfo(req, 'vh_id');

  logger.dir(vhListInfo);

  vhDb.getReadVhList(vhListInfo, function(err, dbResult) {
    return res.send(gridUtil.convertGridData(vhListInfo, dbResult));
  });
}
var readSensList = function(req, res) {
  logger.debug(req.method + ' : ' + req.url);

  var sensListInfo = gridUtil.getDefaultInfo(req, 'sens_id');

  logger.dir(sensListInfo);

  // vhDb.getReadVhList(sensListInfo, function(err, dbResult) {
  sensDb.getReadSensList(sensListInfo, function(err, dbResult) {
    return res.send(gridUtil.convertGridData(sensListInfo, dbResult));
  });
}


module.exports.uploadEquipPhoto = uploadEquipPhoto;

module.exports.postAddVehicle = postAddVehicle;
module.exports.postUpdateVehicle = postUpdateVehicle;

module.exports.uploadSensFiles = uploadSensFiles;
module.exports.postAddSens = postAddSens;

module.exports.postUpdateSens = postUpdateSens;

module.exports.readVhList = readVhList;
module.exports.readSensList = readSensList;