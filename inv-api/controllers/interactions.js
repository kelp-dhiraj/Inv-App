const db = require('../models');
const auth = require('./authorizations');
const utilCtl = require('./commonutils');
const moment = require('moment');

async function createInteractionForProspect(userData, interactionData) {
  let validatedFlag = true;
  let errors = [];
  let errorMessages = [];
  let errorFields = [];
  let errObj = {};
  let valRes;

  console.log('create interaction fn: interaction data:', interactionData)

  if(!userData || !userData.id || userData.id=='') {
      return {status: 'error', messages: ['Owner User Id is mandatory to create Interaction'], data: null};
  }
  interactionData.client_type_code = 'PROSPECT';
  interactionData.interaction_date = moment();
  // TODO: this hard coding to be removed.. first 2 chars of interaction type code gives the team code..
  //interactionData.team_code = 'IR';
  //pooja 10-May to get first 2 character 
  interactionData.team_code = interactionData.interaction_type_code.substr(0, 2);
    
  console.log('create interaction fn: check teamcode');
  valRes = await validateTeamCode(interactionData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create interaction fn: teamcode type error, exit');
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create interaction fn: check prospect');
  valRes = await validateProspectId(userData, interactionData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create interaction fn: prospect error, exit');
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create interaction fn: check interaction type code');
  valRes = await validateInteractionType(interactionData);
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
async function validateProspectId(userData, interactionData) {
    // check that prospect id is present in client_id
    // check that it is a valid prospect record
    // check that userData.id = prospect.owner_employee_id
    let mandatoryCheckRes = await utilCtl.validateBasicMandatory(interactionData, 'client_id', 'Prospect id');
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
        let errObj = {fieldName: 'client_id', message: retObj.messages[0]};
        retOj.data = {errObj: errObj};
        return retObj;
    }
    if(checkProspect.owner_employee_id != userData.id) {
        let retObj = {status: 'error', messages: ['Prospect is not owned by user']};
        let errObj = {fieldName: 'client_id', message: retObj.messages[0]};
        retObj.data = {errObj: errObj};
        return retObj;
    }
    return {status: 'success', messages:[]};
}
async function validateInteractionType(interactionData) {
    let mandatoryCheckRes = await utilCtl.validateBasicMandatory(interactionData, 'interaction_type_code', 'Interaction Type Code');
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
async function getInteractionById(interactionId) {
  if(interactionId=='') {
    return {status: 'error', messages: ['Interaction id is mandatory'], data: null};
  }
  let interactionData = await db.Interaction.findOne({
    where: {id: interactionId}
    , include: [
      {
        model: db.CommonListValue
        , as: 'int_type'
        , where: {list_code: 'INTERACTION_TYPE_CODES'}
        , required: false
      },
      {
        model: db.CommonListValue
        , as: 'team'
        , where: {list_code: 'TEAM_CODES'}
        , required: false
      }
    ]
  });
  return {status: 'success', messages: [], data: interactionData};

}
async function validateTeamCode(interactionData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(interactionData, 'team_code', 'Team Code');
  if(mandatoryCheckRes.status=='error') {
      let errObj = {fieldName: 'team_code', message: mandatoryCheckRes.messages[0]};
      mandatoryCheckRes.data = {errObj: errObj};
      return mandatoryCheckRes;
  }
  let checkCLVRes = await utilCtl.validateCLV(interactionData.team_code, 'TEAM_CODES', 'Team Code');
  console.log('back from validateCLV, result: ', checkCLVRes);
  if(checkCLVRes.status=='error') {
      let errObj = {fieldName: 'team_code', message: checkCLVRes.messages[0]};
      checkCLVRes.data = {errObj: errObj};
      return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function createInteractionForExistingInvestor(userData, interactionData) {
  let validatedFlag = true;
  let errors = [];
  let errorMessages = [];
  let errorFields = [];
  let errObj = {};
  let valRes;

  console.log('create interaction fn: interaction data:', interactionData)

  if(!userData || !userData.id || userData.id=='') {
      return {status: 'error', messages: ['Owner User Id is mandatory to create Interaction'], data: null};
  }
  interactionData.client_type_code = 'EXISTING_INVESTOR';
  interactionData.interaction_date = moment();
  // TODO: this hard coding to be removed.. first 2 chars of interaction type code gives the team code..
  // interactionData.team_code = 'IR';
  //pooja 10-May to get first 2 character 
  interactionData.team_code = interactionData.interaction_type_code.substr(0, 2);
  console.log('validate interaction fn: teamcode data:',  interactionData.team_code)
  console.log('create interaction fn: check teamcode');
  valRes = await validateTeamCode(interactionData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create interaction fn: teamcode type error, exit');
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }

  console.log('create interaction fn: check existing investor');
  valRes = await validateExistingInvestorId(userData, interactionData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create interaction fn: existing investor error, exit');
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create interaction fn: check interaction type code');
  valRes = await validateInteractionType(interactionData);
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
  console.log('create existing investor result: ', interaction)
  return {status: "success", messages: [], data: interaction};    
}
async function validateExistingInvestorId(userData, interactionData) {
    // check that Existing Investor id is present in client_id
    // check that it is a valid Existing Investor record
    // check that userData.id = existingInvestor.owner_employee_id
    let mandatoryCheckRes = await utilCtl.validateBasicMandatory(interactionData, 'client_id', 'Existing Investor id');
    if(mandatoryCheckRes.status=='error') {
        let errObj = {fieldName: 'client_id', message: mandatoryCheckRes.messages[0]};
        mandatoryCheckRes.data = {errObj: errObj};
        return mandatoryCheckRes;
    }
    let checkExistingInvestor = await db.ExistingInvestor.findOne({
        where: {
            id: interactionData.client_id
        }
    });
    if(!checkExistingInvestor) {
        let retOj = {status: 'error', messages: [' Existing investor id is invalid']};
        let errObj = {fieldName: 'client_id', message: retObj.messages[0]};
        retOj.data = {errObj: errObj};
        return retObj;
    }
    if(checkExistingInvestor.owner_employee_id != userData.id) {
        let retObj = {status: 'error', messages: [' Existing investor is not owned by user']};
        let errObj = {fieldName: 'client_id', message: retObj.messages[0]};
        retObj.data = {errObj: errObj};
        return retObj;
    }
    return {status: 'success', messages:[]};
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
    if(!interactionData.client_id) interactionData.client_id = req.params.id;
    console.log('create interaction for prospect, User data from req: ', userData.id);
    console.log('create interaction for prospect, going to call function with user and prospect data: ');
    let interactionRetData = await createInteractionForProspect(userData, interactionData);
    console.log('create interaction for prospect: returned data: ', interactionRetData);
    if(interactionRetData.status=='error') {
      res.json(interactionRetData);
      return;
    }
    // do a get so that decorated data is sent.
    let interactionGetRetData = await getInteractionById(interactionRetData.data.id);
    if(interactionGetRetData.status=='error') {
      res.json(interactionGetRetData);
      return;
    }
    interactionRetData.data = interactionGetRetData.data;
    res.json(interactionRetData);
    return;
  },
  async getInteractionById(req, res) {
    console.log('get interaction by id : going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let interactionId = req.params.id;
    let interactionRetData = await getInteractionById(interactionId);
    // if(interactionRetData.status=='error'){
    //   res.json(interactionRetData);
    //   return;
    // }
    // TODO: check if this interaction can be shown to the user... (owner check)
    res.json(interactionRetData);

  },

  async createInteractionForExistingInvestor(req, res) {
    console.log('create interaction for existing investor : going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let interactionData = req.body;
    if(!interactionData.client_id) interactionData.client_id = req.params.id;
    console.log('create interaction for existing investor, User data from req: ', userData.id);
    console.log('create interaction for existing investor, going to call function with user and existing investor data: ');
    let interactionRetData = await createInteractionForExistingInvestor(userData, interactionData);
    console.log('create interaction for existing investor: returned data: ', interactionRetData);
    if(interactionRetData.status=='error') {
      res.json(interactionRetData);
      return;
    }
    // do a get so that decorated data is sent.
    let interactionGetRetData = await getInteractionById(interactionRetData.data.id);
    if(interactionGetRetData.status=='error') {
      res.json(interactionGetRetData);
      return;
    }
    interactionRetData.data = interactionGetRetData.data;
    res.json(interactionRetData);
    return;
  },
}