var logger = require("../../logger");
var config = require("../../config/config");
var secureUtil = require("../../utils/secure_util");
var localStorage = require("../../storage/local_storage");
var prjDb = require("../../database/prj_db");
var dataCamDb = require("../../database/data_cam_db");
var dataLidarDb = require("../../database/data_lidar_db");
var dataMetaDb = require("../../database/data_meta_db");
var zipUtil = require("../../utils/zip_util");
var gridUtil = require("../../utils/grid_util");
const { renameSync } = require("fs-extra");
const path = require("path");
const { throws } = require("assert");
var dataUtil = require('../../utils/data_util');
const objDb = require('../../database/obj_db');
const childProcUtil = require('../../utils/childProc_util');

const NAME_CAM_FIELD = "cam_file";
const NAME_LIDAR_FIELD = "lidar_file";
const NAME_META_FIELD = "meta_file";

var postAddPrj = function (req, res) {
    logger.debug(req.method + " : " + req.url);

    logger.dir(req.body.camsensid);

    try {
        var prjInfo = {
            name: secureUtil.check(req.body.name),
            prjno: secureUtil.check(req.body.prjno),
            vhid: req.body.vhid && !isNaN(req.body.vhid) ? Number(req.body.vhid) : null,
            camsensid: req.body.camsensid && !isNaN(req.body.camsensid) ? Number(req.body.camsensid) : null,
            lidarsensid: req.body.lidarsensid && !isNaN(req.body.lidarsensid) ? Number(req.body.lidarsensid): null,
            senssetid: req.body.sensSetId && !isNaN(req.body.sensSetId) ? Number(req.body.sensSetId): null,
            userid: req.body.owner,
            memo: req.body.memo,
            pnucd: req.body.pnucd,
            weathercd: req.body.weathercd,
        };
    } catch (ex) {
        logger.error(logger.obj(ex));
        return res.send({ success: false, msg: ex });
    }

    logger.dir(prjInfo);
    // logger.dir(req.files);

    prjDb.insertPrjInfo(prjInfo, function (err, result) {
        if (err) {
            logger.error("err : " + err);
            return res.send({ result: false, msg: err, data: null });
        }

        logger.dir(result);

        dataUtil.mkPrjDir(result.prj_id);

        return res.send({
            success: err ? false : true,
            msg: "프로젝트 정보가 저장 되었습니다.",
            data: result,
        });
    });

    // return res.send({ success: err ? false : true, msg: '차량정보가 저장 되었습니다.', data: vhInfo });
};

var postDelPrj = async function (req, res) {
    logger.debug(req.method + " : " + req.url + " - postDelPrj()");

    var prjId = req.body.prjId ? Number(req.body.prjId) : null;

    if (!prjId) {
        return res.send({ success: false, msg: "invalid prjId : " + prjId });
    }

    var delPrj = await prjDb.delPrjInfo(prjId, true);

    if (!delPrj) {
        return res.send({
            success: false,
            msg: "프로젝트 정보를 삭제하지 못했습니다.",
        });
    }

    return res.send({ success: true, msg: "project delete succeed" });
};

var postUpdatePrj = function (req, res) {
    logger.debug(req.method + " : " + req.url);

    try {
        var prjInfo = {
            prjid: Number(req.body.prjid),
            name: secureUtil.check(req.body.name),
            prjno: secureUtil.check(req.body.prjno),
            vhid: req.body.vhid && !isNaN(req.body.vhid) ? Number(req.body.vhid) : null,
            camsensid: req.body.camsensid && !isNaN(req.body.camsensid) ? Number(req.body.camsensid) : null,
            lidarsensid: req.body.lidarsensid && !isNaN(req.body.lidarsensid) ? Number(req.body.lidarsensid): null,
            senssetid: req.body.sensSetId && !isNaN(req.body.sensSetId) ? Number(req.body.sensSetId): null,
            userid: req.body.owner,
            memo: req.body.memo,
            pnucd: req.body.pnucd,
            weathercd: req.body.weathercd,
        };
    } catch (ex) {
        logger.error(logger.obj(ex));
        return res.send({ success: false, msg: ex });
    }

    logger.dir(prjInfo);
    logger.dir(req.files);

    prjDb.updatePrjInfo(prjInfo, function (err, result) {
        if (err) {
            logger.error("err : " + err);
            return res.send({ result: false, msg: err, data: null });
        }

        // logger.dir(result);

        return res.send({
            success: err ? false : true,
            msg: "프로젝트 정보가 저장 되었습니다.",
            data: result,
        });
    });

    // return res.send({ success: true, msg: '테스트 - 차량정보가 업데이트 되었습니다.'});
};

var uploadPrjData = localStorage.multerFileds(
    [
        { name: NAME_CAM_FIELD },
        { name: NAME_LIDAR_FIELD },
        { name: NAME_META_FIELD },
    ],
    config.getDataPath().original,
    true,
    "prjid"
);
// config.path.data.original, false, 'prjid');

var postUploadPrjDataProc = function (req, res) {
    logger.debug(req.method + " : " + req.url + "- postUploadPrjDataProc()");

    // logger.dir(req.files);

    var prjData = {
        prjid: Number(req.params.prjid),
        camfile: req.files && req.files.cam_file ? req.files.cam_file : null,
        lidarfile:
            req.files && req.files.lidar_file ? req.files.lidar_file : null,
        metafile: req.files && req.files.meta_file ? req.files.meta_file : null,
    };

    logger.dir(prjData);

    getDataList(prjData, function (err, dataResult) {
        if (err) {
            return res.send({ success: false, msg: err });
        }

        logger.dir(dataResult);

        dataCamDb.insertDataInfoList(dataResult.cam, function (err, result) {
            if (err) {
                return res.send({
                    success: false,
                    msg: "DB 입력에 에러가 발생 했습니다.",
                });
            }

            dataLidarDb.insertDataInfoList(
                dataResult.lidar,
                function (err, result) {
                    if (err) {
                        return res.send({
                            success: false,
                            msg: "DB 입력에 에러가 발생 했습니다.",
                        });
                    }

                    dataMetaDb.insertDataInfoList(
                        dataResult.meta,
                        function (err, result) {
                            if (err) {
                                return res.send({
                                    success: false,
                                    msg: "DB 입력에 에러가 발생 했습니다.",
                                });
                            }

                            return res.send({
                                success: true,
                                msg: "데이터가 업로드 되었습니다.",
                            });
                        }
                    );
                }
            );
        });
    });
};

function getDataList(prjData, callback) {
    logger.debug("getDataListFromPrjInfo()");

    if (!prjData) {
        logger.error("invalid prjData!");
        return callback("정상적인 파일이 아닙니다.", null);
    }

    var dataList = {
        cam: [],
        lidar: [],
        meta: [],
    };

    var camFilePath =
        config.getDataPath().original +
        "/" +
        prjData.prjid +
        "/" +
        NAME_CAM_FIELD;
    // var camFilePath = config.path.data.original + '/' + prjData.prjid + '/' + NAME_CAM_FIELD;

    zipUtil.unzipFiles(
        prjData.camfile,
        camFilePath,
        function (err, unzipResult) {
            if (err) {
                return callback(err, null);
            }

            // cam files
            try {
                if (unzipResult.notZipFiles) {
                    unzipResult.notZipFiles.forEach((file) => {
                        dataList.cam.push([
                            prjData.prjid,
                            file.originalname,
                            path.join(file.destination, file.filename),
                            file.size,
                            1,
                        ]);
                        // dataList.push([prjData.prjid, file.originalname, file.destination + '/' + file.filename, file.size, 1, 1]);
                    });
                }

                if (unzipResult.zipFiles) {
                    unzipResult.zipFiles.forEach((file) => {
                        dataList.cam.push([
                            prjData.prjid,
                            file.originalname,
                            path.join(file.destination, file.filename),
                            file.size,
                            1,
                        ]);
                        // dataList.push([prjData.prjid, file.originalname, file.destination + '/' + file.filename, file.size, 4, 1]);
                    });
                }

                if (unzipResult.extractFiles) {
                    unzipResult.extractFiles.forEach((extFile) => {
                        dataList.cam.push([
                            prjData.prjid,
                            extFile.name,
                            path.join(camFilePath, extFile.name),
                            extFile.size,
                            2,
                        ]);
                        // dataList.push([prjData.prjid, extFile.name, camFilePath + '/' + extFile.name, extFile.size, 1, 2]);
                    });
                }
            } catch (e) {
                logger.error(e);
            }

            // lidar, meta files
            if (prjData.lidarfile) {
                prjData.lidarfile.forEach((file) => {
                    dataList.lidar.push([
                        prjData.prjid,
                        file.originalname,
                        path.join(file.destination, file.filename),
                        file.size,
                        1,
                    ]);
                    // dataList.push([prjData.prjid, file.originalname, file.destination + '/' + file.filename, file.size, 2, 1]);
                });
            }

            if (prjData.metafile) {
                prjData.metafile.forEach((file) => {
                    dataList.meta.push([
                        prjData.prjid,
                        file.originalname,
                        path.join(file.destination, file.filename),
                        file.size,
                        1,
                    ]);
                    // dataList.push([prjData.prjid, file.originalname, file.destination + '/' + file.filename, file.size, 3, 1]);
                });
            }

            return callback(null, dataList);
        }
    );
}

var readPrjList = function (req, res) {
    logger.debug(req.method + " : " + req.url);

    var prjListInfo = gridUtil.getDefaultInfo(req, "prj_id");

    logger.dir(prjListInfo);
    

    // vhDb.getReadVhList(sensListInfo, function(err, dbResult) {
    prjDb.getReadPrjList(prjListInfo, function (err, dbResult) {
        if (err) {
            logger.error("read err accoured!");
            logger.dir(err);
            return res.send({
                result: false,
                message: "DB를 읽어오는데 실패 했습니다.",
                data: null,
            });
        }

        // logger.dir(dbResult);

        return res.send(gridUtil.convertGridData(prjListInfo, dbResult));
    });
};

var readDataCamList = function (req, res) {
    logger.debug(req.method + " : " + req.url);

    var dataListInfo = gridUtil.getDefaultInfo(req, "photo_id");

    logger.dir(dataListInfo);

    // vhDb.getReadVhList(sensListInfo, function(err, dbResult) {
    dataCamDb.getReadDataList(dataListInfo, function (err, dbResult) {
        if (err) {
            logger.error("read err accoured!");
            logger.dir(err);
            return res.send({
                result: false,
                message: "DB를 읽어오는데 실패 했습니다.",
                data: null,
            });
        }

        return res.send(gridUtil.convertGridData(dataListInfo, dbResult));
    });
};

var readDataLidarList = function (req, res) {
    logger.debug(req.method + " : " + req.url);

    var dataListInfo = gridUtil.getDefaultInfo(req, "las_id");

    logger.dir(dataListInfo);

    // if (dataListInfo.filter_type == 'p.prj_id') {
    //     dataListInfo.filter_value = Number(dataListInfo.filter_value);
    // }


    // vhDb.getReadVhList(sensListInfo, function(err, dbResult) {
    dataLidarDb.getReadDataList(dataListInfo, function (err, dbResult) {
        if (err) {
            logger.error("read err accoured!");
            logger.dir(err);
            return res.send({
                result: false,
                message: "DB를 읽어오는데 실패 했습니다.",
                data: null,
            });
        }

        return res.send(gridUtil.convertGridData(dataListInfo, dbResult));
    });
};

var getDataPackage = function (req, res) {
    logger.debug(req.method + " : " + req.url);

    var prjId = Number(req.params.prjid);
    var dataty = req.params.dataty;

    var option = {
        page: req.query.page ? req.query.page : 1,
        perPage: req.query.perPage ? req.query.perPage : 10,
    };

    var dataDb = null;

    if (dataty == "cam_file") {
        dataDb = dataCamDb;
    } else if (dataty == "lidar_file") {
        dataDb = dataLidarDb;
    } else if (dataty == "meta_file") {
        dataDb = dataMetaDb;
    }

    dataDb.getPrjDataPkg(prjId, option, function (err, result) {
        if (err) {
            logger.error("Error accoured!");
            logger.dir(err);
            return res.send({
                success: false,
                msg: "데이터 패키지 정보를 가져오지 못했습니다.",
            });
        }

        return res.send({
            success: true,
            msg: "데이터 패키지 정보를 가져왔습니다.",
            data: result,
        });
    });

    // if (dataty == 'cam_file') {
    //   dataCamDb.getPrjDataPkg(prjId, option, function (err, result) {
    //     if (err) {
    //       logger.error('Error accoured!');
    //       logger.dir(err);
    //       return res.send({ success: false, msg: '데이터 패키지 정보를 가져오지 못했습니다.' });
    //     }

    //     return res.send({ success: true, msg: '데이터 패키지 정보를 가져왔습니다.', data: result });

    //   })
    // }else if (dataty == 'lidar_file') {
    //   dataLidarDb.getPrjDataPkg(prjId, option, function (err, result) {
    //     if (err) {
    //       logger.error('Error accoured!');
    //       logger.dir(err);
    //       return res.send({ success: false, msg: '데이터 패키지 정보를 가져오지 못했습니다.' });
    //     }

    //     return res.send({ success: true, msg: '데이터 패키지 정보를 가져왔습니다.', data: result });

    //   })
    // }else if (dataty == 'meta_file') {
    //   dataMetaDb.getPrjDataPkg(prjId, option, function (err, result) {
    //     if (err) {
    //       logger.error('Error accoured!');
    //       logger.dir(err);
    //       return res.send({ success: false, msg: '데이터 패키지 정보를 가져오지 못했습니다.' });
    //     }

    //     return res.send({ success: true, msg: '데이터 패키지 정보를 가져왔습니다.', data: result });

    //   })
    // }
};

var getDataDownload = function (req, res) {
    logger.debug(req.method + " : " + req.url);

    var dataTy = req.params.dataty;
    var dataId = Number(req.params.dataid);
    if (!dataId) return res.send({ success: false, msg: "invalid params" });

    logger.debug(dataId);

    if (dataTy == "cam") {
        dataCamDb.getSingleData(dataId, function (err, result) {
            if (err || !result) {
                logger.error("getSingleData failed!");
                return res.send({
                    success: false,
                    msg: "데이터를 가져오지 못했습니다.",
                });
            }

            // logger.dir(result);
            return res.download(result.data_file_path, result.org_file_nm);

            // return res.send({success: true, msg : 'test done', data : null});
        });
    } else if (dataTy == "lidar") {
        dataLidarDb.getSingleData(dataId, function (err, result) {
            if (err || !result) {
                logger.error("getSingleData failed!");
                return res.send({
                    success: false,
                    msg: "데이터를 가져오지 못했습니다.",
                });
            }

            // logger.dir(result);
            return res.download(result.data_file_path, result.org_file_nm);

            // return res.send({success: true, msg : 'test done', data : null});
        });
    } else if (dataTy == "meta") {
        dataMetaDb.getSingleData(dataId, function (err, result) {
            if (err || !result) {
                logger.error("getSingleData failed!");
                return res.send({
                    success: false,
                    msg: "데이터를 가져오지 못했습니다.",
                });
            }

            // logger.dir(result);
            return res.download(result.data_file_path, result.org_file_nm);

            // return res.send({success: true, msg : 'test done', data : null});
        });
    }
};

var getDataPath = async function (req, res) {
    logger.debug(req.method + " : " + req.url + " - getDataPath()");

    var prjId = req.params.prjid ? Number(req.params.prjid) : null;

    if (!prjId) {
        var errMsg = "no prjid";
        logger.error(errMsg);

        return res.send({ success: false, msg: errMsg });
    }

    // var prjInfo = await prjDb.getPrjInfoSync(prjId);
    var metaInfo = await dataMetaDb.getPrjDataSync(prjId);

    logger.dir(metaInfo);

    if (!metaInfo || !metaInfo.data_file_path || metaInfo.data_file_path.length < 1) {
        var errMsg = "invalid prjid : " + req.body.prjid;
        logger.error(errMsg);

        return res.send({ success: false, msg: errMsg });
    }

    try {
        var dataUtil = require("../../utils/data_util");

        var pathList = await dataUtil.getPath(metaInfo.data_file_path, 100);

        if (!pathList) {
            throws("no dataList");
        }

        return res.send({
            success: true,
            msg: "get project path succeed",
            dataLen: pathList.length,
            data: pathList,
        });
    } catch (err) {
        logger.error(err);

        return res.send({ success: false, msg: err, data: null });
    }
};

const getLidarImg = async function (req, res) {
    logger.debug(req.method + " : " + req.url + " - getDataPath()");

    try {
        var params = {
            prjId: req.query.prjId && !isNaN(req.query.prjId) ? Number(req.query.prjId) : null,
            fileNm: req.query.fileNm
        }

        if (!params.prjId || !params.fileNm || params.fileNm.length < 1) {
            throw ('not invalid params');
        }

        // logger.debug('111111111');

        params.fileNum = Array.from(params.fileNm.matchAll('\\[(.*?)\\]'), match => `${match[0]}`);
        logger.debug('fileNum : ' + params.fileNum);

        // logger.debug('222222222');

        let imgInfo = await dataCamDb.getInfoByFileNum(params);

        // logger.debug('33333333333');

        if (!imgInfo) throw ('not valid info');

        res.json({ success: true, msg: 'get photo data succeed', data: imgInfo });



    } catch (ex) {
        logger.dir(ex);
        res.json({ success: false, msg: ex, data: params })
    }

}

const startDataProc = async function(req, res) {
    logger.debug(req.method + " : " + req.url + " - startDataProc()");

    try {
        var params = {
            prjId: req.body.prjId && !isNaN(req.body.prjId) ? Number(req.body.prjId) : null,
        }

        if (!params.prjId ) {
            throw ('not invalid params');
        }

        const delPrjObjData = await objDb.delPrjData(params.prjId);
        logger.debug('deleted obj data : ' + delPrjObjData.length);

        const childProcOp = {
            cwd : path.resolve('./scripts/r-rfms'),
            cmd : 'dataProc.bat',
            args : [1, params.prjId]
        }


        childProcUtil.runModuleAsync(childProcOp.cwd, childProcOp.cmd, childProcOp.args, function(err, result) {
            if (err) {
                logger.error('childProc err accoured : ')
                logger.dir(err);
                return;
            }

            logger.error('childProc finished : ')
            logger.dir(result);
            return;
        });
        logger.debug(childProcOp);

        let updateResult = await prjDb.updatePrjStts(params.prjId, 3);

        return res.json({ success: true, msg: 'startDataProc', data: updateResult.rows[0] });



    } catch (ex) {
        logger.dir(ex);
        return res.json({ success: false, msg: ex, data: null })
    }

}

module.exports.postAddPrj = postAddPrj;
module.exports.postDelPrj = postDelPrj;
module.exports.postUpdatePrj = postUpdatePrj;
module.exports.uploadPrjData = uploadPrjData;
module.exports.postUploadPrjDataProc = postUploadPrjDataProc;

module.exports.readPrjList = readPrjList;
module.exports.readDataCamList = readDataCamList;
module.exports.readDataLidarList = readDataLidarList;

module.exports.getDataPackage = getDataPackage;

module.exports.getDataDownload = getDataDownload;

module.exports.getDataPath = getDataPath;

module.exports.getLidarImg = getLidarImg;

module.exports.startDataProc = startDataProc;