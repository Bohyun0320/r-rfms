var logger = require('../logger');
var pgUtil = require('./postgres_util');
var codeUtil = require('./code_util');

var updateUtil = {};

updateUtil.checkUpdate = function() {
  logger.debug('updateUtil.checkUpdate');
  
  // checkTrgSptInfoType();
}

// function checkTrgSptInfoType() {
//   logger.debug('checkTrgSptInfoType()');
  
//   const query = {
//     text: `SELECT *  FROM tc_trg_spt_info WHERE trg_spt_info_id = 7 OR trg_spt_info_id = 100`, 
//   }
  
//   pgUtil.query(query, function(err, result) {
//     var updatedType = result.rows;
    
//     if (!updatedType || updatedType.length == 0) {
//       logger.warn('Need update! : TrgSptInfoType');
      
//       var updateQuery = {
//         text: `INSERT INTO tc_trg_spt_info (trg_spt_info_id, trg_spt_info_nm)\
//               VALUES (7, '항공사진분류'), (100, '기타')`
//       }
      
//       pgUtil.query(updateQuery, function(err, result) {
//         if (err) {
//           return logger.error('TrgSptInfoType insert failed!');
//         }
        
//         logger.warn('TrgSptInfoType insert success!');
        
//         codeUtil.init();
//       });
//     }
//   });
// }

module.exports = updateUtil;