var logger = require('../logger');
var postgresUtil = require('../utils/postgres_util');

var sidoDB = {};

var sidoTableName = 'korea_map_sido';

sidoDB.tableName = sidoTableName;

sidoDB.getSidoList = function(callback){
    logger.debug('[func]sidoDB.getSidoList()');

    const query={
        text: `SELECT id, ctprvn_cd, ctp_eng_nm, ctp_kor_nm FROM `
                +sidoTableName +
                ` sido ORDER BY sido.id`,
        values : [],
    }

    postgresUtil.query(query, function(err, result){
        if(!result){
            return callback(err, null);
        }

        return callback(err, result.rows);
    });
}

module.exports = sidoDB;
