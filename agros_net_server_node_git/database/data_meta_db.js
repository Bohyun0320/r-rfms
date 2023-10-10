var logger = require('../logger');
var postgresUtil = require('../utils/postgres_util');
var pgFormat = require('pg-format');
var queryUtil = require('../utils/query_util');
// var format = require('pg-format');
var prjDb = require('./prj_db');
// var userDb = require('./user_db');
var dataMetaDB = {};

var dataTableName = 'meta_mng';

dataMetaDB.tableName = dataTableName;

dataMetaDB.insertDataInfoListSync = function(dataList) {
  return new Promise((resolve, reject) => {

    dataMetaDB.insertDataInfoList(dataList, function(err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    })

  });
}

dataMetaDB.insertDataInfoList = function (dataList, callback) {
  logger.debug('[func]dataMetaDB.insertDataInfoList');

  if (!dataList || dataList.length == 0) {
    logger.error('invalid dataList!');
    return callback(null, null);
  }

  try {

    var query = pgFormat('INSERT INTO ' + dataTableName
      // + ' (prj_id, org_file_nm, data_file_path, file_len, data_ty_id, data_reg_ty_id) VALUES %L '
      + ' (prj_id, org_file_nm, data_file_path, file_len, data_reg_ty_id) VALUES %L '
      + ' ON CONFLICT (data_file_path) '
      + ' DO NOTHING '
      , dataList);

    postgresUtil.query(query, function (err, result) {
      return callback(err, result);
    });
  } catch (e) {
    logger.dir(e);
    return callback(e, null);
  }
}

dataMetaDB.getReadDataList = function (dataListInfo, callback) {
  logger.debug('[func]dataMetaDB.getReadDataList()');
  // logger.obj(vhListInfo);

  try {
    var query = {
      // text: `SELECT d.*, p.prj_nm, t.data_ty_nm, r.data_reg_ty_nm,  \
      text: `SELECT d.*, p.prj_nm, r.data_reg_ty_nm,  \
            count(*) OVER() total \
            FROM ` + dataTableName + ' d '
        + 'LEFT JOIN ' + prjDb.tableName + ' p ' + ' ON d.prj_id = p.prj_id '
        // + 'LEFT JOIN ' + 'tc_data_ty' + ' t ' + ' ON d.data_ty_id = t.data_ty_id '
        + 'LEFT JOIN ' + 'tc_data_reg_ty' + ' r ' + ' ON d.data_reg_ty_id = r.data_reg_ty_id ',
      values: []
    }
  } catch (ex) {
    logger.dir(ex);
  }

  query = queryUtil.addFilterQuery(dataListInfo, query);
  query = queryUtil.addSortQuery(dataListInfo, query);
  query = queryUtil.addLimitQuery(dataListInfo, query);

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });

}

dataMetaDB.getPrjDataPkg = function (prjId, option, callback) {
  logger.debug('[func]dataMetaDB.getPrjDataPkg() - prjId : ' + prjId);

  const query = {
    text: `SELECT *, count(*) OVER() total, sum(file_len) OVER() sum
          FROM ` + dataTableName + ` 
          WHERE prj_id = $1
          ORDER BY meta_id
          LIMIT $2 OFFSET $3`,
    // AND data_reg_ty_id = 1`,
    // text: `SELECT * \
    //       FROM ` + dataTableName + ` \
    //       WHERE prj_id = $1 \
    //       AND ` + dataTyCond + `\
    //       AND data_reg_ty_id = 1`,
    values: [prjId, option.perPage, option.perPage * (option.page -1)]
  }


  postgresUtil.query(query, function (err, result) {
    return callback(err, result.rows);
  });
}

dataMetaDB.getSingleData = function (dataId, callback) {
  logger.debug('[func]dataMetaDB.getSingleData() - dataId : ' + dataId);

  const query = {
    text: `SELECT * \
          FROM ` + dataTableName + ` \
          WHERE meta_id = $1`,
    values: [dataId]
  }

  postgresUtil.query(query, function (err, result) {
    if (err || !result.rows || result.rows.length == 0) {
      return callback(err, null);
    }

    return callback(err, result.rows[0]);
  });
}

dataMetaDB.getPrjDataSync = function (prjId) {
  return new Promise((resolve, reject) => {

    dataMetaDB.getPrjData(prjId, function (err, result) {

      // logger.debug('111111111111');
      // logger.dir(err);
      // logger.dir(result);

      if (err) {
        // logger.debug('222222222222');
        logger.error(err);
        return resolve(null);
      }

      if (!result || !result.rows || result.rows.length < 1) {
        logger.error('no data');
        return resolve(null);
      }

      // logger.debug('33333333333333');

      return resolve(result.rows[0]);
    });
  });
}


dataMetaDB.getPrjData = function (prjId, callback) {
  logger.debug('[func]dataMetaDB.getPrjData() - prjId : ' + prjId);

  const query = {
    text: `SELECT *, p.prj_nm \
          FROM ` + dataTableName + ` d \
          LEFT JOIN ` + prjDb.tableName + ` p  ON d.prj_id = p.prj_id \
          WHERE d.prj_id = $1 `,
    values: [prjId]
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result);
  });

}

dataMetaDB.updateStartDt = function (dataId, callback) {
  var curDt = new Date();
  logger.debug('[func]dataMetaDB.updateStartDt() - dataId : ' + dataId + ', curDt :' + curDt);

  const query = {
    text: `UPDATE ` + dataTableName + ` \
          SET prcs_strt_dt = $1 \
          WHERE meta_id = $2 \
          RETURNING *`,

    values: [curDt, dataId],
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result);
  });

}

dataMetaDB.updateEndDt = function (dataId, callback) {
  var curDt = new Date();
  logger.debug('[func]dataMetaDB.updateEndDt() - dataId : ' + dataId + ', curDt :' + curDt);

  const query = {
    text: `UPDATE ` + dataTableName + ` \
          SET prcs_end_dt = $1 \
          WHERE meta_id = $2 \
          RETURNING *`,

    values: [curDt, dataId],
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result);
  });

}

dataMetaDB.delPrjData = function (prjId) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataMetaDB.delPrjData - prjId : ' + prjId);

    const query = {
      text: `DELETE FROM ` + dataTableName + `
              WHERE prj_id = $1
              RETURNING *`,

      values: [prjId],
    }

    postgresUtil.query(query, function (err, result) {
      if (err || !result) {
        return resolve(null);
      }

      if (result.rows) {
        logger.debug('delete meta data succeed : ' + result.rows.length)
      }

      return resolve(result.rows);
    });

  });
}

dataMetaDB.moveData = function(srcPrjId, trgPrjId) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataMetaDB.moveData - srcPrjId : ' + srcPrjId + ', trgPrjId: ' + trgPrjId);

    if (!srcPrjId || !trgPrjId) {
      return reject('invalid params -  srcPrjId : ' + srcPrjId + ', trgPrjId: ' + trgPrjId);
    }

    let path=require('path');
    
    var srcPath = path.sep + srcPrjId + path.sep;
    var trgPath = path.sep + trgPrjId + path.sep;

    const query = {
      text: `UPDATE ` + dataTableName + ` 
            SET (prj_id, data_file_path) 
            = ($2, replace(data_file_path, $3, $4 ))
            WHERE prj_id = $1 
            RETURNING *`,
  
      values: [srcPrjId, trgPrjId, srcPath, trgPath],
    }
  
    postgresUtil.query(query, function (err, result) {
      if (err) {
        logger.error(err);
        return resolve(null);
      }


      logger.debug('updated meta data : ' + result.rows.length);

      return resolve(result);
    }); 


  });
}




module.exports = dataMetaDB;