module.exports = function() {
  var log = console.log;

  console.log = function () {
    var first_parameter = arguments[0];
    var other_parameters = Array.prototype.slice.call(arguments, 1);

    log.apply(console, [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters));
  };
}

String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };

function formatConsoleDate (date) {
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).zf(2);
  var day = date.getDate().zf(2);
  var hour = date.getHours().zf(2);
  var minutes = date.getMinutes().zf(2);
  var seconds = date.getSeconds().zf(2);
  var milliseconds = date.getMilliseconds().zf(3);

//  return '[' +
//       ((hour < 10) ? '0' + hour: hour) +
//       ':' +
//       ((minutes < 10) ? '0' + minutes: minutes) +
//       ':' +
//       ((seconds < 10) ? '0' + seconds: seconds) +
//       '.' +
//       ('00' + milliseconds).slice(-3) +
//       '] ';
  
//  stackTrace = require(stackTrace); 
//  var thistrace = stackTrace.get(); 
//  var parent_name = thistrace[1].getFunctionName(); 
//  var parent_eval = thistrace[1].getEvalOrigin(); 
//  msg = sprintf("[%s][%s]: %s", parent_eval, parent_name, msg); Ti.API.info(msg);
  
//  var parts = callingModule.filename.split('/');
//  var parent_part = parts[parts.length - 2] + '/' + parts.pop();
  
//  var parent_part = process.callingModule.filename.match(/[\w-]+\.js/gi)[0];
  
  return '[' + year + '/' + month + '/' + day + '|' 
          + hour + ':' + minutes + ':' + seconds + ':' + milliseconds + '|' /*+ parent_part */+ ']';
}