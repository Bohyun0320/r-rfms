var postgresUtil = require('../utils/postgres_util');
var queryUtil = require('../utils/query_util');
var logger = require('../logger');
var format = require('pg-format');
var userDb = require('./user_db');

var vehicleDB = {};

var tableName = 'vh_mng';
var pnuTableName = 'tc_pnu_sigungu';
var condTableName = 'tc_vh_cond'

vehicleDB.tableName = tableName;

vehicleDB.insertVhInfo = function (vhInfo, callback) {
  logger.debug('[func]vehicleDB.insertVhInfo()');

  const query = {
    text: `INSERT INTO ` + tableName + `\
          (vh_nm, vh_no, mng_sgg, sv_user_id, cond_cd, vh_memo_cn, vh_img_file_path) \
          values($1, $2, $3, $4, $5, $6, $7) \
          RETURNING *`,
    values: [vhInfo.name, vhInfo.no, vhInfo.pnuid, vhInfo.owner, vhInfo.cond, vhInfo.memo, vhInfo.photo],
  }

  postgresUtil.query(query, function (err, result) {
    if (err || !result) {
      return callback(err, null);
    }

    return callback(null, result.rows[0]);
  });
}

vehicleDB.updateVhInfo = function (vhInfo, callback) {
  logger.debug('[func]vehicleDB.updateVhInfo()');

  query = {
    text: `UPDATE ` + tableName + ` \
            SET (vh_nm, vh_no, mng_sgg, sv_user_id, cond_cd, vh_memo_cn` + (vhInfo.photo ? ', vh_img_file_path' : '') + `) \
            = ($1, $2, $3, $4, $5, $6` + (vhInfo.photo ? ', $7' : '') + `) \
            WHERE vh_id = ` + vhInfo.vhid + `\
            RETURNING *`,
    // values: [vhInfo.name, vhInfo.no, vhInfo.pnuid,  vhInfo.owner, vhInfo.cond, vhInfo.memo, vhInfo.photo],
    values: [vhInfo.name, vhInfo.no, vhInfo.pnuid, vhInfo.owner, vhInfo.cond, vhInfo.memo],
  }

  if (vhInfo.photo) {
    query.values.push(vhInfo.photo);
  }

  postgresUtil.query(query, function (err, result) {
    if (err || !result) {
      return callback(err, null);
    }

    return callback(null, result.rows[0]);
  });
}

vehicleDB.getSimpleList = function (callback) {
  logger.debug('[func]vehicleDB.getSimpleList');

  const query = {
    text: `SELECT vh_id, vh_nm, vh_no, cond_cd \
          FROM ` + tableName + `
          ORDER BY vh_nm`,
  }

  postgresUtil.query(query, function (err, result) {
    if (!result) {
      return callback(err, null);
    }

    return callback(err, result.rows);
  });

}

vehicleDB.getReadVhList = function (vhListInfo, callback) {
  logger.debug('[func]vehicleDB.getReadVhList()');
  // logger.obj(vhListInfo);

  var query = {
    text: `SELECT v.*, u.flnm, p.sido_nm, p.sigungu_nm, c.vh_cond_nm, \
          count(*) OVER() total \
          FROM ` + tableName + ' v '
      + 'LEFT JOIN ' + userDb.tableName + ' u ' + ' ON v.sv_user_id = u.sv_user_id '
      + 'LEFT JOIN ' + pnuTableName + ' p ' + ' ON v.mng_sgg = p.pnu_id '
      + 'LEFT JOIN ' + condTableName + ' c ' + ' ON v.cond_cd = c.vh_cond_id ',
    values: []
  }

  query = queryUtil.addFilterQuery(vhListInfo, query);
  query = queryUtil.addSortQuery(vhListInfo, query);
  query = queryUtil.addLimitQuery(vhListInfo, query);

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });

}

vehicleDB.getVhInfo = function (vhId, callback) {
  logger.debug('[func]vehicleDB.getVhInfo() - vhId : ' + vhId);

  const query = {
    text: `SELECT * \
          FROM ` + tableName
      + ` WHERE vh_id = $1`,
    values: [vhId]
  }

  postgresUtil.query(query, function (err, result) {
    if (!result) {
      return callback(err, null);
    }
    return callback(err, result.rows[0]);
  });
}


vehicleDB.getTotalCount = function() {
  return new Promise((resolve, reject) => {

    logger.debug('[func]vehicleDB.getTotalData()');

    const query = {
      text: `select count(*)::int
              from ` + tableName + ` 
              where cond_cd = 1`,

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

module.exports = vehicleDB;