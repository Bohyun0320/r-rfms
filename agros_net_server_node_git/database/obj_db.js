var logger = require('../logger');
var postgresUtil = require('../utils/postgres_util');
var pgFormat = require('pg-format');
var queryUtil = require('../utils/query_util');
// var format = require('pg-format');
// var userDb = require('./user_db');
var trffcSignDB = require('./trffc_sign_db');
var trffcSignTyDB = require('./trffc_sign_ty_db');
const { Sign } = require('crypto');
const prjDB = require('./prj_db');
const sigDB = require('./sig_db');

var objDB = {};

var tableName = 'obj_rs';

objDB.tableName = tableName;

// objDB.insertDataInfoList = function (dataList, callback) {
//   logger.debug('[func]prjDB.inserPrjInfo');

//   if (!dataList || dataList.length == 0) {
//     logger.error('invalid dataList!');
//     return callback('invalid dataList!', null);
//   }

//   try {

//     var query = pgFormat('INSERT INTO ' + dataTableName
//       + ' (prj_id, org_file_nm, data_file_path, file_len, data_ty_id, data_reg_ty_id) VALUES %L '
//       + ' ON CONFLICT (data_file_path) '
//       + ' DO NOTHING '
//       , dataList);

//     postgresUtil.query(query, function (err, result) {
//       return callback(err, result);
//     });
//   } catch (e) {
//     logger.dir(e);
//   }
// }

objDB.getReadObjList = function (dataListInfo, callback) {
  logger.debug('[func]prjDB.getReadDataList()');
  // logger.obj(vhListInfo);

  try {
    var query = {
      // text: `SELECT o.*, t.trffc_sign_ty_nm, s.sign_nm, p.ps_id, p.updt_nd_yn, ph.org_file_nm, ph.data_file_path,
      // text: `SELECT o.*, s.sign_nm, o.updt_yn, ph.org_file_nm, ph.data_file_path,
      //         ph.longtitude, ph.latitude, s.sign_img_file_path, pm.prj_nm, 
      //         st_assvg(labling, 0, 0) svg, ST_AsText(labling) lab_txt, count(*) OVER() total 
      //       FROM obj_rs o
      //       LEFT JOIN tc_trffc_sign s ON o.cd = s.sign_id 
      //       left join photo_mng ph on o.photo_id = ph.photo_id 
      //       left join project_mng pm on o.prj_id = pm.prj_id `,
      text: `SELECT o.*, s.sign_nm, o.updt_yn, ph.org_file_nm, ph.data_file_path,
              ph.longtitude, ph.latitude, s.sign_img_file_path, pm.prj_nm, 
              ST_AsText(ST_transform(ST_SetSRID(point, 32652), 4326)) point, count(*) OVER() total 
            FROM obj_rs o
            LEFT JOIN tc_trffc_sign s ON o.cd = s.sign_id 
            left join photo_mng ph on o.photo_id = ph.photo_id 
            left join project_mng pm on o.prj_id = pm.prj_id `,
      values: []
    }
  } catch (ex) {
    logger.dir(ex);
  }

  query = queryUtil.addFilterQuery(dataListInfo, query);
  query = queryUtil.addSortQuery(dataListInfo, query, 'obj_rs_id');
  query = queryUtil.addLimitQuery(dataListInfo, query);

  postgresUtil.query(query, function (err, result) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });

}

objDB.getReadObj = function(obj_rs_id, callback){
  logger.debug('[func]objDB.getReadObj()');

  try{
    var query={
      text: `SELECT o.*, s.sign_nm, o.updt_yn, ph.org_file_nm, ph.data_file_path,
            ph.longtitude, ph.latitude, s.sign_img_file_path, pm.prj_nm, 
            ST_AsText(ST_transform(ST_SetSRID(point, 32652), 4326)) point, count(*) OVER() total 
            FROM obj_rs o
            LEFT JOIN tc_trffc_sign s ON o.cd = s.sign_id 
            left join photo_mng ph on o.photo_id = ph.photo_id 
            left join project_mng pm on o.prj_id = pm.prj_id
            where o.obj_rs_id = $1`,
      values: [obj_rs_id]
    }
  }catch(ex){
    logger.dir(ex);
  }

  postgresUtil.query(query, function(err, result){
    if(err){
      return callback(err, null);
    }
    return callback(null, result.rows);
  });
}

objDB.getTotalData = function(params) {
  return new Promise((resolve, reject) => {

    const query = {
      text: `select count(*)::int
              from ` + tableName,

      values: [],
    }

    postgresUtil.query(query, function (err, result) {
      if (err) {
        return reject(err);
      }

      return resolve(result.rows[0]);
    });
  });
}

objDB.getStatByObjNm = function() {
  return new Promise((resolve, reject) => {

    const query = {
      // text: `select obj_nm, count(*)::int
      //       from ` + tableName + `
      //       group by obj_nm`,
      text: `select ts.sign_nm, count(*)::int
            from obj_rs o
            left join tc_trffc_sign ts on o.cd = ts.sign_id 
            group by ts.sign_nm `,

      values: [],
    }

    postgresUtil.query(query, function (err, result) {
      if (err) {
        return reject(err);
      }

      return resolve(result.rows);
    });
  });
}

objDB.delPrjData = function (prjId) {
  return new Promise((resolve, reject) => {

    logger.debug('[func]objDB.delPrjData - prjId : ' + prjId);

    const query = {
      text: `DELETE FROM ` + tableName + `
              WHERE prj_id = $1
              RETURNING *`,

      values: [prjId],
    }

    postgresUtil.query(query, function (err, result) {
      if (err || !result) {
        return resolve(null);
      }

      if (result.rows) {
        logger.debug('delete obj data succeed : ' + result.rows.length)
      }

      return resolve(result.rows);
    });

  });
}


objDB.getObjListByPrj = function(dataset, callback){
  logger.debug('[func]objDB.getObjListByPrj()');


  var PrjList = dataset['prjList'];
  var SignList = dataset['signList'];
  var updtYn = dataset.updtYn;

  
  logger.dir(PrjList);

  var updtYnCd = [1,2,3,4];
  if(updtYn == "true"){
    updtYnCd = [1,2,3];
  }


  var SignParams ="";
  for(var i = 0; i< SignList.length;i++){
    if(i == (SignList.length -1)){
      SignParams += "'"+SignList[i]+"'";
    }else{
      SignParams += "'"+SignList[i]+"'" +", ";
    }
  }

  
  try{
    var query={
      text: `SELECT o.*, s.sign_nm, o.updt_yn, ph.org_file_nm, ph.data_file_path,
            ph.longtitude, ph.latitude, s.sign_img_file_path, pm.prj_nm, 
            ST_AsText(ST_transform(ST_SetSRID(point, 32652), 4326)) point, count(*) OVER() total,
            st_x(st_transform(point, 4326)) naverX, st_y(st_transform(point, 4326)) naverY, s.sign_ty_id, s.sign_nm, st.trffc_sign_ty_nm , pm.prj_nm
            FROM obj_rs o 
            LEFT JOIN tc_trffc_sign s ON o.cd = s.sign_id 
            LEFT JOIN tc_trffc_sign_ty st ON s.sign_ty_id = st.trffc_sign_ty_id 
            left join photo_mng ph on o.photo_id = ph.photo_id  
            left join project_mng pm on o.prj_id = pm.prj_id  
            WHERE o.updt_yn in (${updtYnCd}) and o.prj_id in (${PrjList}) and o.cd in (${SignParams})`,
      values:[]
    }
  }catch(ex){
    logger.dir(ex);
  }

  postgresUtil.query(query, function(err, result){
    if(err){
      return callback(err, null);
    }
    return callback(null, result.rows);
  });
}

objDB.getObjListByRegion = function(dataset, callback){
  return new Promise((resolve, reject)=>{
    logger.debug('[func]objDB.getObjListByRegion ');

    var sigCd = "'"+dataset.sigCd+"'";
    var SignList = dataset.signList;
    var startDate = "'"+dataset.startDate+"'";
    var endDate = "'"+dataset.endDate+"'";
    var updtYn = dataset.updtYn;

    console.log("startDate : "+startDate+", endDate : "+endDate);

    var SignParams ="";
    for(var i = 0; i< SignList.length;i++){
      if(i == (SignList.length -1)){
        SignParams += "'"+SignList[i]+"'";
      }else{
        SignParams += "'"+SignList[i]+"'" +", ";
      }
    }

    var updtYnCd = [1,2,3,4];
    if(updtYn == "true"){
      updtYnCd = [1,2,3];
    }

    const query = {
      text : `SELECT o.*, s.sign_nm, o.updt_yn, ph.org_file_nm, ph.data_file_path,
              ph.longtitude, ph.latitude, s.sign_img_file_path, pm.prj_nm, 
              ST_AsText(ST_transform(ST_SetSRID(point, 32652), 4326)) point, count(*) OVER() total,
              st_x(st_transform(point, 4326)) naverX, st_y(st_transform(point, 4326)) naverY, s.sign_ty_id FROM `
              +tableName+ ` o `
              + ` LEFT JOIN `+ prjDB.tableName + ` pm ON o.prj_id = pm.prj_id `
              + ` LEFT JOIN `+ trffcSignDB.tableName +` s ON o.cd = s.sign_id `
              + ` LEFT JOIN photo_mng ph ON o.photo_id = ph.photo_id `
              + ` WHERE o.updt_yn in (${updtYnCd}) and pm.prj_crt_dt between ${startDate} and ${endDate} and st_intersects((select st_transform(st_setsrid(geom, 5179), 32652) from korea_map_sig kms where kms.sig_cd = ${sigCd}), o.point) = true and s.sign_id in (${SignParams});`,
      values : []
    }

    postgresUtil.query(query, function(err, result){
      if(err){
        return callback(err, null);
      }
      return callback(null, result.rows);
    });
  });
}



module.exports = objDB;