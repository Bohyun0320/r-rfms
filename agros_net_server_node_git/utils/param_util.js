var logger = require('../logger');

var paramUtil = {};

paramUtil.getSpecObj = function (sensType, body) {
  logger.debug('paramUtil.getSpecObj() - sensType : ' + sensType);

  var spec = {};

  spec.lidar_brand = body.lidar_brand ? body.lidar_brand : null;
  spec.lidar_model = body.lidar_model ? body.lidar_model : null;
  spec.lidar_serial = body.lidar_model ? body.lidar_serial : null;
  spec.lidar_resol = body.lidar_resol ? body.lidar_resol : null;
  spec.lidar_range = body.lidar_range ? body.lidar_range : null;
  spec.lidar_size = body.lidar_size ? body.lidar_size : null;
  spec.lidar_weight = body.lidar_weight ? body.lidar_weight : null;
  spec.lidar_etc = body.lidar_etc ? body.lidar_etc : null;

  spec.cam_brand = body.cam_brand ? body.cam_brand : null;
  spec.cam_model = body.cam_model ? body.cam_model : null;
  spec.cam_serial = body.cam_serial ? body.cam_serial : null;
  spec.cam_size = body.cam_size ? body.cam_size : null;
  spec.cam_resol = body.cam_resol ? body.cam_resol : null;
  spec.cam_pixel = body.cam_pixel ? body.cam_pixel : null;
  spec.cam_focus = body.cam_focus ? body.cam_focus : null;
  spec.cam_calbr = body.cam_calbr ? body.cam_calbr : null;


  // if (sensType == 1) {

  //   spec.lidar_brand = body.lidar_brand ? body.lidar_brand : null;
  //   spec.lidar_model = body.lidar_model ? body.lidar_model : null;
  //   spec.lidar_serial = body.lidar_model ? body.lidar_serial : null;
  //   spec.lidar_resol = body.lidar_resol ? body.lidar_resol : null;
  //   spec.lidar_range = body.lidar_range ? body.lidar_range : null;
  //   spec.lidar_size = body.lidar_size ? body.lidar_size : null;
  //   spec.lidar_weight = body.lidar_weight ? body.lidar_weight : null;
  //   spec.lidar_etc = body.lidar_etc ? body.lidar_etc : null;

  //   // cam
  // } else if (sensType == 2) {
  //   spec.cam_brand = body.cam_brand ? body.cam_brand : null;
  //   spec.cam_model = body.cam_model ? body.cam_model : null;
  //   spec.cam_size = body.cam_size ? body.cam_size : null;
  //   spec.cam_resol = body.cam_resol ? body.cam_resol : null;
  //   spec.cam_pixel = body.cam_pixel ? body.cam_pixel : null;
  //   spec.cam_focus = body.cam_focus ? body.cam_focus : null;
  //   spec.cam_calbr = body.cam_calbr ? body.cam_calbr : null;

  // }

  logger.dir(spec);

  return spec;

}

module.exports = paramUtil;