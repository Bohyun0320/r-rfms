var logger = require('../logger');
var postgresUtil = require('../utils/postgres_util');
const queryUtil = require('../utils/query_util');

var sigDB = {};

var sigTableName = 'korea_map_sig';

sigDB.tableName = sigTableName;

sigDB.getSigList = function(callback){
    logger.debug('[func]sigDB.getSigList()');

    const query = {
        text: `SELECT id, sig_cd, sig_eng_nm, sig_kor_nm FROM `+ sigTableName +
              ` sig ORDER BY sig.id`,
        values: [],
    }

    postgresUtil.query(query, function(err, result){
        if(!result){
            return callback(err, null);
        }

        return callback(err, result.rows);
    });
}

sigDB.SigListBySido = function(sidoCd){
    return new Promise((resolve, reject)=>{
        logger.debug('[func]sigDB.SigListBySido - sidoCd : '+sidoCd);

        const query = {
            text: `SELECT id, sig_cd, sig_eng_nm, sig_kor_nm FROM `+ sigTableName+
            ` sig WHERE sig.sig_cd LIKE $1 ORDER BY sig.id`,
            values: [sidoCd + '%'],
        }

        postgresUtil.query(query, function(err, result){
            if(err || !result.rows){
                return reject(null);
            }

            if(result.rows){
                logger.debug('select sigListBySido succeed : '+sidoCd);
            }

            return resolve(result.rows);
        });
    });
}


module.exports = sigDB;