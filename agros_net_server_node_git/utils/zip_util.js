var logger = require('../logger');
var fs = require('fs');
var AdmZip = require('adm-zip');
var iconv = require('iconv-lite');


var zipUtil = {};

zipUtil.unzip = function (srcFile, targetPath, callback) {
  logger.debug('zipUtil.unzip() - srcFile : ' + srcFile + ', targetPath : ' + targetPath);

  var fileList = [];

  try {
    // unzipMbcs.extractSync(srcFile, 'cp949');
    // logger.debug('extract done');

    // fs.createReadStream(srcFile)
    // .pipe(unzipper.Extract({ path: targetPath }));


    var zip = new AdmZip(srcFile);
    zip.getEntries().forEach(entry => {
      entry.entryName = iconv.decode(entry.rawEntryName, 'EUC-KR')
      // logger.debug('entry : ' + entry.toString());

      if (!entry.isDirectory) {
        // logger.debug(entry.toString() );
        var extFile = {
          name : entry.entryName,
          size : entry.header.size
        }
  
        fileList.push(extFile);
      }
      
      // logger.dir(extFile);
    })

    zip.extractAllTo(targetPath);

    logger.debug('unzip excuted');

  } catch (e) {
    logger.error('zipUtil.unzip() err accured!');
    logger.dir(e);

    callback(e, null);
  }

  logger.dir(fileList);
  callback(null, fileList);
}

zipUtil.unzipFiles = function (fileList, targetPath, callback) {
  logger.debug('zipUtil.unzipFiles() - targetPath : ' + targetPath);
  logger.dir(fileList);

  if (!fileList || fileList.length == 0) {
    logger.debug('fileList is empty!');
    return callback(null, { fileList: fileList });
  }

  var notZipFiles = [];
  var zipFiles = [];
  var unzipResultCount = 0;
  var extractFiles = [];

  fileList.forEach(function (file) {
    if (file.mimetype == 'application/x-zip-compressed') {
      zipFiles.push(file);
    } else {
      notZipFiles.push(file);
    }
  })

  logger.debug('zip file count : ' + zipFiles.length);

  if (zipFiles.length == 0) {
    return callback(null, { fileList: fileList, notZipFiles: notZipFiles, zipFiles: null });
  }

  

  try {
    zipFiles.forEach(function (zipFile) {
      zipUtil.unzip(zipFile.path, zipFile.destination, function (err, result) {
        if (err) {
          logger.error('err accured!');
          logger.dir(err);

          return callback('올바른 압축 파일이 아닙니다 : ' + zipFile.filename, null);
        }
        unzipResultCount++;

        extractFiles = extractFiles.concat(result);

        if (unzipResultCount == zipFiles.length) {
          var intResult = {
            fileList: fileList,
            zipFiles: zipFiles,
            notZipFiles: notZipFiles,
            extractFiles: extractFiles
          }

          callback(null, intResult);
        }
      })
    });

  } catch (e) {
    logger.dir(e);
  }


}


module.exports = zipUtil;