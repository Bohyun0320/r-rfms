var userUtil = require('../utils/user_util.js');
var dbConfig = require('../config/db_config');
var db_config = dbConfig.getConfig();
var postgresUtil = require('../utils/postgres_util');
var encptUtil = require('../utils/encrypt_util');
var codeUtil = require('../utils/code_util');
var logger = require('../logger');
var queryUtil = require('../utils/query_util');
const config = require('../config/config');

var userDB = {};

var tableName = 'sv_user_mng';
userDB.tableName = tableName;

const userTyTableName = 'tc_user_ty';
const userCondTableName = 'tc_user_cond';


var defaultUserInfo = 'u.sv_user_id, u.flnm, u.divis, u.brdt, u.telno, u.join_ymd, u.user_cond_cd, u.user_img_file_path, u.ogdp'

userDB.getTableName = function () {
  return tableName;
}

//userDB.testPostgres = function() {
//  console.log('[func] userDB.testPostgres ');
//  
//  postgresUtil.test(function (err, res) {
//    
//    console.log()
//  }); 
//}

userDB.findOne = function (email, callback) {
  logger.debug('[func]  : userDB.findOne : ' + email);

  const query = {
    text: 'SELECT * FROM ' + tableName + ' WHERE sv_user_id = $1',
    values: [email],
  }

  postgresUtil.query(query, function (err, result) {
    if (err || !result || result.lenth == 0) {
      return callback(null, null);
    }

    //    console.log('아이디 [%s] 일치하는 사용자 찾음', id);
    //    console.dir(result);
    return callback(null, result.rows[0]);
  })

};

//사용자를 등록하는 함수
userDB.addUser = function (user, password, callback) {
  logger.debug('[func] : userDB.addUser ');

  encptUtil.makeSalt(function (err, salt) {
    encptUtil.encryptPassword(password, salt, function (err, encrypted) {

      user.salt = salt;
      user.password = encrypted;

      insertUserDb(user, function (err, result) {
        return callback(err, result);
      });
    });
  });
};

function insertUserDb(user, callback) {
  logger.debug('[func] insertUserDb');
  logger.dir(user);

  const query = {
    text: 'INSERT INTO ' + tableName + `\
          (sv_user_id, flnm, telno, join_ymd, pw_no, pw_no_salt, user_cond_cd, user_img_file_path, divis, ogdp) \
          values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) \
          RETURNING *`,
    values: [user.email, user.name, user.phone, user.join_ymd, user.password, user.salt, user.status, user.photo, user.type, user.group],
  }

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }

    result.rows[0].sttus_ty_name = codeUtil.getUserStatusName(result.rows[0].sttus_ty_id);

    return callback(null, result.rows[0]);
  });
}

userDB.updatePwSync = function(userId, pw) {
  return new Promise((resolve, reject) => {

    const user = {
      email : userId,
      password : pw
    }

    userDB.updatePw(user, function(err, result) {
      if (err) {
        return resolve(null);
      }

      return resolve(result);
    })

  });
}


userDB.updatePw = function(user, callback) {
  logger.debug('[func] userDB.updatePw');

  if (!user || !user.password) {
    return callback('not valid password.', null);
  }

  encptUtil.makeSalt(function(err, salt) {
    encptUtil.encryptPassword(user.password, salt, function(err, encrypted) {
      const query = {
        text: `UPDATE ` + tableName + `\
              SET (pw_no, pw_no_salt) \
              = ($1, $2) \
              WHERE sv_user_id = $3\
              RETURNING *`,
        values: [encrypted, salt, user.email],
      }
    
      postgresUtil.query(query, function (err, result) {
        return callback(err, result.rows[0].login_failr_co);
      });
    })

  })
}

userDB.updateUser = function (user, callback) {
  logger.debug('[func] userDB.updateUser');
  logger.dir(user);

  var fCount = 4;
  var queryText = 'UPDATE ' + tableName + ' SET(flnm, telno, ogdp';
  var queryText2 = ' = ($2, $3, $4';
  var queryText3 = ` WHERE sv_user_id = $1  RETURNING *`;
  var qeuryValues = [user.email, user.name, user.phone, user.group];

  if (user.photo) {
    queryText += ', user_img_file_path';
    queryText2 += ', $' + ++fCount;
    qeuryValues.push(user.photo);
  }

  if (user.type) {
    queryText += ', divis';
    queryText2 += ', $' + ++fCount;
    qeuryValues.push(user.type);
  }
  
  if (user.status) {
    queryText += ', user_cond_cd';
    queryText2 += ', $' + ++fCount;
    qeuryValues.push(user.status);
  }

  queryText += ')';
  queryText2 += ')';

  var query = {
    text: queryText + queryText2 + queryText3,
    values: qeuryValues,
  }

  postgresUtil.query(query, function (err, result) {
    if (err || !result) {
      return callback(err, null);
    }

    return callback(null, result.rows[0]);
  });
}

userDB.authUserSync = function(id, password) {
  return new Promise((resolve, reject) => {

    userDB.authUser(id, password, function(err, result) {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    })
  });
}


userDB.authUser = function (id, password, callback) {
  logger.debug('[func]userDB.authUser - id : ' + id + ', pw : ' + password);

  userDB.findOne(id, function (err, user) {
    if (err) {
      return callback(err, null);
    }

    if (user == null) {
      logger.warn("일치하는 사용자 찾지 못함.");
      return callback('id not found', null);
    }

    encptUtil.encryptPassword(password, user.pw_no_salt, function (err, encrypted) {
      if (encrypted == user.pw_no) {
        user.sttus_ty_name = codeUtil.getUserStatusName(user.user_cond_cd);
        return callback(null, user);
      } else {
        logger.warn("일치하는 사용자 찾지 못함.");
        return callback(null, null);
      }
    });

  });
};

userDB.getReadUserList = function (userListInfo, callback) {
  logger.debug('[func]userDB.getReadUserList()');
  // logger.obj(userListInfo);

  var query = {
    text: `SELECT u.*, t.user_ty_nm, c.user_cond_nm, \
          count(*) OVER() total \
          FROM ` + tableName + ' u '
      + 'LEFT JOIN ' + userTyTableName + ' t ' + ' ON u.divis = t.user_ty_id '
      + 'LEFT JOIN ' + userCondTableName + ' c ' + ' ON u.user_cond_cd = c.user_cond_id ',
    values: []
  }

  query = queryUtil.addFilterQuery(userListInfo, query, false);
  query = queryUtil.addSortQuery(userListInfo, query);
  query = queryUtil.addLimitQuery(userListInfo, query);

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });

}

userDB.incLoginCountSync = function(id) {
  return new Promise((resolve, reject) => {

    userDB.increaseLoginCount(id, function(err, result) {
      resolve(result);
    })

  });
}

userDB.increaseLoginCount = function(id, callback) {
  logger.debug('[func]userDB.increaseLoginCount - id : ' + id);

  const query = {
    text: `UPDATE ` + tableName + `\
          SET login_failr_co = login_failr_co + 1\
          WHERE sv_user_id = $1\
          RETURNING login_failr_co`,
    values: [id],
  }

  postgresUtil.query(query, function(err, result){
      return callback(err, result.rows ? result.rows[0].login_failr_co :0 );
  });
}

userDB.resetLoginCountSync = function(id) {
  return new Promise((resolve, reject) => {

    userDB.resetLoginCount(id, function(err, result) {
      resolve(result);
    })

  });
}

userDB.resetLoginCount = function (id, callback) {
  logger.debug('[func]userDB.resetLoginCount - id : ' + id);

  const query = {
    text: `UPDATE ` + tableName + `\
          SET login_failr_co = 0\
          WHERE sv_user_id = $1\
          RETURNING login_failr_co`,
    values: [id],
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result.rows[0].login_failr_co);
  });
}



userDB.desableUser = function (id, callback) {
  logger.debug('[func]userDB.desableUser - id : ' + id);

  const query = {
    text: `UPDATE ` + tableName + `\
          SET sttus_ty_id = 3\
          WHERE user_id = $1\
          RETURNING *`,
    values: [id],
  }

postgresUtil.query(query, function (err, result) {
    return callback(err, result.rows[0]);
  });
}

userDB.getSimpleList  = function(callback) {
  logger.debug('[func]userDB.getSimplist()');

  const query = {
    text: `SELECT * \
          FROM ` + tableName + `
          ORDER BY flnm`,
    values: [],
  }

  postgresUtil.query(query, function (err, result) {
    return callback(err, result.rows);
  });
}


userDB.getUserList = function (filter, key, strict, callback) {
  logger.debug('[func]userDB.getUserList - filter : ' + filter + ', key : ' + key + ', strict : ' + strict);

  const query = {
    text: `SELECT ` + defaultUserInfo + `\
          FROM ` + tableName + ' u ' + `\
          INNER JOIN tc_user_cond c ON u.user_cond_cd = c.user_cond_id \
          WHERE NOT u.user_cond_cd = 4`,
    //    values: [],
  }

  var field = null;

  switch (filter) {
    case 'name':
      field = 'flnm';
      break;

    case 'email':
      field = 'sv_user_id';
      break;

    case 'type':
      field = 'divis';
      break;

    case 'phone':
      field = 'telno';
      break;

    case 'status':
      field = 'user_cond_cd';
      break;
  }

  if (field) {
    query.text += ' AND ' + field + ' LIKE $1'

    if (strict) {
      query.values = [key];
    } else {
      query.values = ['%' + key + '%'];
    }
  }

  query.text += ' ORDER BY u.flnm';

  postgresUtil.query(query, function (err, result) {
    if (!result) {
      return callback(err, null);
    }

    return callback(err, result.rows);
  });

}


userDB.approveUser = function (id, callback) {
  logger.debug('[func]userDB.approveUser - id : ' + id);

  const query = {
    text: `UPDATE ` + tableName
      + ` SET (sttus_ty_id, login_failr_co) = (2, 0)\
            WHERE user_id = $1`,
    values: [id],
  }

  postgresUtil.query(query, function (err, result) {
    if (!result) {
      return callback(err, null);
    }

    userDB.getUserList('id', id, true, function (err, result) {
      //      console.dir(result);

      if (err || !result) {
        return callback(err, null);
      }

      return callback(err, result[0]);

    });
  });
}

// userDB.updatePassword = function (userId, password, callback) {
//   logger.debug('[func]userDB.updatePassword - userId : ' + userId);

//   encptUtil.makeSalt(function (err, salt) {
//     encptUtil.encryptPassword(password, salt, function (err, encrypted) {

//       const query = {
//         text: `UPDATE ` + tableName
//           + ` SET (password_cn, salt_cn) = ($1, $2)\
//                 WHERE user_id = $3`,
//         values: [encrypted, salt, userId],
//       }

//       postgresUtil.query(query, function (err, result) {
//         return callback(err, result);
//       });

//     });
//   });
// }

userDB.deleteUser = function (userId, callback) {
  logger.debug('[func]userDB.deleteUser - userId : ' + userId);

  const query = {
    text: `\
      update ` + tableName + `\
      set sttus_ty_id = 4 \
      where user_id = $1 \
      returning * `,
    values: [userId],
  }

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows[0]);
  });
}

userDB.updateUserCond = function(userId, cond) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]userDB.updateUserCond - userId : ' + userId + ', cond : ' + cond);

    const query = {
      text: `\
        update ` + tableName + `\
        set user_cond_cd = $1 \
        where sv_user_id = $2 \
        returning * `,
      values: [cond, userId],
    }
  
    postgresUtil.query(query, function (err, result) {
      return resolve(userId);
    });

  });
}

userDB.resetUser = function(userId) {
  return new Promise(async (resolve, reject) => {

    logger.debug('[func]userDB.resetUser - userId : ' + userId );

    let result = await userDB.updatePwSync(userId, config.DEFAULT_USER_PW);

    const query = {
      text: `\
        update ` + tableName + `\
        set (user_cond_cd, login_failr_co) = (1, 0) \
        where sv_user_id = $1 \
        returning * `,
      values: [userId],
    }
  
    postgresUtil.query(query, function (err, result) {
      if (err) {
        logger.dir(err);
        return resolve(null);
      }

      return resolve(result);
    });
  });
}

module.exports = userDB;
