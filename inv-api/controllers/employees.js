const db = require('../models');
const auth = require('./authorizations');

module.exports = {
  async updateEmployee(req, res) {
    try {
      console.log('controller / empgoalindicatorcomments - empGoalIndicatorCommentsList 1');
      //let user = await auth.user(req);
      let user = {};
      let empId = req.params.id;
      console.log(`updateEmployee: empId: ${empId}`);
      if(req.body.test_mode && req.body.test_mode=='Y') {
        user = {admin:true, id: empId};
      } else {
        user = await auth.user(req);
      }

      let data = req.body;
      console.log(`updateEmployee: data:`, data);
      let emp = await db.Employee.findOne({
        where: {id: empId}
      });
      if(!emp) {
        res.json({ status: 'error' , messages: ['Invalid Employee id.'] });
        return;
      }
      console.log(`updateEmployee: emp:`, emp.get({plain:true}));
      /*
      if(!data.supervisor_emp_id || data.supervisor_emp_id == "") {
        res.json({ status: 'error' , messages: ['Supervisor is mandatory'] });
        return;
      }
      */
      if(data.supervisor_emp_id && data.supervisor_emp_id != "") {
        emp.supervisor_emp_id = data.supervisor_emp_id;
      }
      if(data.supervisor_emp_id)
      if(!data.hr_emp_id || data.hr_emp_id == "") {
        res.json({ status: 'error' , messages: ['HR is mandatory'] });
        return;
      }
      
      emp.hr_emp_id = data.hr_emp_id;
      emp.is_admin = data.is_admin;
      emp.designation_code = data.designation_code;
      emp.department_code = data.department_code;
      console.log(`updateEmployee: updated emp:`, emp.get({plain:true}));
      await emp.save();

      res.json({status:'success', messages:['Employee Updated']});
      
    } catch(err) {
      console.log(err);
      res.json({status:'error', messages:['Error in Employee data update']});
    }
  },
  async updateEmpProfilePic(req, res) {
    try {
      console.log('controller / empgoalindicatorcomments - updateEmpProfilePic 1');
      //let user = await auth.user(req);
      let user = {};
      let empId = req.params.id;
      console.log(`updateEmpProfilePic: empId: ${empId}`);
      if(req.body.test_mode && req.body.test_mode=='Y') {
        user = {admin:true, id: empId};
      } else {
        user = await auth.user(req);
      }

      let data = req.body;
      //console.log(`updateEmployee: data:`, data);
      let emp = await db.Employee.findOne({
        where: {id: empId}
      });
      if(!emp) {
        res.json({ status: 'error' , messages: ['Invalid Employee id.'] });
        return;
      }
      console.log(`updateEmployee: emp:`, emp.get({plain:true}));
      /*
      if(!data.supervisor_emp_id || data.supervisor_emp_id == "") {
        res.json({ status: 'error' , messages: ['Supervisor is mandatory'] });
        return;
      }
      */
     console.log(`updateEmpProfilePic: data:`, data);
      emp.profile_picture = data.profile_picture;
      console.log(`updateEmployee: updated emp:`, emp.get({plain:true}));
      await emp.save();

      res.json({status:'success', messages:['Employee Profile Picture Updated']});
      //res.json({status:'error', messages:['temp stop..']});
      
    } catch(err) {
      console.log(err);
      res.json({status:'error', messages:['Error in Employee Profile Picture update']});
    }
  },
  async getEmployees(req, res) {
    //console.log(req.user);
   let emps = await db.Employee.findAll({
      attributes: ['id', 'email', 'full_name', 'is_admin']
      //, include:[{ model: db.PersonRole, as: 'roles', attributes: ['role_code'] }]
      , include: [
        {
          model: db.Employee
          , as: 'sup'
          , required: false
          , attributes: ['id', 'email', 'full_name']
        },
        {
          model: db.Employee
          , as: 'hr'
          , required: false
          , attributes: ['id', 'email', 'full_name']
        }
      ]
    });
    res.json({ status: 'success' , messages: [], data: emps });
  },
  async getSingleEmployee(req, res) {
    console.log('controller / employee - getSingleEmployee 1');
    //let user = await auth.user(req);
    let user = {};
    let empId = req.params.id;
    if(req.query.test_mode && req.query.test_mode=='Y') {
      user = {admin:true, id: empId};
    } else {
      user = await auth.user(req);
    }
    //console.log(req.user);
    let emp = await db.Employee.findOne({
      where : {id: empId}
      //attributes: ['id', 'email', 'full_name']
      //, include:[{ model: db.PersonRole, as: 'roles', attributes: ['role_code'] }]
      , include: [
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
    });
    res.json({ status: 'success' , messages: [], data: emp });
  },

}