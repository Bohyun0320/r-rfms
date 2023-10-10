var pg = require('pg');

var dbConfig = require('../config/db_config');
var config = dbConfig.getConfig();

var pool = new pg.Pool(config);
var logger = require('../logger');

var postgresUtil = {};


// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err)
  process.exit(-1)
});

//postgresUtil.test = function(callback) {
//  var query = {
//    text : 'SELECT * FROM tn_acnt_info WHERE $1 LIKE $2',
//    values: ['user_nm', '%' + '개발' + '%']
//  }
//  
//  // Single query
//  pool.query(query, (err, res) => {
//    if (err) {
//      console.log(err.stack);
//    } else {
//      console.dir(res.rows);
//    }
//
//    callback(err, res);
//  })
//}


postgresUtil.query = function(query, callback) {
  logger.debug('[func] postgresUtil.query() : ');
  logger.dir(query);
  
  pool.query(query, function (err, res) {
    if (err) {
      logger.error(err.stack);
    } 

    return callback(err, res);
  });
};

postgresUtil.getPool = function() {
  return pool;
}

postgresUtil.querySync = function(query) {
  return new Promise((resolve, reject) => {

    logger.debug('[func] postgresUtil.querySync() : ');
    logger.dir(query);

    pool.query(query, function (err, res) {
      if (err) {
        logger.error(err.stack);
        return reject(err);
      } 
  
      return resolve(res);
    });
  });
}

let tzQuery = {
  // text : `SET TIMEZONE = '+09:00'`, 
  // text : `SET TIMEZONE = '+09:00'; 
  //         select now()`,
  // text : `select now()`,
  text : `select current_setting('timezone'), now()`,
  values: [],
}

postgresUtil.query(tzQuery, function(err, result) {
  logger.dir(result.rows);

});

module.exports = postgresUtil;



