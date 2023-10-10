// import {prjInfoApi} from './module/fr_prj_info_module.js';
import prjInfoApi from './module/fr_prj_info_module.js';

$(document).ready(function($) {
  // console.log(userList);

  prjInfoApi.init();
  prjInfoApi.setMode('MOD_INFO_VIEW', prjInfo);

  // btnInit();

});


