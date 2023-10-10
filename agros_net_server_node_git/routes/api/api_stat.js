const logger = require('../../logger');
const dataCamDb = require('../../database/data_cam_db');
const dataLidarDb = require('../../database/data_lidar_db');
const dataObjDb = require('../../database/obj_db');
const prjDb = require('../../database/prj_db');
const vehicleDb = require('../../database/vehicle_db');
const sensDb = require('../../database/sens_db');

const getTotalData = async function(req, res) {
  logger.debug(req.method + ' : ' + req.url);

  try{

    let camResult = await dataCamDb.getTotalData();
    let lidarResult =  await dataLidarDb.getTotalData();
    let objResult =  await dataObjDb.getTotalData()

    let result = {
      camDataCount : camResult.count,
      lidatDataCount : lidarResult.count,
      dataObjDbCount : objResult.count
    }

    return res.send({success: true, msg : 'get stat total data succeed', data: result})

  }catch(ex) {
    logger.error('exception occured');
    logger.dir(ex);

    return res.send({success: false, msg : ex, data : null});
  }
}

const getProjectStauts = async function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  logger.debug('[func] getProjectStauts()');

  try{
    let result = await prjDb.getPrjStatusCount();

    return res.send({success: true, msg : 'get stat prj status succeed', data: result})

  }catch(ex) {
    logger.error('exception occured');
    logger.dir(ex);

    return res.send({success: false, msg : ex, data : null});
  }
}

const getDataPeriod = async function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  logger.debug('[func] getDataPeriod()');

  let param = {
    startDt : req.query.startDt,
    endDt : req.query.endDt,
    setp : req.query.setp,
  }

  try{
    let result = await dataCamDb.getStatPeriod(param);

    // logger.dir(result);

    return res.send({success: true, msg : 'get stat data period succeed', data: result})

  }catch(ex) {
    logger.error('exception occured');
    logger.dir(ex);

    return res.send({success: false, msg : ex, data : param});
  }
}

const getDataEquipStatus = async function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  logger.debug('[func] getDataEquipStatus()');

  try{

    // logger.debug('1111')
    let vehResult = await vehicleDb.getTotalCount();
    let senResult = await sensDb.getTotalCount();

    let result = {
      vehicle : vehResult ? vehResult.count : 0,
      sensor : senResult ? senResult.count : 0,
    }

    // logger.debug('222222222222')
    logger.dir(result);


    return res.send({success: true, msg : 'get equip stat succeed', data: result})

  }catch(ex) {
    logger.error('exception occured');
    logger.dir(ex);

    return res.send({success: false, msg : ex, data : null});
  }
}

const getObjStatus = async function(req, res) {
  logger.debug(req.method + ' : ' + req.url);
  logger.debug('[func] getObjStatus()');

  try{

    let result = await dataObjDb.getStatByObjNm();
    logger.dir(result);

    return res.send({success: true, msg : 'get object stat succeed', data: result})

  }catch(ex) {
    logger.error('exception occured');
    logger.dir(ex);

    return res.send({success: false, msg : ex, data : null});
  }
}


module.exports.getTotalData = getTotalData;
module.exports.getProjectStauts = getProjectStauts;
module.exports.getDataPeriod = getDataPeriod;
module.exports.getDataEquipStatus = getDataEquipStatus;
module.exports.getObjStatus = getObjStatus;
