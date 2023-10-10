var config = require('./config');

var dbConfig = {};

var dev_config = require('./secret/db_config_dev');
var dev2_config = require('./secret/db_config_dev2');
var certiGs_config = require('./secret/db_config_certi_gs');


dbConfig.getConfig = function () {
  //  console.log('config.env : ' + config.env);

  if (config.env == 'dev') {
    return dev_config;
  } else if (config.env == 'dev2') {
    return dev2_config;
  } else if (config.env == 'certi_gs') {
    return certiGs_config;
  }

  return null;
}

module.exports = dbConfig;