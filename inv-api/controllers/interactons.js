const db = require('../models');
const auth = require('./authorizations');
const utilCtl = require('./commonutils');
const moment = require('moment');

async function createInteractionForProspect(userData, interactionData) {
    if(!userData || !userData.id || userData.id=='') {
        return {status: 'error', messages: ['Owner User Id is mandatory to create Interaction'], data: null};
    }
    interactionData.client_type_code = 'PROSPECT';
    interactionData.interaction_date = moment();
    interactionData.team_code = 'IR';

    console.log('create interaction fn: check prospect');
    valRes = await validateProspectId(userData, ineractionData);
    if(valRes.status=='error') {
        validatedFlag = false;
        console.log('create interaction fn: prospect error, exit');
        errObj = valRes.data.errObj;
        errors.push(errObj);
        errorMessages.push(errObj.message);
        if(errObj.fieldName) errorFields.push(errObj.fieldName);
    }
    console.log('create interaction fn: check interaction type code');
    valRes = await validateInteractionType(userData, ineractionData);
    if(valRes.status=='error') {
        validatedFlag = false;
        console.log('create interaction fn: interaction type error, exit');
        errObj = valRes.data.errObj;
        errors.push(errObj);
        errorMessages.push(errObj.message);
        if(errObj.fieldName) errorFields.push(errObj.fieldName);
    }
    if(!validatedFlag) {
        return {status: 'error', messages: errorMessages, data:{errorFields: errorFields, errorObjArr: errors}};
    }
    console.log('create interaction: All validations are passed, create the interaction now..');
    console.log('Revised data: ', interactionData);
    let interaction = await db.Interaction.create(interactionData);
    console.log('create prospect result: ', interaction)
    return {status: "success", messages: [], data: interaction};    
}
async function validateProspectId(userData, ineractionData) {
    // check that prospect id is present in client_id
    // check that it is a valid prospect record
    // check that userData.id = prospect.owner_employee_id
    let mandatoryCheckRes = await utilCtl.validateBasicMandatory(ineractionData, 'client_id', 'Prospect id');
    if(mandatoryCheckRes.status=='error') {
        let errObj = {fieldName: 'client_id', message: mandatoryCheckRes.messages[0]};
        mandatoryCheckRes.data = {errObj: errObj};
        return mandatoryCheckRes;
    }
    let checkProspect = await db.Prospect.findOne({
        where: {
            id: interactionData.client_id
        }
    });
    if(!checkProspect) {
        let retOj = {status: 'error', messages: ['Prospect id is invalid']};
        let errObj = {fieldName: 'client_id', message: mandatoryCheckRes.messages[0]};
        retOj.data = {errObj: errObj};
        return retObj;
    }
    if(checkProspect.owner_employee_id != userData.id) {
        let retOj = {status: 'error', messages: ['Prospect is not owned by user']};
        let errObj = {fieldName: 'client_id', message: mandatoryCheckRes.messages[0]};
        retOj.data = {errObj: errObj};
        return retObj;
    }
    return {status: 'success', messages:[]};
}
async function validateInteractionType(ineractionData) {
    let mandatoryCheckRes = await utilCtl.validateBasicMandatory(ineractionData, 'interaction_type_code', 'Interaction Type Code');
    if(mandatoryCheckRes.status=='error') {
        let errObj = {fieldName: 'interaction_type_code', message: mandatoryCheckRes.messages[0]};
        mandatoryCheckRes.data = {errObj: errObj};
        return mandatoryCheckRes;
    }
    let checkCLVRes = await utilCtl.validateCLV(interactionData.interaction_type_code, 'INTERACTION_TYPE_CODES', 'Interaction Type Code');
    console.log('back from validateCLV, result: ', checkCLVRes);
    if(checkCLVRes.status=='error') {
        let errObj = {fieldName: 'interaction_type_code', message: checkCLVRes.messages[0]};
        checkCLVRes.data = {errObj: errObj};
        return checkCLVRes;
    }
    return {status: 'success', messages: []};
}

module.exports = {
  async createInteraction(req, res) {
    console.log('controller / interactions - create 1');
    if(!userData || !userData.id || userData.id=='') {
        return {status: 'error', messages: ['Owner User Id is mandatory to create prospect'], data: null}
    }
    if(!prospectData.owner_employee_id || prospectData.owner_employee_id =='') {
    prospectData.owner_employee_id = userData.id;
    }
    let validatedFlag = true;
    let errors = [];
    let errorMessages = [];
    let errorFields = [];
    let errObj = {};
    let valRes;

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

  async createInteractionForProspect(req, res) {
    console.log('create interaction for prospect : going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let interactionData = req.body;
    console.log('create interaction for prospect, User data from req: ', userData);
    console.log('create interaction for prospect, going to call function with user and prospect data: ');
    let interactionRetData = await createProspect(userData, interactionData);
    console.log('create interaction for prospect: returned data: ', interactionRetData);
    res.json(interactionRetData);
    return;
  },

}