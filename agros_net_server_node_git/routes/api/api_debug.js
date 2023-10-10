var authUtil = require("../../utils/auth_util");
var logger = require("../../logger");
//var wrapsodyUtil = require('../../utils/wrapsody_util');
var backupUtil = require("../../utils/backup_util");
const postgresUtil = require("../../utils/postgres_util");

var getDebugToken = function (req, res) {
  //  console.log(req.method + ' : ' + req.url);
  //  console.log('[dbg]getDebugToken()') ;

  logger.debug(req.method + " : " + req.url);
  logger.debug("[dbg]getDebugToken()");

  //  console.log(req.method + ' : ' + req.url);

  var token = authUtil.getDebugToken();

  if (!token) {
    return res.send({ success: false, msg: "debug token creation failed" });
  }

  return res.send({ success: true, token: token });
};

var getSaveScrt = function (req, res) {
  //  console.log(req.method + ' : ' + req.url);
  //  console.log('[dbg]getDebugToken()') ;

  logger.debug(req.method + " : " + req.url);
  logger.debug("[dbg]getDebugToken()");

  return res.send({ success: true, data: null });
};

var getDebugScrtDb = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("[dbg]getDebugScrtDb()");

  var scrtJson = scrtDbUtil.getScrtDbJson();

  return res.send({ success: true, data: scrtJson });
};

var test = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("[dbg]test()");

  // var strgMgr = require('../../manage/strg_mgr');
  var config = require("../../config/config");

  // logger.debug('scrtDb path : ' + strgMgr.getCurStrgPath(config.path.scrtDb.original));
  // logger.debug('impchFile path : ' + strgMgr.getCurStrgPath(config.path.impchFile.original));

  // logger.dir(req.body);

  return res.send({ success: true, msg: "test done" });
};

var encryptWrapsody = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("encryptWrapsody()");

  fasooUtil.encryptFile(
    "./libs/wrapsody/test_doc/DRM_TEST.txt",
    function (err, result) {
      if (err) {
        return res.send({ success: false, msg: err });
      }

      return res.send(result);
    }
  );
};

var decryptWrapsody = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("decryptWrapsody()");

  fasooUtil.decryptFile(
    "./libs/wrapsody/test_doc/DRM_TEST.txt",
    1000 * 10,
    function (err, result) {
      if (err) {
        return res.send({ success: false, msg: err });
      }

      return res.send(result);
    }
  );
};

var exception = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("exception()");
  throw new Error("Debug Exception");
};

var backup = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("backup()");

  backupUtil.backup(function (err, filname) {
    if (err) {
      logger.error(err);
      return res.send({ success: false, msg: "backup failed", filename: null });
    }

    return res.send({ success: true, filename: filname });
  });
};

var restore = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("restore()");

  backupUtil.restore("2019-03-03-13_50_18.backup", function (err, path) {
    if (err) {
      logger.error(logger.object(err));
      return res.send({
        success: false,
        msg: logger.object(err),
        filename: null,
      });
    }

    return res.send({ success: true, restorePath: path });
  });
};

var removeBackup = function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("removeBackup()");

  backupUtil.removeOldBackup(60, function (err, result) {
    return res.send({ success: true, result: result });
  });
};

const postUpdatePnu = async function (req, res) {
  logger.debug(req.method + " : " + req.url);
  logger.debug("postUpdatePnu()");

  try {
    // let oldPnuList = await getOldPnu();
    let newPnuList = await getNewPnu();

    // logger.debug("old PNU size : " + oldPnuList.length);
    logger.debug("new PNU size : " + newPnuList.length);

    // logger.dir(newPnuList[0]);

    // for (let i = 0; i < 10; i++) {
    //   logger.dir(newPnuList[i]);
    // }

    let updateCount = 0;
    let insertCount = 0;

    for (let i = 0; i < newPnuList.length; i++) {

      let result = await updatePnu(
        newPnuList[i].sido_nm,
        newPnuList[i].sigungu_nm,
        newPnuList[i].bjd_cd
      );

      if (result.length < 1) {
        await insertPnu(
          newPnuList[i].sido_nm,
          newPnuList[i].sigungu_nm,
          newPnuList[i].bjd_cd
        );

        insertCount++;
      }else {
        updateCount++;
      }

      logger.debug('updated : ' + updateCount + ', inserted : ' + insertCount);
    }

    return res.json({
      success: true,
      msg: "test done",
      data: newPnuList.length,
    });
  } catch (ex) {
    logger.error(ex);
    return res.json({ success: false, msg: "test failed", data: ex });
  }
};

async function getNewPnu() {
  var query = {
    text: `select *, count(*) over() total
            from
              (select distinct on (pnu) pnu, sido_nm, sigungu_nm , sido_nm, bjd_cd
              from temp_pnu
              order by pnu) pre
            where length(pre.sigungu_nm) !=0
            order by pre.bjd_cd`,
    values: [],
  };

  let result = await postgresUtil.querySync(query);

  // logger.dir(result);

  return result.rows;
}

async function getOldPnu() {
  var query = {
    text: `select distinct *
          from tc_pnu_sigungu`,
    values: [],
  };

  let result = await postgresUtil.querySync(query);

  // logger.dir(result);

  return result.rows;
}

async function updatePnu(sido, sigungu, bjdCd) {
  logger.debug('updatePnu - sido : ' + sido + ', sigungu : ' + sigungu + ', bjdCd : ' + bjdCd);
  var query = {
    text: `update tc_pnu_sigungu
          set (pnu_cd, sido_cd, sigungu_cd)
            = ($1, $2, $3)
          where sido_nm ilike $4
          and sigungu_nm ilike $5
          returning *`,
    values: [getPnuCd(bjdCd), getSidoCd(bjdCd), getSigunguCd(bjdCd), sido+"%", sigungu+"%"],
  };

  logger.debug('111111111111111111');

  let result = await postgresUtil.querySync(query);

  // logger.dir(result);

  return result.rows;
}

async function insertPnu(sido, sigungu, bjdCd) {
  logger.debug('insertPnu - sido : ' + sido + ', sigungu : ' + sigungu + ', bjdCd : ' + bjdCd);
  var query = {
    text: `INSERT INTO tc_pnu_sigungu
            (sido_cd, sido_nm, sigungu_cd, sigungu_nm, pnu_cd)
            VALUES ($1, $2, $3, $4, $5)`,
    values: [
      getSidoCd(bjdCd),
      sido,
      getSigunguCd(bjdCd),
      sigungu,
      getPnuCd(bjdCd),
    ],
  };

  let result = await postgresUtil.querySync(query);

  // logger.dir(result);

  return result.rows;
}

function getSidoCd(bjdCd) {
  // logger.debug('getSidoCd : ' + bjdCd);
  return bjdCd.substr(0, 2);
}

function getSigunguCd(bjdCd) {
  // logger.debug('getSigunguCd : ' + bjdCd);
  return bjdCd.substr(2, 3);
}

function getPnuCd(bjdCd) {
  // logger.debug('getPnuCd : ' + bjdCd);

  return bjdCd.substr(0, 5);
}

module.exports.getDebugToken = getDebugToken;
module.exports.getSaveScrt = getSaveScrt;
module.exports.getDebugScrtDb = getDebugScrtDb;
module.exports.test = test;

module.exports.encryptWrapsody = encryptWrapsody;
module.exports.decryptWrapsody = decryptWrapsody;

module.exports.exception = exception;

module.exports.backup = backup;
module.exports.restore = restore;
module.exports.removeBackup = removeBackup;
module.exports.postUpdatePnu = postUpdatePnu;
