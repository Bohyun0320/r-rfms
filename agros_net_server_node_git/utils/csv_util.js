var logger = require("../logger");
const csv = require("csv-parser");
const fs = require("fs");

var csvUtil = {};

csvUtil.parseCsvSync = function (fileName) {
  return new Promise((resolve, reject) => {
    parseCsv(fileName, function (err, result) {
      if (err) {
        logger.error(err);
        return reject(err);
      }

      return resolve(result);
    });
  });
};

function parseCsv(fileName, callback) {
  logger.debug("parseCsv - fileName : " + fileName);

  if (!fileName) {
    return callback("no fileName", null);
  }

  const results = [];

  fs.createReadStream(fileName)
    .on("error", (err) => {
      logger.error("parseCsv Err : " + err);
      return callback("parseCsv Err", null);
    })
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      // logger.log(results);
      logger.debug("parseCsv End");
      return callback(null, results);
    });
}



module.exports = csvUtil;
