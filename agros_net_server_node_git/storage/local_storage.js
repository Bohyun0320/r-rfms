var multer = require('multer');
var path = require('path');
var config = require('../config/config');
var fs = require('fs-extra');
var logger = require('../logger');

var localStorage = {};

localStorage.multer = function(fieldName, targetPath, originalName) {
  logger.debug('localStorage.multer() - fieldName : ' + fieldName +' , targetPath : ' + ', originalName : ' + originalName);

  // var storage= multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     var dest = targetPath;
  //     // var dest = getSelStrgPath(targetPath);

  //     if (!dest) {
  //       return cb('selected strg not connected!', null);
  //     }
      
  //     if (originalName !==undefined && originalName) {
  //       dest += Date.now().toString();
  //     }
      
  //     fs.ensureDirSync(dest);

  //     logger.debug('multer path : ' + dest);
  //     cb(null, dest);
  //   },
  //   filename: function (req, file, cb) {
  //     if (originalName !==undefined && originalName) {
  //       logger.debug('multer fileName : ' + file.originalname);

  //       cb(null, file.originalname);
  //     }else {
  //       let extension = path.extname(file.originalname);
  //       var fileName = Date.now().toString() + extension;
        
  //       logger.debug('multer fileName : ' + fileName);
  //       cb(null, fileName);
  //     }
  //   }
  // });

  var storage = getDiskDtorage(targetPath, originalName);

  var upload = multer({
    storage: storage,
  }).single(fieldName); 
  
  return upload;
}

localStorage.multerFileds = function(fields, targetPath, originalName, paramDir) {
  logger.debug('localStorage.multerFileds() - fieldName : ' + fields +' , targetPath : ' + ', originalName : ' + originalName);

  var storage = getDiskDtorage(targetPath, originalName, paramDir);

  var upload = multer({
    storage: storage,
  }).fields(fields); 
  
  return upload;
}



function getDiskDtorage(targetPath, originalName, paramDir) {
  var storage= multer.diskStorage({
    destination: function (req, file, cb) {
      logger.debug('multer req :  ' + req.url);

      // add subdir from params 
      var subDir = '';

      if(paramDir) {
        subDir = req.params[paramDir] + '/';
      }

      var dest = targetPath + '/' + subDir + file.fieldname ;

      if (!dest) {
        return cb('selected strg not connected!', null);
      }
      
      if (!paramDir && originalName !==undefined && originalName) {
        dest += Date.now().toString();
      }
      
      fs.ensureDirSync(dest);

      logger.debug('multer path : ' + dest);
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      if (originalName !==undefined && originalName) {
        logger.debug('multer fileName (' + file.fieldname + '): ' + file.originalname);

        cb(null, file.originalname);
      }else {
        let extension = path.extname(file.originalname);
        var fileName = Date.now().toString() + extension;
        
        logger.debug('multer fileName : ' + fileName);
        cb(null, fileName);
      }
    }
  });

  return storage;

}

localStorage.upload = function(req, res, fieldName, path, callback) {
  logger.debug('[func] localStoage.upload - fieldName : ' + fieldName + ', path : ' + path);
  
  var storage= multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      let extension = path.extname(file.originalname);
      cb(null, Date.now().toString() + extension);
    }
  });
  
  var upload = multer({
    storage: storage,
  }).single(fieldName);
  
  try {
    upload(req, res, null, function(err) {
      if (err) {
        return callback(err, null);
      }
      
      logger.debug('[msg] files uploaded!');
      logger.dir(req.file);
      
      
      if (req.file === undefined) {
        return callback(null, null, req.body);
      }
      
      var newUrl = req.file.location;
      
//      console.log('multer - body : ' + req.body);
//      console.dir(req.body);

      return callback(null, newUrl, req.body);
    });
  }catch (e) {
    logger.error(logger.obj(e));
    return callback(e, null, req.body);
  }
}


module.exports = localStorage;