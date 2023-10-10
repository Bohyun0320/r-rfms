const logger = require("../logger");
const { spawn } = require("child_process");
const iconv = require('iconv-lite');

let childProcUtil = {};

childProcUtil.runModule = function (cwd, cmd, args) {
  return new Promise(async (resolve, reject) => {

    childProcUtil.runModuleAsync(cwd, cmd, args, function(err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    })
  });
}

childProcUtil.runModuleAsync = function (cwd, cmd, args, callback) {
  logger.debug("childProcUtil.runModule() - cwd : " + cwd + ", cmd : " + cmd);
  logger.dir(args);

  let options = {
    cwd: cwd,
  };

  const process = spawn(cmd, args, options);

  let ret = {
    stdOut: '',
    stdErr: '',
  };

  process.stdout.on("data", function (data) {
    let utfStr = iconv.decode(data, 'euc-kr');

    // logger.debug('on stdout : ' + utfStr);
    ret.stdOut += utfStr;
  });

  process.stderr.on("data", function (data) {
    // logger.debug('on stderr : ' + data.toString());

    // // ret.stderr = data.toString();
    // ret.stderr = iconv.decode(data.toString(), 'euc-kr');
    let utfStr = iconv.decode(data, 'euc-kr');

    // logger.debug('on stderr : ' + utfStr);
    ret.stdErr += utfStr;
  });

  process.on("error", function (err) {


    // logger.debug('on error : ' + err.toString());

    // ret.err = iconv.decode(err.toString(), 'euc-kr');
    // logger.dir(err);

    let utfStr = iconv.decode(err, 'euc-kr');

    logger.debug('on error : ' + utfStr);
    ret.error += utfStr;
  });

  process.on("close", function (code) {
    logger.debug('onClose - code : ' + code);

    ret.code = code;

    logger.dir(ret);

    if (ret.code != 0) {
    // if (ret.code != 0 || (ret.stdErr && ret.stdErr.length > 0)) {
      // if (ret.code != 0 || (ret.stdErr)) {
      logger.error('childProcUtil.runModule err accoued! => \n' + ret.stdErr);
      // return reject(ret.stdErr);
      return callback(ret.stdErr, null);
    }

    // return resolve(ret);
    return callback(null, ret);
  });
}


module.exports = childProcUtil;