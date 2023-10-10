var logger = require('../logger');
var postgresUtil = require('../utils/postgres_util');
var pgFormat = require('pg-format');
var queryUtil = require('../utils/query_util');
// var format = require('pg-format');
var prjDb = require('./prj_db');
// var userDb = require('./user_db');

var dataCamDB = {};

var tableName = 'photo_mng';

dataCamDB.tableName = tableName;

dataCamDB.insertDataInfoList = function (dataList, callback) {
  logger.debug('[func]dataCamDB.insertDataInfoList');

  if (!dataList || dataList.length == 0) {
    logger.error('invalid dataList!');
    return callback(null, null);
  }

  try {

    var query = pgFormat('INSERT INTO ' + tableName
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

dataCamDB.insertWithMeta = function (data, callback) {
  logger.debug('[func]dataCamDB.insertWithMeta');

  if (!data) {
    logger.error('invalid data!');
    return callback(null, null);
  }

  const query = {
    text: `INSERT INTO ` + tableName + `
          (prj_id, data_file_path, file_len, data_reg_ty_id, org_file_nm, data_reg_dt, 
            latitude, longtitude, utm_x, utm_y, altitude, pitch, roll, yaw, time_dt)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING * `,
    values: [data.prjId, data.path, data.fileLen, data.regTy, data.fileNm, data.dateReg,
          data.lat, data.lon, data.x, data.y, data.z, data.pitch, data.roll, data.yaw, data.time]
  }

  postgresUtil.query(query, function (err, result) {
  
    return callback(err, result);
  });

}

dataCamDB.getReadDataList = function (dataListInfo, callback) {
  logger.debug('[func]dataCamDB.getReadDataList()');

  try {
    var query = {
      // text: `SELECT d.*, p.prj_nm, t.data_ty_nm, r.data_reg_ty_nm,  \
      text: `SELECT d.*, p.prj_nm, r.data_reg_ty_nm,  \
            count(*) OVER() total \
            FROM ` + tableName + ' d '
        + 'LEFT JOIN ' + prjDb.tableName + ' p ' + ' ON d.prj_id = p.prj_id '
        // + 'LEFT JOIN ' + 'tc_data_ty' + ' t ' + ' ON d.data_ty_id = t.data_ty_id '
        + 'LEFT JOIN ' + 'tc_data_reg_ty' + ' r ' + ' ON d.data_reg_ty_id = r.data_reg_ty_id ',
      values: []
    }
  } catch (ex) {
    logger.dir(ex);
  }

  query = queryUtil.addFilterQuery(dataListInfo, query);
  query = queryUtil.addSortQuery(dataListInfo, query, 'photo_id');
  query = queryUtil.addLimitQuery(dataListInfo, query);

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });

}

dataCamDB.getPrjDataPkg = function (prjId, option, callback) {
  logger.debug('[func]dataCamDB.getPrjDataPkg() - prjId : ' + prjId);

  const query = {
    text: `SELECT *, count(*) OVER() total, sum(file_len) OVER() sum
          FROM ` + tableName + `
          WHERE prj_id = $1
          ORDER BY photo_id
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

dataCamDB.getSingleData = function (dataId, callback) {
  logger.debug('[func]dataCamDB.getSingleData() - dataId : ' + dataId);

  const query = {
    text: `SELECT * \
          FROM ` + tableName + ` \
          WHERE photo_id = $1`,
    values: [dataId]
  }

  postgresUtil.query(query, function (err, result) {
    if (err || !result.rows || result.rows.length == 0) {
      return callback(err, null);
    }

    return callback(err, result.rows[0]);
  });
}

dataCamDB.getPrjData = function (prjId, callback) {
  logger.debug('[func]dataCamDB.getPrjData() - prjId : ' + prjId);

  const query = {
    text: `SELECT *, p.prj_nm \
          FROM ` + tableName + ` d \
          LEFT JOIN ` + prjDb.tableName + ` p  ON d.prj_id = p.prj_id \
          WHERE d.prj_id = $1 `,
    values: [prjId]
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result.rows);
  });

}

dataCamDB.updateStartDt = function (photoId, callback) {
  var curDt = new Date();
  logger.debug('[func]dataCamDB.updateStartDt() - photoId : ' + photoId + ', curDt :' + curDt);

  const query = {
    text: `UPDATE ` + tableName + ` \
          SET prcs_strt_dt = $1 \
          WHERE photo_id = $2 \
          RETURNING *`,

    values: [curDt, photoId],
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result);
  });

}

dataCamDB.updateEndDt = function (photoId, callback) {
  var curDt = new Date();
  logger.debug('[func]dataCamDB.updateEndDt() - dataId : ' + photoId + ', curDt :' + curDt);

  const query = {
    text: `UPDATE ` + tableName + ` \
          SET prcs_end_dt = $1 \
          WHERE photo_id = $2 \
          RETURNING *`,

    values: [curDt, photoId],
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result);
  });

}

dataCamDB.delPrjData = function (prjId) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataCamDB.delPrjData - prjId : ' + prjId);

    const query = {
      text: `DELETE FROM ` + tableName + `
              WHERE prj_id = $1
              RETURNING *`,

      values: [prjId],
    }

    postgresUtil.query(query, function (err, result) {
      if (err || !result) {
        return resolve(null);
      }

      if (result.rows) {
        logger.debug('delete cam data succeed : ' + result.rows.length);
      }

      return resolve(result.rows);
    });

  });
}

// dataCamDB.updateMetaData = function(data) {
//   return new Promise((resolve, reject) => {

//     const query = pgFormat(`\
//     update photo_mng 
//     set (latitude, longtitude, altitude, utm_x, utm_y, roll, pitch, yaw) 
//     = (d.lat, d.lon, d.z, d.x, d.y, d.roll, d.pitch, d.yaw)
//     from (values %L) as d(file, time, lat, lon, x, y, z, roll, pitch, yaw)
//     where prj_id = ` + prjId + `
//     and org_file_nm = ` + `
//     returning photo_mng.* `, dataList);

//     const query = {
//       text: `UPDATE ` + tableName + ` 
//             SET (prj_id, data_file_path) 
//             = ($2, replace(data_file_path, $3, $4 ))
//             WHERE prj_id = $1 
//             RETURNING *`,
  
//       values: [srcPrjId, trgPrjId, srcPath, trgPath],
//     }

//     postgresUtil.query(query, function (err, result) {
//       if (err) {
//         logger.error(err);
//         return reject(err);
//       }
//       return resolve(result.rows);
//     });
//   });

// }

dataCamDB.moveData = function(srcPrjId, trgPrjId) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataCamDB.moveData - srcPrjId : ' + srcPrjId + ', trgPrjId: ' + trgPrjId);

    if (!srcPrjId || !trgPrjId) {
      return reject('invalid params -  srcPrjId : ' + srcPrjId + ', trgPrjId: ' + trgPrjId);
    }

    let path=require('path');

    var srcPath = path.sep + srcPrjId + path.sep;
    var trgPath = path.sep + trgPrjId + path.sep;

    const query = {
      text: `UPDATE ` + tableName + ` 
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


      logger.debug('updated img data : ' + result.rows.length);

      return resolve(result);
    }); 


  });
}

dataCamDB.delPrjData = function (prjId) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataCamDB.delPrjData - prjId : ' + prjId);

    const query = {
      text: `DELETE FROM ` + tableName + `
              WHERE prj_id = $1
              RETURNING *`,

      values: [prjId],
    }

    postgresUtil.query(query, function (err, result) {
      if (err || !result) {
        return resolve(null);
      }

      if (result.rows) {
        logger.debug('delete cam data succeed : ' + result.rows.length);
      }

      return resolve(result.rows);
    });

  });
}

dataCamDB.syncMetaData = function (prjId, parsedData) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataCamDB.syncMetaData - prjId : ' + prjId);

    if (!prjId || !parsedData) {
      return reject('invalid params : ' + prjId);
    }

    var dataList = [];

    for (var i = 0; i < parsedData.length; i++) {
      var data = [
        parsedData[i].file,
        parsedData[i].time,
        parsedData[i].lat,
        parsedData[i].lon,
        parsedData[i].x,
        parsedData[i].y,
        parsedData[i].z,
        parsedData[i].roll,
        parsedData[i].pitch,
        parsedData[i].yaw,
      ]

      dataList.push(data);
    }

    const query = pgFormat(`
      update photo_mng 
      set (latitude, longtitude, altitude, utm_x, utm_y, roll, pitch, yaw) 
      = (d.lat, d.lon, d.z, d.x, d.y, d.roll, d.pitch, d.yaw)
      from (values %L) as d(file, time, lat, lon, x, y, z, roll, pitch, yaw)
      where prj_id = ` + prjId + `
      and org_file_nm = d.file
      returning photo_mng.* `, dataList);

    postgresUtil.query(query, function (err, result) {
      if (err) {
        logger.error(err);
        return reject(err);
      }
      return resolve(result.rows);
    });
  });

}

dataCamDB.getInfoByFileNum = function(dataInfo) {
  return new Promise((resolve, reject) => {

    const query = {
      text: `SELECT * FROM ` + tableName + `
              WHERE prj_id = $1
              AND org_file_nm ILIKE $2`,

      values: [dataInfo.prjId, '%' + dataInfo.fileNum + '%'],
    }

    postgresUtil.query(query, function (err, result) {
      if (err) {
        return reject(err);
      }

      if (!result || !result.rows || result.rows.length < 1) {
        return reject('no data');
      }

      return resolve(result.rows[0]);
    });

  });
}

dataCamDB.getTotalData = function(params) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataCamDB.getTotalData()');

    const query = {
      text: `select count(*)::int
              from ` + tableName,

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

dataCamDB.getStatPeriod = function(params) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]dataCamDB.getStatPeriod()');

    let formatStr = 'YYYY년 MM월 DD일';
    let stepStr = '1 day';

    if (params.setp == 'month') {
      formatStr = 'YYYY년 MM월';
      stepStr = '1 month';
    }else if (params.setp == 'year') {
      formatStr = 'YYYY년';
      stepStr = '1 year';
    }

    const query = {
      text: `select t.tDate, p.count::int
              from ( 
                select ( 
                    to_char(generate_series($1::date, $2::date, $3::interval)::date, $4)
                  )::text as tDate 
                ) t 
              left outer join ( 
                  select to_char(data_reg_dt, $4) as data_reg_dt, count(*) as count
                  from photo_mng dt 
                  where data_reg_dt >=$1 and data_reg_dt <=$5
                  group by to_char(data_reg_dt, $4)	
                ) p 
                on t.tDate = p.data_reg_dt 
              order by t.tDate `,

      values: [params.startDt, params.endDt, stepStr, formatStr, params.endDt + ' 24:00'],
    }

    postgresUtil.query(query, function (err, result) {
      if (err) {
        return reject(err);
      }

      return resolve(result.rows);
    });
  });
}



module.exports = dataCamDB;