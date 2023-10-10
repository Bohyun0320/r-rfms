var logger = require('../logger');
var postgresUtil = require('../utils/postgres_util');

var trffcSignTyDB = {};

var trffcSignTyTableName = 'tc_trffc_sign_ty';

trffcSignTyDB.tableName = trffcSignTyTableName;

trffcSignTyDB.getTrffcSignTyList = function(callback){
    logger.debug('[func]trffcSignTyDB.getTrffcSignTyList()');

    const query = {
        text: `SELECT * FROM `+trffcSignTyTableName
        + ` ttst WHERE ttst.trffc_sign_ty_id not in ($1, $2, $3) ORDER BY ttst.trffc_sign_ty_id`,
        values: ['4', '5', '6'],
    }

    postgresUtil.query(query, function(err, result){
        if(!result){
            return callback(err, null);
        }

        return callback(err, result.rows);
    });
}

module.exports = trffcSignTyDB;