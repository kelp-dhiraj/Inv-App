const db = require('../models');
const moment = require('moment');
const utilCtl = require('./commonutils');

async function getUserDataFromReq(req) {
  let userId;
  let user;
  if(req.query && req.query.test_mode && req.query.test_mode=='Y') {
    if(!req.query.user_id || req.query.user_id=='') {
      console.log('get user data from req query: UNABLE to derive user_id from query params');
      return {status: 'error', messages:['Test mode (query) needs user_id to be passed'], data: null};
    }
    userId = req.query.user_id;
  } else if(req.body && req.body.test_mode && req.body.test_mode=='Y') {
    if(!req.body.user_id || req.body.user_id=='') {
      console.log('get user data from req body: UNABLE to derive user_id from body params');
      return {status: 'error', messages:['Test mode (body) needs user_id to be passed'], data: null};
    }
    userId = req.body.user_id;
  } else if(req.user && req.user.oid && req.user.oid!='') {
    console.log('get user data from auth: req has oid: ', req.user.oid);
    user = await db.Employee.findOne({
      where: { ad_oid : req.user.oid }
    });
    if(user) {
      console.log('get user data from auth: user derived from auth oid: ', user.get({plain:true}));
      return {status: 'success', messages:[], data: user.get({plain:true})};
    } else {
      console.log('get user data from auth: UNABLE to get user using auth oid: ');
      return {status: 'error', messages:['Auth mode, unable to derive user, please contact support'], data: null};
    }
  }else if(req.query && req.query.oid && req.query.oid!='') {
    console.log('get user data from auth: req has oid: ', req.query.oid);
    user = await db.Employee.findOne({
      where: { ad_oid : req.query.oid }
    });
    if(user) {
      console.log('get user data from auth: user derived from auth oid: ', user.get({plain:true}));
      return {status: 'success', messages:[], data: user.get({plain:true})};
    } else {
      console.log('get user data from auth: UNABLE to get user using auth oid: ');
      return {status: 'error', messages:['Auth mode, unable to derive user, please contact support'], data: null};
    }
  } else {
    console.log('get user data from req data: UNABLE to derive userId, get out..');
    return {status: 'error', messages:['Unable to determine user Id, please contact support'], data: null};
  }
  // if we are here, then we are in test mode, we have only userId
  if(userId==''){
    return {status: 'error', messages:['user Id is blank, please contact support'], data: null};
  } else {
    console.log('get user data in test mode: going to get user using passed userId: ', userId);
    user = await db.Employee.findOne({
      where: { id : userId }
    });
    if(user) {
      console.log('get user data in test mode: user derived from passed userId: ', user.get({plain:true}));
      return {status: 'success', messages:[], data: user.get({plain:true})};
    } else {
      console.log('get user data in test: UNABLE to get user from passed user id: ', userId);
      return {status: 'error', messages:['Auth mode, unable to derive user, please contact support'], data: null};
    }
  }
  return {status: 'error', messages:['Unreachable, contact support'], data: null};
}

module.exports = {
  async getAuth(req, res) {
    const Op = db.Sequelize.Op;
    console.log('getAuth oid: ', req.user.oid);
    if(!req.user.oid) {
      res.json({ status: 'error' , messages: ['Error in get Azure oid, please contact support.'], data: {} });
      return;
    }
    let empData = await db.Employee.findOne({
      where: {
        ad_oid : req.user.oid //this is the unique info azure ad sends
      },
      attributes: ['id', 'email', 'full_name', 'is_admin', 'profile_picture']
      , include:[
        {
          model: db.Employee
          , as: 'sup'
          , required: false
        },
        {
          model: db.Employee
          , as: 'hr'
          , required: false
        }
      ]
      //, include:[{ model: db.PersonRole, as: 'roles', attributes: ['role_code'] }]
    });
    if(!empData) {
      console.log('getAuth: base query failed..');
      res.json({ status: 'error' , messages: ['Error in get emp data, please contact support.'], data: {} });
      return;
    }
    let empInfo = empData.get({plain: true});
    // is user a reviewer?
    // in current perf year, are there any goalsheets where this emp is a reviewer on indicators
    // empInfo.showReview = false;
    // let currPerfPeriod = await utilCtl.getCurrPerfPeriod();
    // if(currPerfPeriod) {
    //   if(utilCtl.isEmpReviewer(empData.id, currPerfPeriod.id)) empInfo.showReview= true;
    // }
    // // is user a LM
    // if(await utilCtl.isEmpLM(empData.id)) empInfo.showLM = true;
    // // user user a HR
    // empInfo.showHR = false;    
    // if(await utilCtl.isEmpHR(empData.id)) empInfo.showHR = true;

    console.log('Auth: empInfo data: ', empInfo);

    res.json({ status: 'success' , messages: [], data: empInfo });
  },
  async getUsers(req, res) {
    //console.log(req.user);
   let emps = await db.Employee.findAll({
      attributes: ['id', 'email', 'full_name']
      //, include:[{ model: db.PersonRole, as: 'roles', attributes: ['role_code'] }]
    });
    res.json({ status: 'success' , messages: [], data: emps });
  },

  user(req) {
    let oid;
    if(req.user && req.user.oid){
      oid = req.user.oid
    }else if(req.query && req.query.oid){
      oid = req.query.oid
    }
    return db.Employee.findOne({
      where: { ad_oid : oid}

    }).then((emp) => {
      let empl = emp.get({plain: true});
      console.log(empl);
      return empl;
    })
    .catch((err) => {
      console.log('-------------error in auth user--------------');
      console.log(err);
      return err;
    })
    ;
  },
  async getUserDataFromReq(req) {
    return getUserDataFromReq(req);
  }
  

}