var postgresUtil = require('../utils/postgres_util');
var queryUtil = require('../utils/query_util');
var logger = require('../logger');
var format = require('pg-format');
var vhDb = require('./vehicle_db');
var userDb = require('./user_db');

var sensDB = {};

var tableName = 'sens_mng';
var pnuTableName = 'tc_pnu_sigungu';
var condTableName = 'tc_vh_cond';
var tyTableName = 'tc_sens_ty';

sensDB.tableName = tableName;

sensDB.inserSensInfo = function (sensInfo, callback) {
  logger.debug('[func]sensDB.inserSensInfo');
  
  const query = {
    text: `INSERT INTO ` + tableName + `\
          (sens_ty, sens_nm, sens_no, vh_id, mng_sgg, sv_user_id, cond_cd, sens_memo_cn, sens_img_file_path, sens_spec, scale_xy, pps_xy, image_size, radial_distortion, tangential_distortion, rotation, translation) \
          values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) \
          RETURNING *`,
    values: [sensInfo.type, sensInfo.name, sensInfo.no, sensInfo.vhid, sensInfo.pnuid, sensInfo.owner, sensInfo.cond, sensInfo.memo, sensInfo.photo, sensInfo.spec,
          sensInfo.scaleXy, sensInfo.ppsXy, sensInfo.imgSize, sensInfo.radDist, sensInfo.tanDist, sensInfo.rotation, sensInfo.trans],
  }
  
  postgresUtil.query(query, function(err, result) {
    if (err || !result) {
      return callback(err, null);
    }
    
    return callback(null, result.rows[0]);
  });
}

sensDB.updateSensInfo = function (sensInfo, callback) {
  logger.debug('[func]sensDB.updateSensInfo');

  const query = {
    text: `UPDATE ` + tableName + ` \
          SET (sens_ty, sens_nm, sens_no, vh_id, mng_sgg, sv_user_id, cond_cd, sens_memo_cn, sens_spec` + (sensInfo.photo ? ', sens_img_file_path' : '') + `) \
          = ($1, $2, $3, $4, $5, $6, $7, $8, $9` + (sensInfo.photo ? ', $10' : '') + `) \
          WHERE sens_id = ` + sensInfo.sensid + `\
          RETURNING *`,

    values: [sensInfo.type, sensInfo.name, sensInfo.no, sensInfo.vhid, sensInfo.pnuid, sensInfo.owner, sensInfo.cond, sensInfo.memo, sensInfo.spec],
  }

  if (sensInfo.photo) {
    query.values.push(sensInfo.photo);
  }
  
  postgresUtil.query(query, function(err, result) {
    if (err || !result) {
      return callback(err, null);
    }
    
    return callback(null, result.rows[0]);
  });
}

sensDB.updateSensCalInfo = function (sensInfo) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]sensDB.inserSensInfo');
    
    const query = {
      text: `UPDATE ` + tableName + ` \
            SET (scale_xy, pps_xy, image_size, radial_distortion, tangential_distortion, rotation, translation) 
            = ($1, $2, $3, $4, $5, $6, $7) 
            WHERE sens_id = ` + sensInfo.sensid + `
            RETURNING *`,

      values: [sensInfo.scaleXy, sensInfo.ppsXy, sensInfo.imgSize, sensInfo.radDist, sensInfo.tanDist, sensInfo.rotation, sensInfo.trans],
    }
    
    postgresUtil.query(query, function(err, result) {
      if (err || !result) {
        return reject(err);
      }
      
      return resolve(result.rows[0]);
    });
  });
}

// need to modify
sensDB.getSimpleList = function(callback) {
  logger.debug('[func]sensDB.getSimpleList');

  const query = {
    text: `SELECT * \
          FROM ` + tableName 
          + ' WHERE sens_id > 0' 
          + ' ORDER BY sens_nm', 
  }
  
  postgresUtil.query(query, function(err, result) {
    if (!result) {
      return callback(err, null);
    }
    
    return callback(err, result.rows);
  });

}

sensDB.getReadSensList = function (sensListInfo, callback) {
  logger.debug('[func]sensDB.getReadSensList()');
  // logger.obj(vhListInfo);

  // logger.debug('---check 1---')

  try {
    var query = {
      text: `SELECT s.*, t.sens_ty_nm, v.vh_nm, u.flnm, p.sido_nm, p.sigungu_nm, c.vh_cond_nm, \ 
            count(*) OVER() total \
            FROM ` + tableName + ' s '
        + 'LEFT JOIN ' + tyTableName + ' t ' + ' ON s.sens_ty = t.sens_ty_id '
        + 'LEFT JOIN ' + vhDb.tableName + ' v ' + ' ON s.vh_id = v.vh_id '
        + 'LEFT JOIN ' + userDb.tableName + ' u ' + ' ON s.sv_user_id = u.sv_user_id '
        + 'LEFT JOIN ' + pnuTableName + ' p ' + ' ON s.mng_sgg = p.pnu_id '
        + 'LEFT JOIN ' + condTableName + ' c ' + ' ON s.cond_cd = c.vh_cond_id '
        + 'WHERE s.sens_id > $1 ',
      values: [0]
    }
  }catch(ex) {
    logger.dir(ex);
  }
  

  // logger.debug('---check 2---')

  query = queryUtil.addFilterQuery(sensListInfo, query);
  query = queryUtil.addSortQuery(sensListInfo, query);
  query = queryUtil.addLimitQuery(sensListInfo, query);

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });

}

sensDB.getSensInfo = function (sensId, callback) {
  logger.debug('[func]sensDB.getSensInfo() - sensId : ' + sensId);

  const query = {
    text: `SELECT * \
          FROM ` + tableName
      + ` WHERE sens_id = $1`,
    values: [sensId]
  }

  postgresUtil.query(query, function (err, result) {
    if (!result) {
      return callback(err, null);
    }
    return callback(err, result.rows[0]);
  });
}

sensDB.getTotalCount = function() {
  return new Promise((resolve, reject) => {

    logger.debug('[func]sensDB.getTotalCount()');

    const query = {
      text: `select count(*)::int
              from ` + tableName + ` 
              where cond_cd = 1
              and sens_ty = 3`,

      values: [],
    }

    postgresUtil.query(query, function (err, result) {
      if (err) {
        return reject(err);
      }

      return resolve(result.rows[0]);
    });
  });
}


module.exports = sensDB;