var logger = require("../logger");
const csv = require("csv-parser");
const fs = require("fs");
const fse = require('fs-extra');
const path = require('path');
const dataMetaDb = require('../database/data_meta_db');
const dataCamDb = require('../database/data_cam_db');
const dataLidarDb = require('../database/data_lidar_db');
const config = require('../config/config');

var dataUtil = {};

dataUtil.parseCsvSync = function (fileName) {
  return new Promise((resolve, reject) => {
    parseCsv(fileName, function (err, result) {
      if (err) {
        logger.error(err);
        return reject(err);
      }

      return resolve(result);
    });
  });
};

function parseCsv(fileName, callback) {
  logger.debug("parseCsv - fileName : " + fileName);

  if (!fileName) {
    return callback("no fileName", null);
  }

  const results = [];

  fs.createReadStream(fileName)
    .on("error", (err) => {
      logger.error("parseCsv Err : " + err);
      return callback("parseCsv Err", null);
    })
    // .pipe(csv())
    .pipe(
      csv(["file", "time", "lat", "lon", "x", "y", "z", "roll", "pitch", "yaw"])
    )
    .on("data", (data) => results.push(data))
    .on("end", () => {
      // logger.log(results);
      logger.debug("parseCsv End");
      results.shift();
      return callback(null, results);
    });
}

dataUtil.getPath = function (fileName, maxItem) {
  return new Promise(async (resolve, reject) => {
    logger.debug("getPath - fileName : " + fileName + ", maxItem : " + maxItem);

    if (!fileName || !fileName.length > 0) {
      return reject("유효한 경로가 아닙니다.");
    }

    if (!fileName.toLowerCase().endsWith("csv")) {
      return reject("유효한 메타데이터가 아닙니다.");
    }

    try {
      if (!fs.existsSync(fileName)) {
        return reject("파일이 존재하지 않습니다.");
      }

      var dataList = await dataUtil.parseCsvSync(fileName);

      if (!dataList || dataList.length < 1) {
        return reject("no dataList");
      }

      var dataLen = dataList.length;
      var step = Number((dataLen / maxItem).toFixed());

      if (step < 1) step = 1;
      var filteredList = [];

      logger.debug("dataLen : " + dataLen + ", step : " + step);

      for (var i = 0; i < dataLen; i += step) {
        // logger.debug(i);
        // logger.dir(dataList[i]);

        var data = {
          lat: parseFloat(dataList[i].lat),
          lng: parseFloat(dataList[i].lon),
        };

        filteredList.push(data);
      }

      return resolve(filteredList);
    } catch (err) {
      return reject(err);
    }
  });
};

dataUtil.syncMetaData = function (prjId) {
  return new Promise(async (resolve, reject) => {
    logger.debug('dataUtil.syncMetaData() - prjId : ' + prjId);

    var metaInfo = await dataMetaDb.getPrjDataSync(prjId);

    // logger.debug('2222222222');
    // logger.dir(metaInfo);

    if (!metaInfo) {
      var errMsg = "invalid prjid : " + prjId;
      logger.dir(errMsg);

      return reject(errMsg);
    }

    // var dataUtil = require("../../utils/data_util");

    try {
      var metaInfo = await dataUtil.parseCsvSync(metaInfo.data_file_path);
      var updateRes = await dataCamDb.syncMetaData(prjId, metaInfo);

      return resolve(updateRes);
    } catch (err) {
      logger.error(err);

      return reject(err);
    }
  });
};

dataUtil.getFileInfo = function(prjId, dataTy, fileName) {
  var pathDir = path.join(config.getDataPath().original, String(prjId));
  var fileInfo = {};

  switch(dataTy) {
    case 'cam':
      pathDir = path.join(pathDir, 'cam_file')
      break;

    case 'lidar':
      pathDir = path.join(pathDir, 'lidar_file')
      break;

    case 'meta':
      pathDir = path.join(pathDir, 'meta_file')
      break;
    
    default :
      logger.error('invalid data type : ' + dataTy);
      return null;
  }
  
  var filePath = path.join(pathDir, fileName);

  // logger.debug('[func]dataUtil.getFileInfo - prjId : ' + prjId + ', dataTy :' + dataTy + ', fileName : ' + fileName + ', filePath : ' + filePath);

  try {
    var stat = fs.statSync(filePath);

    if (!stat) {
      logger.error('can not get fileStat - file : ' + filePath);
      return null;
    }

    if (!stat.isFile()) {
      logger.error('is not file! : ' + filePath);
      return null;
    }

    stat.path = filePath;

    return stat;
    
  }catch(e) {
    logger.error(e);
    return null;
  }
}

dataUtil.mkPrjDir = function(prjId) {
  logger.debug('[func]dataUtil.mkPrjDir - prjId : ' + prjId);

  var prjPath = path.resolve(config.getDataPath().original, String(prjId));

  try {
    fse.ensureDirSync(path.join(prjPath, 'cam_file'));
    fse.ensureDirSync(path.join(prjPath, 'lidar_file'));
    fse.ensureDirSync(path.join(prjPath, 'meta_file'));

    return null;
  }catch(e) {
    logger.error(e);
    return e;
  }
}

dataUtil.rmPrjDir = function(orgPrjId, newPrjId) {
  logger.debug('[func]dataUril.rmPrjDir - orgPrjId : ' + orgPrjId + ', newPrjId : ' + newPrjId);

  var orgPrjPath = path.resolve(config.getDataPath().original, String(orgPrjId));
  var newPrjPath = path.resolve(config.getDataPath().original, String(newPrjId));

  try{
    fs.renameSync(orgPrjPath, newPrjPath);

    return null;
  }catch(e) {
    logger.error(e);
    return e;
  }
}

dataUtil.getPrjPath = function(prjId) {
  return path.resolve(config.getDataPath().original, String(prjId));
}

dataUtil.getDate = function(time) {
  logger.debug('[func]dataUtil.getDate - str : ' + time);

  if (!time) {
    return null;
  }

  var timeStr = time.substring(0, 4);
  timeStr += '-' + time.substring(4, 6);
  timeStr += '-' + time.substring(6, 8);
  timeStr += ' ' + time.substring(8, 10);
  timeStr += ':' + time.substring(10, 12);
  timeStr += ':' + time.substring(12);

  logger.debug('timeStr : ' + timeStr);

  return new Date(timeStr);
}


dataUtil.scanPrjData = function(prjId) {
  return new Promise(async (resolve, reject) => {
    
    logger.debug('[func]dataUtil.scanPrjData - prjId : ' + prjId);  

    var prjDataList = {
      cam: await dataUtil.getDataList(prjId, "cam"),
      lidar: await dataUtil.getDataList(prjId, "lidar"),
      meta: await dataUtil.getDataList(prjId, "meta"),
    };
  
    logger.dir(prjDataList);
  
    dataCamDb.insertDataInfoList(prjDataList.cam, function (err, result) {
      if (err) {
        return reject("cam db insert error");
      }
  
      dataLidarDb.insertDataInfoList(prjDataList.lidar, function (err, result) {
        if (err) {
          return reject("lidar db insert error");
        }
  
        dataMetaDb.insertDataInfoList(prjDataList.meta, function (err, result) {
          if (err) {
            return reject("db insert error");
            }
          
          return resolve(prjDataList);
        });
      });
    });
  });
}


// dataTy : 데이터 종류
// 'cam' : 영상데이터
// 'lidar' : 점군데이터
// 'meta' : 메타데이터
dataUtil.getDataList = async function(prjId, dataTy) {
  logger.debug('[func]dataUtil.getDataList - prjId : ' + prjId + ', dataTy : ' + dataTy);

  if (!prjId || isNaN(prjId)) {
    logger.error('invalid prjId : ' + prjId);
    return null;
  }

  var prjPath = path.join(config.getDataPath().original, String(prjId));

  var files = null;
  var dataList = null;

  try {
    switch(dataTy) {
      case 'cam':
        files = await getSubDirFiles(prjPath, "cam_file");
        break;
  
      case 'lidar':
        files = await getSubDirFiles(prjPath, "lidar_file");
        break;
  
      case 'meta':
        files = await getSubDirFiles(prjPath, "meta_file", "csv");
        break;
  
      default:
        logger.error('invalid dataTy : ' + dataTy);
        return null;
    }
  
    if (!files || files.length < 1) {
      logger.error('no prj files - prjPath : ' + prjPath + ', dataTy : ' + dataTy);
      return null;
    }
  
    dataList = getDataList(prjId, files);
    return dataList;

  }catch(e) {
    logger.error(e);
    return null;
  }

}

function getFileSizeSync(filePath) {
  logger.debug('getFileSizeSync() - filePath : ' + filePath);
  var stat = fs.statSync(filePath);

  return stat.size;
}

async function getSubDirFiles(dir, subDir, ext) {
  var filePath = path.join(dir, subDir);
  logger.debug("getSubDirFiles() - dir : " + filePath);
  
  var result = [];

  try {
    fse.pathExists(filePath);

    var fileList = fs.readdirSync(filePath, { withFileTypes: true });
    // logger.dir(fileList)

    if (!fileList || fileList.length <1) {
      return result;
    }

    fileList.forEach(async (file) => {
      if (file.isFile()) {
        // 확장자 처리
        if (ext && file.name.split('.').pop().toLowerCase() != ext) {
          logger.error('fileExt not matched : ' + file.name + ',ext : ' + ext);
          return;
        }

        var eachPath = path.join(filePath, file.name);
        // var stat = await fs.stat(eachPath);
        // logger.dir(stat);
        // // logger.dir(file);
        // result.push({name : file.name, size : stat.size, path: eachPath});
        var fileSize = getFileSizeSync(eachPath);
        logger.debug("size : " + fileSize);
        result.push({ name: file.name, size: fileSize, path: eachPath });
      }
    });

    return result;

  } catch (e) {
    logger.dir(e);
    logger.error("path not exist : " + filePath);
    return result;
  }
}

function getDataList(prjId, files) {
  logger.debug(
    "getDataList() - prjId :" +
      prjId +
      ", length :" +
      (files ? files.length : null)
  );

  // logger.dir(files);

  var dataList = new Array();

  if (!files) {
    logger.error("invalid prjFiles!");
    return dataList;
  }

  files.forEach((file) => {
    dataList.push([prjId, file.name, file.path, file.size, 3]);
  });

  logger.dir(dataList);

  return dataList;
}




module.exports = dataUtil;
