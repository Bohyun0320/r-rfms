var logger = require('../logger');
var postgresUtil=require('../utils/postgres_util');

var trffcSignDB = {};

var trffcSignTableName = 'tc_trffc_sign';

trffcSignDB.tableName = trffcSignTableName;

trffcSignDB.getTrffcSignList = function(callback){
    logger.debug('[func]trffcSignDB.getTrffcSignList()');

    const query = {
        text: `SELECT * FROM `+trffcSignTableName
        + ` tts ORDER BY tts.sign_ty_id`,
        values: [],
    }

    postgresUtil.query(query, function(err, result){
        if(!result){
            return callback(err, null);
        }

        return callback(err, result.rows);
    });
}

module.exports = trffcSignDB;