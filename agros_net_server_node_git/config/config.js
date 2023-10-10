/*
 * 설정
 */

module.exports = {
	server_port: 3001,
  env: 'dev2', // 'construction' dev' 'prod' 'prod2' 'test' 'test2' 'test3'
  admin_login : false,
  tester_login :false,
  scrtDbDRM : false,
  ssl: true,
  // ssl: true,
	path : {
    storageStatic : {original : '../storage/static', static : '/'},
    storageInternal : {original : '../storage/internal', static : '/'},
    storage : {original : '../storage/', static : null },
    log : {original : '../storage/internal/log/', static : null },
    backupStorage : {original : '../../backup.argos.net/storage', static : null },
    restoreStorage : {original : '../../backup.argos.net/restore/', static : null },

    profileimage : {original : '../storage/static/profile', static : '/profile/photo/'},
    equipImage : {original : '../storage/static/equip', static : '/equip/photo/'},
    data : {original : '../storage/static/data', static : '/data/'},
    dataNas : {original : 'Z:\\argos_net_storage\\data', static : '/data/'},
    // bsnsBndryFile : {original : '../storage/internal/bsns/', static : null },
    // scrtDb : {original : '../storage/internal/scrtdb/', static : null },
    // impchFile : {original : '../storage/internal/impch', static : null },

	},
  DEFAULT_USER_PW : 'rfmspw1!',

  getDataPath : function() {
    if (this.env == 'dev' || this.env == 'certi_gs') {
      return this.path.data;
    }
    return this.path.dataNas;
  },

	route_info: [ 
      // page
      {file: './page/route_root', path:'/', method:'getRoot', type:'get'},
      {file: './page/route_root', path:'/login', method:'getLogin', type:'get'},
      
      // account
      {file: './page/route_account', path:'/signup', method:'getSignup', type:'get'},
      {file: './page/route_account', path:'/account/list', method:'getAccountList', type:'get'},
      {file: './page/route_account', path:'/account/my', method:'getAccountMy', type:'get'},
      {file: './page/route_account', path:'/account/view/:email', method:'getAccountView', type:'get'},
      
      // equip
      {file: './page/route_equip', path:'/equip/list/vehicle', method:'getListVh', type:'get'},
      {file: './page/route_equip', path:'/equip/list/sensor', method:'getListSens', type:'get'},

      {file: './page/route_equip', path:'/equip/add/vehicle', method:'getAddVehicle', type:'get'},
      {file: './page/route_equip', path:'/equip/add/sensor', method:'getAddSensor', type:'get'},
      
      {file: './page/route_equip', path:'/equip/vehicle/:vhid', method:'getViewVh', type:'get'},
      {file: './page/route_equip', path:'/equip/sens/:sensid', method:'getViewSens', type:'get'},

      // map
      {file: './page/route_map', path:'/map/list/map', method:'getListMap', type:'get'},


      // data
      {file: './page/route_data', path:'/data/list/prj', method:'getListPrj', type:'get'},
      {file: './page/route_data', path:'/data/add/prj', method:'getAddPrj', type:'get'},
      {file: './page/route_data', path:'/data/list/cam', method:'getListDataCam', type:'get'},
      {file: './page/route_data', path:'/data/list/lidar', method:'getListDataLidar', type:'get'},
      {file: './page/route_data', path:'/data/list/obj', method:'getListObj', type:'get'},
      
      {file: './page/route_data', path:'/data/view/prj/:prjid', method:'getViewPrj', type:'get'},
      {file: './page/route_data', path:'/data/view/data/:dataid', method:'getViewData', type:'get'},

      // statistic
      {file: './page/route_stat', path:'/stat/dashboard', method:'getDashboard', type:'get'},

      // document
      {file: './page/route_docs', path:'/doc/:docname', method:'getDocuemnt', type:'get'},


      

      // internal API (session based)
      // account
      {file: './api/api_account', path:'/api/account/read', method:'readUserList', type:'get'},
      {file: './api/api_account', path:'/api/account/update', method:'uploadUserPhoto', type:'post'},
      {file: './api/api_account', path:'/api/account/update', method:'postUpdateUser', type:'post'},
      {file: './api/api_account', path:'/api/account/changepw', method:'postChangePw', type:'post'},
      {file: './api/api_account', path:'/api/account/reset', method:'postUserReset', type:'post'},

      // equip
      {file: './api/api_equip', path:'/api/equip/add/vehicle', method:'uploadEquipPhoto', type:'post'},
      {file: './api/api_equip', path:'/api/equip/add/vehicle', method:'postAddVehicle', type:'post'},
      {file: './api/api_equip', path:'/api/equip/update/vehicle', method:'uploadEquipPhoto', type:'post'},
      {file: './api/api_equip', path:'/api/equip/update/vehicle', method:'postUpdateVehicle', type:'post'},
      {file: './api/api_equip', path:'/api/equip/read/vh', method:'readVhList', type:'get'},
      
      // {file: './api/api_equip', path:'/api/equip/add/sens', method:'uploadEquipPhoto', type:'post'},
      {file: './api/api_equip', path:'/api/equip/add/sens', method:'uploadSensFiles', type:'post'},
      {file: './api/api_equip', path:'/api/equip/add/sens', method:'postAddSens', type:'post'},
      {file: './api/api_equip', path:'/api/equip/read/sens', method:'readSensList', type:'get'},
      
      // {file: './api/api_equip', path:'/api/equip/update/sens', method:'uploadEquipPhoto', type:'post'},
      {file: './api/api_equip', path:'/api/equip/update/sens', method:'uploadSensFiles', type:'post'},
      {file: './api/api_equip', path:'/api/equip/update/sens', method:'postUpdateSens', type:'post'},
      
      // DATA
      {file: './api/api_data', path:'/api/data/add/prj', method:'postAddPrj', type:'post'},
      {file: './api/api_data', path:'/api/data/delete/prj', method:'postDelPrj', type:'post'},
      {file: './api/api_data', path:'/api/data/update/prj', method:'postUpdatePrj', type:'post'},
      {file: './api/api_data', path:'/api/data/upload/prjdata/:prjid', method:'uploadPrjData', type:'post'},
      {file: './api/api_data', path:'/api/data/upload/prjdata/:prjid', method:'postUploadPrjDataProc', type:'post'},
      {file: './api/api_data', path:'/api/data/read/prj', method:'readPrjList', type:'get'},
      {file: './api/api_data', path:'/api/data/read/cam', method:'readDataCamList', type:'get'},
      {file: './api/api_data', path:'/api/data/read/lidar', method:'readDataLidarList', type:'get'},
      {file: './api/api_obj', path:'/api/data/read/obj', method:'readObjList', type:'get'},
      
      {file: './api/api_data', path:'/api/data/package/:prjid/:dataty', method:'getDataPackage', type:'get'},
      {file: './api/api_data', path:'/api/data/down/:dataty/:dataid', method:'getDataDownload', type:'get'},
      
      {file: './api/api_data', path:'/api/data/path/:prjid', method:'getDataPath', type:'get'},
      
      {file: './api/api_data', path:'/api/data/lidar/img', method:'getLidarImg', type:'get'},

      {file: './api/api_data', path:'/api/data/proc/start', method:'startDataProc', type:'post'},


      // MAP
      {file:'./api/api_map', path:'/api/map/sig', method: 'postSigBySido', type:'post'},
      {file:'./api/api_map', path: '/api/map/searchMapPrj', method:'postSearchMapByPrj', type: 'post'},
      {file:'./api/api_map', path: '/api/map/searchMapRegion', method:'postSearchMapByRegion', type: 'post'},
      {file:'./api/api_obj', path: '/api/map/read/obj/:objRsId', method: 'readObj', type: 'get'},
      
      // stat
      {file: './api/api_stat', path:'/api/stat/data-total', method:'getTotalData', type:'get'},
      {file: './api/api_stat', path:'/api/stat/prj-status', method:'getProjectStauts', type:'get'},
      {file: './api/api_stat', path:'/api/stat/data-period', method:'getDataPeriod', type:'get'},
      {file: './api/api_stat', path:'/api/stat/equip', method:'getDataEquipStatus', type:'get'},
      {file: './api/api_stat', path:'/api/stat/object', method:'getObjStatus', type:'get'},


      // REST api 
      {file: './api/api_rest', path:'/api/auth/token', method:'postAuthTokken', type:'post'},
      {file: './api/api_rest', path:'/api/equip/list', method:'getEquipList', type:'get'},
      
      {file: './api/api_rest', path:'/api/project/add', method:'postPrjAdd', type:'post'},
      

      {file: './api/api_rest', path:'/api/data/meta', method:'postMetaData', type:'post'},
      {file: './api/api_rest', path:'/api/project/scan/:prjid', method:'getPrjScan', type:'get'},
      {file: './api/api_rest', path:'/api/project/data/:prjid', method:'getPrjData', type:'get'},
      {file: './api/api_rest', path:'/api/project/sync', method:'postPrjSync', type:'post'},
      {file: './api/api_rest', path:'/api/project/clone', method:'postClonePrj', type:'post'},
      
      {file: './api/api_rest', path:'/api/data/finish', method:'postFinishData', type:'post'},
      
      // {file: './api/api_rest', path:'/api/data/process', method:'postPrcData', type:'post'},
      {file: './api/api_rest', path:'/api/data/prc-finish', method:'postFinishPrcData', type:'post'},
      
      {file: './api/api_debug', path:'/api/debug/token', method:'getDebugToken', type:'get'},
      {file: './api/api_debug', path:'/api/debug/update-pnu', method:'postUpdatePnu', type:'post'},
	]
}