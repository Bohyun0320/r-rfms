var logger = require('../logger');
var postgresUtil = require('../utils/postgres_util');
var queryUtil = require('../utils/query_util');
var vhDb = require('./vehicle_db');
var sensDb = require('./sens_db');
var userDb = require('./user_db');

var prjDB = {};

var prjTableName = 'project_mng';

prjDB.tableName = prjTableName;

prjDB.insertPrjInfo = function (prjInfo, callback) {
  logger.debug('[func]prjDB.inserPrjInfo');
  
  const query = {
    text: `INSERT INTO ` + prjTableName + `\
          (prj_nm, prj_no, vh_id, cam_sens_id, lidar_sens_id, sens_set_id, sv_user_id, prj_memo_cn, pnu_cd, weather_cd) \
          values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) \
          RETURNING *`,
    values: [prjInfo.name, prjInfo.prjno, prjInfo.vhid, prjInfo.camsensid, prjInfo.lidarsensid, prjInfo.senssetid, prjInfo.userid, prjInfo.memo, prjInfo.pnucd, prjInfo.weathercd],
  }
  
  postgresUtil.query(query, function(err, result) {
    if (err) {
      var msg= 'db 입력에 실패했습니다.';

      if (err.constraint == 'project_mng_un_prjnm') {
        msg = '동일한 프로젝트명이 존재 합니다.';

      }else if (err.constraint == 'project_mng_un_prjno') {
        msg = '동일한 프로젝트 번호가 존재 합니다.';
      }

      return callback(msg, null);
    }
    
    return callback(null, result.rows[0]);
  });
}

prjDB.getReadPrjList = function (prjListInfo, callback) {
  logger.debug('[func]prjDB.getReadPrjList()');
  // logger.obj(vhListInfo);

  try {
    var query = {
      text: `SELECT p.*, v.vh_nm, s.sens_nm cam_sens_nm, s2.sens_nm lidar_sens_nm, s3.sens_nm sens_set_nm, u.flnm, t.prj_stts_nm, pnu.sido_nm, pnu.sigungu_nm, \
            count(*) OVER() total \
            FROM ` + prjTableName + ' p '
        + 'LEFT JOIN ' + vhDb.tableName + ' v ' + ' ON p.vh_id = v.vh_id '
        + 'LEFT JOIN ' + sensDb.tableName + ' s ' + ' ON p.cam_sens_id = s.sens_id '
        + 'LEFT JOIN ' + sensDb.tableName + ' s2 ' + ' ON p.lidar_sens_id = s2.sens_id '
        + 'LEFT JOIN ' + sensDb.tableName + ' s3 ' + ' ON p.sens_set_id = s3.sens_id '
        + 'LEFT JOIN ' + userDb.tableName + ' u ' + ' ON p.sv_user_id = u.sv_user_id '
        + 'LEFT JOIN  tc_prj_status t ON p.prj_stts_cd = t.prj_stts_cd '
        + 'LEFT JOIN  tc_pnu_sigungu pnu ON p.pnu_cd = pnu.pnu_cd',
      values: []
    }
  }catch(ex) {
    logger.dir(ex);
  }
  
  query = queryUtil.addFilterQuery(prjListInfo, query);
  query = queryUtil.addSortQuery(prjListInfo, query);
  query = queryUtil.addLimitQuery(prjListInfo, query);

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });

}

prjDB.getPrjInfoSync = function(prjId ) {
  return new Promise((resolve, reject) => {

    prjDB.getPrjInfo(prjId, function(err, result) {
      return resolve(result)
    });
  });
}

prjDB.getPrjInfo = function(prjId, callback) {
  logger.debug('[func]prjDB.getPrjInfo() - prjId : ' + prjId);

  const query = {
    text: `SELECT * \
          FROM ` + prjTableName
      + ` WHERE prj_id = $1`,
    values: [prjId]
  }

  postgresUtil.query(query, function (err, result) {
    if (!result) {
      return callback(err, null);
    }
    return callback(err, result.rows[0]);
  });
}

  // postgresUtil.query(query, function (err, result) {
  //   if (!result) {
  //     return callback(err, null);
  //   }
  //   return callback(err, result.rows[0]);
  // });


prjDB.updatePrjInfo = function (prjInfo, callback) {
  logger.debug('[func]prjDB.updatePrjInfo');
  
  const query = {
    text: `UPDATE ` + prjTableName + ` \
          SET (prj_nm, prj_no, vh_id, cam_sens_id, lidar_sens_id, sens_set_id, sv_user_id, prj_memo_cn, pnu_cd, weather_cd ) \
          = ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) \
          WHERE prj_id = ` + prjInfo.prjid + `\
          RETURNING *`,

    values: [prjInfo.name, prjInfo.prjno, prjInfo.vhid, prjInfo.camsensid, prjInfo.lidarsensid, prjInfo.senssetid, prjInfo.userid, prjInfo.memo, prjInfo.pnucd, prjInfo.weathercd],
  }

  if (prjInfo.photo) {
    query.values.push(prjInfo.photo);
  }
  
  postgresUtil.query(query, function(err, result) {
    if (err) {
      var msg= 'db 입력에 실패했습니다.';

      if (err.constraint == 'project_mng_un_prjnm') {
        msg = '동일한 프로젝트명이 존재 합니다.';

      }else if (err.constraint == 'project_mng_un_prjno') {
        msg = '동일한 프로젝트 번호가 존재 합니다.';
      }

      return callback(msg, null);
    }
    
    return callback(null, result.rows[0]);
  });
}

prjDB.updateStartDt = function(prjId, callback) {
  var curDt = new Date();
  logger.debug('[func]prjDB.updateStartDt() - prjId : ' + prjId + ', curDt :' + curDt);

  const query = {
    text: `UPDATE ` + prjTableName + ` \
          SET prcs_strt_dt = $1 \
          WHERE prj_id = $2 \
          RETURNING *`,

    values: [curDt, prjId],
  }

  postgresUtil.query(query, function(err, result) {
    return callback(err, result);
  });

}

prjDB.updateEndDt = function(prjId, callback) {
  var curDt = new Date();
  logger.debug('[func]prjDB.updateEndDt() - prjId : ' + prjId + ', curDt :' + curDt);

  const query = {
    text: `UPDATE ` + prjTableName + ` \
          SET prcs_end_dt = $1 \
          WHERE prj_id = $2 \
          RETURNING *`,

    values: [curDt, prjId],
  }

  postgresUtil.query(query, function(err, result) {
    return callback(err, result);
  });

}

prjDB.delPrjInfo = function(prjId, withData) {
  return new Promise(async (resolve, reject) => {

    logger.debug('[func]dataCamDB.delPrjData - prjId : ' + prjId);

    if (withData) {
      const dataObjDb = require('./obj_db');
      const dataCamDb = require('./data_cam_db');
      const dataLidarDb = require('./data_lidar_db');
      const dataMetaDb = require('./data_meta_db');
  
      await dataObjDb.delPrjData(prjId);
      await dataCamDb.delPrjData(prjId);
      await dataLidarDb.delPrjData(prjId);
      await dataMetaDb.delPrjData(prjId);
    }

    const query = {
      text: `DELETE FROM ` + prjTableName + `
              WHERE prj_id = $1
              RETURNING *`,
  
      values: [prjId],
    }
  
    postgresUtil.query(query, function(err, result) {
      if (err || !result || !result.rows || result.rows.length == 0) {
        return resolve(null);
      }

      if (result.rows) {
        logger.debug('delete project succeed : ' + prjId);
      }

      return resolve(result.rows);
    });

  });
}

// prj_stts_cd : 프로젝트 상태 코드
//  - 1: 획득중
//  - 2: 획득 완료
//  - 3: 데이터 처리
//  - 4: 데이터 검수
//  - 5: 최종 완료

prjDB.updatePrjStts = function(prjId, sttsCd) {
  return new Promise(async (resolve, reject) => {

    logger.debug('[func]prjDB.updatePrjStts - prjId : ' + prjId);

    const query = {
      text: `UPDATE ` + prjTableName + ` 
            SET (prj_stts_cd, data_clct_dt) = ($1, $2)
            WHERE prj_id = $3 
            RETURNING *`,
  
      values: [sttsCd, new Date(), prjId],
    }
  
    postgresUtil.query(query, function(err, result) {
      if (err) {
        logger.error('update failed - ' + err);
        return reject(err);
      }

      // logger.dir(result.rows[0]);

      return resolve(result);
    });

  });
}

prjDB.updateUse = function(prjId, use) {
  return new Promise(async (resolve, reject) => {

    logger.debug('[func]prjDB.updateUse - prjId : ' + prjId + ', use : ' + use);

    const query = {
      text: `UPDATE ` + prjTableName + ` 
            SET use_yn = $1
            WHERE prj_id = $2 
            RETURNING *`,
  
      values: [use, prjId],
    }
  
    postgresUtil.query(query, function(err, result) {
      if (err) {
        logger.error('update failed - ' + err);
        return reject(err);
      }

      // logger.dir(result.rows[0]);

      return resolve(result);
    });

  });
}

prjDB.getPrjStatusCount = function() {
  return new Promise(async (resolve, reject) => {

    logger.debug('[func]prjDB.getPrjStatusCount');

    const query = {
      text: `select p.prj_stts_cd, s.prj_stts_nm, count(*)::int
            from ` + prjTableName  + ` p
            join tc_prj_status s on p.prj_stts_cd = s.prj_stts_cd  
            group by p.prj_stts_cd, s.prj_stts_nm 
            order by p.prj_stts_cd `,
  
      values: [],
    }
  
    postgresUtil.query(query, function(err, result) {
      if (err) {
        return reject(err);
      }

      return resolve(result.rows);
    });

  });
}

prjDB.getPrjList = function(callback) {
  logger.debug('[func]prjDB.getPrjList()');

  const query = {
    text: `SELECT * FROM ` + prjTableName +
          ` p ORDER BY p.prj_id`,
    values: [],
  }

  postgresUtil.query(query, function(err, result){
    if(!result){
      return callback(err, null);
    }

    return callback(err, result.rows);
  });
}




module.exports = prjDB;