var xss = require('xss');
var rawbody = require('raw-body');
var logger = require('../logger');

var secureUtil = {};

var defaultOption = {
  xssFilter : true,
  sqlInjection : true
}

secureUtil.check = function(value, option) {
  
  if (!option) {
    option = defaultOption;
  }
  
  var valFiltered;
  
  if (option.xssFilter) {
    valFiltered = xss(value);
  }
  
  if (option.sqlInjection && hasSql(value)) {
    logger.warn('SQL injected : ' + value);
    // 작은따옴표 ('),  이중대시(--), 샵(#), =, 개행문자 이후의 ('), (--), (;), 
    // (or), (union)

    throw '보안에 취약한 문자가 포함 되었습니다. - 작은따옴표(\'),  이중대시(--), 샵(#), (=),  (;), (or), (union)'; 
  }
  
  return valFiltered;
}

// function reference : https://github.com/ghafran/sql-injection

function hasSql(value) {

    if (value === null || value === undefined) {
        return false;
    }

    // sql regex reference: http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
    
    // 작은따옴표 ('), 샵(#)
    var sql_meta = new RegExp('(%27)|(\')|(--)|(%23)|(#)', 'i');
    if (sql_meta.test(value)) {
        return true;
    }

    // (=), 이중대시(--), 콜론(;)
    var sql_meta2 = new RegExp('((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))', 'i');
    if (sql_meta2.test(value)) {
        return true;
    }

    // or
    var sql_typical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i');
    if (sql_typical.test(value)) {
        return true;
    }

    // union
    var sql_union = new RegExp('((%27)|(\'))union', 'i');
    if (sql_union.test(value)) {
        return true;
    }

    return false;
}

secureUtil.middleware = function(req, res, next) {

    var containsSql = false;

    if (req.originalUrl !== null && req.originalUrl !== undefined) {
        if (hasSql(req.originalUrl) === true) {
            containsSql = true;
        }
    }

    if (containsSql === false) {
        rawbody(req, {
            encoding: 'utf8'
        }, function(err, body) {

            if (err) {
                return next(err);
            }

            if (body !== null && body !== undefined) {

                if (typeof body !== 'string') {
                    body = JSON.stringify(body);
                }

                if (hasSql(body) === true) {
                    containsSql = true;
                }
            }

            if (containsSql === true) {
                res.status(403).json({
                    error: 'SQL Detected in Request, Rejected.'
                });
            } else {
                next();
            }
        });
    } else {
        res.status(403).json({
            error: 'SQL Detected in Request, Rejected.'
        });
    }
}

module.exports = secureUtil;