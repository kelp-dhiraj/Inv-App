const { Prospect } = require('../models');
const db = require('../models');
const moment = require('moment');
//const sequelize = require('sequelize');
const utilCtl = require('./commonutils');
const auth = require('./authorizations');
const Op = db.Sequelize.Op;
const config = require('../config/config');
const uploadDirectory = require('../config/config').uploadDirectory;
const fs = require('fs');
const readline = require('readline');
const https = require('https');

async function getWCInputsFromReq(req) {
  let fieldsArr = [];
  let operationsArr = [];
  let valuesArr = [];
  if(fieldsArr.length==0&&req.query.state=='filtered') {
    fieldsArr = ['Prospect.id', 'owner_employee_id', 'prospect_name', 'owner.full_name', 'owner.email', 'owner.desg.lookup_value', 'owner->dept.lookup_value'];
    operationsArr = ['<=', '=', 'like', 'like', '=', 'like', 'like'];
    valuesArr = [2000, 3, 'GPD', 'surya', 'surya@tn.com', 'VP', 'Fin'];
  }
  
  // let fieldsArr = [];
  // let operationsArr = [];
  // let valuesArr = [];
  if(req.query.fields_list) fieldsArr = req.query.fields_list;
  if(req.query.operations_list) operationsArr = req.query.operations_list;
  if(req.query.values_list) valuesArr = req.query.values_list;
  if(fieldsArr.length!=operationsArr.length || fieldsArr.length!=valuesArr.length) {
    return {status: 'error', messages: ['Fields, operations and values do not tally, please contact support']};
  }
  return {status: 'success', messages:[], data: {fieldsArr: fieldsArr, operationsArr: operationsArr, valuesArr: valuesArr}};
}
async function getOrderByFromReq(req, fieldMasterObj) {
  let orderByField=null;
  let orderByDirection=null;
  console.log('order by field: ', req.query.order_by_field);
  if(req.query.order_by_field) {
    if(!fieldMasterObj[req.query.order_by_field]) {
      return {status: 'error', messages: ['Invalid field for order by, please contact support.']};
    }
    orderByField = req.query.order_by_field;
    if(!req.query.order_by_direction) orderByDirection = 'ASC';
    else orderByDirection = req.query.order_by_direction;
    console.log('order by direction: ', orderByDirection);
    if(orderByDirection!='ASC'&&orderByDirection!='DESC') {
      return {status: 'error', messages: ['Invalid value for order by direction, please contact support.']};
    }
  }
  let orderByObj = {order_by_field: req.query.order_by_field, order_by_direction: req.query.order_by_direction};
  console.log('Order by field: ', orderByField);
  let orderByArr = [];
  if(orderByField) {
    // final result is:
    // [{model: db.Employee, as: 'owner'}, {model: db.CommonListValue, as: 'dept'}, 'display_order', 'ASC']
    // arr[object, object, field_string, ASC/DESC_string]
    // if(fieldMasterObj[orderByField]['model']!='') {
    //   orderByArr.push({model: fieldMasterObj[orderByField]['model'], as: fieldMasterObj[orderByField]['alias']});
    // }
    // let orderByModels = fieldMasterObj[orderByField]['modelArr'];
    // orderByArr = orderByModels.map(e=>e);
    orderByArr = fieldMasterObj[orderByField]['modelArr'].map(e=>e);
    orderByFieldName = orderByField.split('.').reverse().shift();
    orderByArr.push(orderByFieldName);
    orderByArr.push(orderByDirection);
  }
  console.log('order by arr: ', orderByArr);
  //return {status: 'success', messages: [], data: orderByArr}
  return {status: 'success', messages: [], data: {orderByArr: orderByArr, orderByObj}}
}
async function convertFieldListObjToArr(fieldMasterObj) {
  let fieldListArr = [];
  await Object.keys(fieldMasterObj).forEach(fieldMasterObjKey => fieldListArr.push({
    dispName: fieldMasterObj[fieldMasterObjKey]['dispName']
    , fieldName: fieldMasterObjKey
    , dataType: fieldMasterObj[fieldMasterObjKey]['dataType']
  }));
  return fieldListArr;
}
async function constructWhereClause(fieldsArr, operationsArr, valuesArr, fieldMasterObj) {
  // this function is heavily dependent on the structure of the fieldMasterObj
  // example structure:
  /*
  let fieldListObj = {
      'id' : {dispName:'Prospect Id', dataType:'integer', model: '', alias: ''},
      'owner_employee_id' : {dispName:'Prospect Id', dataType:'integer', model:'', alias: ''},
      'owner.desg.lookup_value' : {dispName:'Owner Desg', dataType:'string', model:'db.CommonListValue'}
  }
  */
  console.log('construct where clause: fieldsArray: ', fieldsArr);
  let whereClauseInputArr = [];
  let whereClauseArr = [];
  let currFiltersArr = [];
  for (const field of fieldsArr) {
    let fieldIdx = fieldsArr.indexOf(field);
    let operation = operationsArr[fieldIdx];
    let value = valuesArr[fieldIdx];
    console.log(`field: ${field}, idx: ${fieldIdx}, operation: ${operation}, value: ${value}`);
    let wcObj = {field: field, op: operation, value: value}
    let wcOpValObj = await getWCOpVal(wcObj, fieldMasterObj[field]);
    //whereClauseInputArr.push({field: field, op: operation, value: value});
    if(wcOpValObj.status=='success') {
      whereClauseArr.push(db.sequelize.where(db.sequelize.col(field), wcOpValObj.data));
      currFiltersArr.push(wcObj);
    }
  }
  //return {status: 'success', messages: [], data: whereClauseArr};
  return {status: 'success', messages: [], data: {queryWcArr: whereClauseArr, currFiltersArr: currFiltersArr}};
  let whereClauseObj = {};
  errorFlag = false;
  errorMessagesArr = [];
  for (const wclause of whereClauseInputArr) {
    fieldObj = await createObjFromField(wclause);
    // above returns key = baseQuery or model-alias in 'a.b.c' format as the wcKey
    // it also returns a wc object that contains the final field name, operation and value
    // example: if a.b.c, = ,15 is sent in, it will return {wcKey: 'a.b', wc: {fieldName: 'c', op:'=', value:'15'}}
    // this just manipulates the array, should not have a return structure.. no errors should come here.
    //console.log(`create obj for field: ${wclause.field}, obj: `, fieldObj);
    wclause.wcObj = fieldObj;
    let actualWC = {};
    if(fieldMasterObj[wclause.field]) {
      // this will return a structure with status: success|error, messages and data
      // if success data will have the proper where clause
      // proper whereclause is: {fieldName: 'c', wcVal:{[Op.xx]:value}}
      // the reason for this format is that these are first pushed into an array for the model-alias object
      // the array inside the model-alias  will be then converted to an object using the field key
      actualWCRes = await constructWhereClauseSyntax(fieldObj.wc, fieldMasterObj[wclause.field]);
      //console.log('Actual WC is: ', actualWCRes);
      if(actualWCRes.status=='error') {
        errorFlag=true;
        // spread the messages.. do not create array or array
        errorMessages.push(...actualWCRes.messages);
      } else {
        actualWC = actualWCRes.data;
      }
    }
    if(!whereClauseObj[fieldObj.wcKey]) {
      whereClauseObj[fieldObj.wcKey] = []
    }
    //console.log('Actual WC 2 is: ', actualWC);
    whereClauseObj[fieldObj.wcKey].push({rawObj: fieldObj.wc, actualWC: actualWC});
  }
  if(errorFlag) {
    return {status: 'error', messages: errorMessages, data: null}
  }
  //console.log('where clause inputs array: ', whereClauseInputArr);
  //return {status: 'success', messages: [], data: whereClauseInputArr};
  //console.log('whereClauseObj:', whereClauseObj);
  //Object.keys(whereClauseObj).forEach(modelKey => whereClauseObj[modelKey].map(e=>console.log(e)));
  return {status: 'success', messages: [], data: whereClauseObj};
}

async function getWCOpVal(wcFieldObj, fieldMasterElement){
  // if dataType is char, valid op are =, like
  // if dataType is Int, Number valid ops are =, !=, <, >, >=. <=
  // if dataType is Date valid ops are =, !=, <, >, >=. <=
  // if dataType is bool valid ops are =, != 
  // if op is = then out field : value, regardless of type
  // if op is != then field: {[Op.ne]:value}
  // if op is > then field: {[Op.gt]:value} etc
  // if op is >= then field: {[Op.gte]:value} etc
  // if dataType is date, check valid date using moment
  // if dataType is bool, check valid values are true / false
  // can we use typeOf
  // TODO: above stuff.. also, check that field, operation, value are not null and not blank..
  console.log('getWCOpVal field obj: ', wcFieldObj);
  console.log('getWCOpVal field master element: ', fieldMasterElement);
  if(!fieldMasterElement) return {status: 'error', messages: [], data: null};
  let a = {};
  // in the new construct db.sequelize.where(seq.col(), b)
  let b = {};
  if(wcFieldObj.op=='=') {
    //a[wcFieldObj.field] ={[Op.eq]: wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.eq]: wcFieldObj.value}};
    b = {[Op.eq]: wcFieldObj.value};
  } else if(wcFieldObj.op=='!=') {
    //a[wcFieldObj.field] = {[Op.ne]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.ne]: wcFieldObj.value}};
    b = {[Op.ne]: wcFieldObj.value};
  } else if(wcFieldObj.op=='<') {
    //a[wcFieldObj.field] = {[Op.lt]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.lt]: wcFieldObj.value}};
    b = {[Op.lt]: wcFieldObj.value};
  } else if(wcFieldObj.op=='<=') {
    //a[wcFieldObj.field] = {[Op.lte]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.lte]: wcFieldObj.value}};
    b = {[Op.lte]: wcFieldObj.value};
  } else if(wcFieldObj.op=='>') {
    //a[wcFieldObj.field] = {[Op.gt]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.gt]: wcFieldObj.value}};
    b = {[Op.gt]: wcFieldObj.value};
  } else if(wcFieldObj.op=='>=') {
    //a[wcFieldObj.field] = {[Op.gte]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.gte]: wcFieldObj.value}};
    b = {[Op.gte]: wcFieldObj.value};
  } else if(wcFieldObj.op=='like') {
    //a[wcFieldObj.field] = {[Op.like]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.like]: wcFieldObj.value}};
    b = {[Op.iLike]: '%'+wcFieldObj.value+'%'};
  }
  //console.log('returning : ', a);
  //return {status: 'success', messages: [], data: a};
  console.log('going to return Obj b: ', b);
  return {status: 'success', messages: [], data: b};
}

async function convertWCArrToObj(wcArr, key, valKey) {
  let initObj = {};
  return wcArr.reduce((wcObj, ele)=>{
    return {
      ...wcObj,
      [ele[key]]:ele[valKey]
    };
  }, initObj);
}

module.exports = {
  async testGetAllProspectsForOrCond(req, res) {
    let fieldListObj = {
      'Prospect.id' : {dispName:'Prospect Id', dataType:'integer', modelArr: []},
      'owner_employee_id' : {dispName:'Prospect Id', dataType:'integer', modelArr: []},
      //'owner.desg.lookup_value' : {dispName:'Owner Desg', dataType:'string', model:'db.CommonListValue'},
      'prospect_name' : {dispName:'Prospect Name', dataType:'string', modelArr: []},
      'primary_office_city' : {dispName:'Primary Office',dataType:'string', modelArr: []},
      'region' : {dispName:'Region',dataType:'string', modelArr: []},
      'priority_code' : {dispName:'Priortity Code',dataType:'string', modelArr: []},
      'assessment_stage_code' : {dispName:'Assessment Stage Code',dataType:'string', modelArr: []},
      'category_code' : {dispName:'Category Code',dataType:'string', modelArr: []},
      'fund_raise_stage_code' : {dispName:'Fund Raise Stage code',dataType:'string', modelArr: []},
      'ticket_size' : {dispName:'Ticket Size',dataType:'number', modelArr: []},
      'owner.email' : {dispName:'Owner Email',dataType:'string', modelArr: [{model: db.Employee, as: 'owner'}]},
      'owner.full_name' : {dispName:'Owner Name',dataType:'string', modelArr: [{model: db.Employee, as: 'owner'}]},
      'owner.enabled' : {dispName:'Owner Enabled',dataType:'boolean', modelArr: [{model: db.Employee, as: 'owner'}]},
      'priority.lookup_value' : {dispName:'Priority Value',dataType:'string', modelArr: [{model: db.CommonListValue, as: 'priority'}]},
      'lookup_description' : {dispName:'Priority Desc',dataType:'string', modelArr: [{model: db.CommonListValue, as: 'priority'}]},
      'priority.enabled' : {dispName:'Priority Enabled',dataType:'boolean', modelArr: [{model: db.CommonListValue, as: 'priority'}]},
      'priority.display_order' : {dispName:'Priority Disp Order',dataType:'integer', modelArr: [{model: db.CommonListValue, as: 'priority'}]},
      'cat.lookup_value' : {dispName:'Category Value',dataType:'string', modelArr: [{model: db.CommonListValue, as: 'cat'}]},
      'cat.lookup_description' : {dispName:'Category Desc',dataType:'string', modelArr: [{model: db.CommonListValue, as: 'cat'}]},
      'cat.enabled' : {dispName:'Category Enabled',dataType:'boolean', modelArr: [{model: db.CommonListValue, as: 'cat'}]},
      'owner->dept.enabled' : {dispName:'Owner Dept En',dataType:'boolean', modelArr: [{model: db.Employee, as: 'owner'}, {model: db.CommonListValue, as: 'dept'}]},
      'owner->dept.lookup_value' : {dispName:'Owner Dept Value',dataType:'string', modelArr: [{model: db.Employee, as: 'owner'}, {model: db.CommonListValue, as: 'dept'}]},
      'owner->dept.display_order' : {dispName:'Owner Dept Disp',dataType:'integer', modelArr: [{model: db.Employee, as: 'owner'}, {model: db.CommonListValue, as: 'dept'}]}
    };
    let orderByRes = await getOrderByFromReq(req, fieldListObj);
    if(orderByRes.status=='error') {
      res.json(orderByRes);
      return;
    }
    let orderByArr = orderByRes.data.orderByArr;
    let orderByObj = orderByRes.data.orderByObj;
    if(orderByArr.length==0) {
      orderByObj = {order_by_field: 'prospect_name', order_by_direction: 'ASC'};
      orderByArr = [orderByObj.order_by_field, orderByObj.order_by_direction];
    }
    let fieldListArr = await convertFieldListObjToArr(fieldListObj);
    let wcInputsFromReqRes = await getWCInputsFromReq(req);
    if(wcInputsFromReqRes.status=='error') {
      res.json(wcInputsFromReqRes);
      return;
    }
    let fieldsArr = wcInputsFromReqRes.data.fieldsArr;
    let operationsArr = wcInputsFromReqRes.data.operationsArr;
    let valuesArr = wcInputsFromReqRes.data.valuesArr;
    // // already happening in function...
    // if(fieldsArr.length==0&&req.query.state=='filtered') {
    //   console.log('----###### ASSIGNING default where clause builers $$$$-----');
    //   fieldsArr = ['prospect.id', 'owner_employee_id', 'prospect_name', 'owner.full_name', 'owner.email', 'owner.desg.lookup_value'];
    //   operationsArr = ['<=', 'like', 'like', '=', '=', 'like'];
    //   valuesArr = [1, 3, 'gpd', 'surya', 'surya@tn.com', 'VP'];
    // }
    console.log(' Fields arr: ', fieldsArr);
    console.log(' Operations arr: ', operationsArr);
    console.log(' Values arr: ', valuesArr);
    whereClauseRes = await constructWhereClause(fieldsArr, operationsArr, valuesArr, fieldListObj);
    console.log('......----back from construct whereClause---....');
    if(whereClauseRes.status=='error') {
      res.json(whereClauseRes);
      return;
    }
    let conditionArr = whereClauseRes.data.queryWcArr;
    let currFiltersArr = whereClauseRes.data.currFiltersArr;
    console.log('----- conditionArr ----');
    console.log(conditionArr);
    // Object.keys(whereClauseRes.data).forEach(modelKey => whereClauseRes.data[modelKey].map(e=>{console.log(e.actualWC);}));
    // console.log('hey...1');
    // finalWC = {};
    // for (const modelKey of Object.keys(whereClauseRes.data)) {
    //   finalWC[modelKey] = await convertWCArrToObj(whereClauseRes.data[modelKey].map(e=>e.actualWC), 'fieldName', 'wcVal');
    // }
    // for method 2...
    finalWC = {};
    //console.log('finalWC obj: ', finalWC);
    // lastly, the finalWC will have the requried where clauses inserted from code..
    if(!finalWC['priority']) finalWC['priority'] = {};
    finalWC['priority']['list_code'] = 'PRIORITY_CODES';
    if(!finalWC.cat) finalWC.cat = {};
    finalWC.cat.list_code = 'CATEGORY_CODES';
    if(!finalWC['asses_stg']) finalWC['asses_stg'] = {};
    finalWC['asses_stg']['list_code'] = 'ASSESSMENT_STAGE_CODES';
    if(!finalWC['fund_stg']) finalWC['fund_stg'] = {};
    finalWC['fund_stg']['list_code'] = 'FUND_RAISE_STAGE_CODES';

    console.log('finalWC obj with mandatory WCs: ', finalWC);

    //let fieldListObjKeys = 
    let includeArr = [
      {
        model: db.Employee
        , as: 'owner'
        , attributes: ['email', 'full_name','enabled']
        , where: finalWC['owner']?finalWC['owner']:{}
        , include:[
          {
            model: db.CommonListValue
            , as: 'dept'
            , attributes: ['lookup_value', 'lookup_description','enabled', 'display_order']
            , where: {list_code: 'DEPT'}
            , required: false
          }
        ]
      },
      {
        model: db.CommonListValue
        , attributes: ['lookup_value', 'lookup_description','enabled', 'display_order']
        , as: 'priority'
        , required: false
        //, where: {list_code: 'PRIORITY_CODES'}
        , where: finalWC['priority']?finalWC['priority']:{}
      },
      {
        model: db.CommonListValue
        , attributes: ['lookup_value', 'lookup_description','enabled', 'display_order']
        , as: 'cat'
        , required: false
        //, where: {list_code: 'CATEGORY_CODES'}
        , where: finalWC['cat']?finalWC['cat']:{}
      },
      {
        model: db.CommonListValue
        , attributes: ['lookup_value', 'lookup_description','enabled', 'display_order']
        , as: 'asses_stg'
        , required: false
        //, where: {list_code: 'ASSESSMENT_STAGE_CODES'}
        , where: finalWC['asses_stg']?finalWC['asses_stg']:{}
      },
      {
        model: db.CommonListValue
        , attributes: ['lookup_value', 'lookup_description','enabled', 'display_order']
        , as: 'fund_stg'
        , required: false
        //, where: {list_code: 'FUND_RAISE_STAGE_CODES'}
        , where: finalWC['fund_stg']?finalWC['fund_stg']:{}
      },
    ];
    // let conditionArr = [];
    // conditionArr.push(db.sequelize.where(db.sequelize.col('owner_employee_id'), {[Op.gt]:0}));
    // conditionArr.push(db.sequelize.where(db.sequelize.col('prospect_name'), {[Op.iLike]:'%GPD%'}));
    // conditionArr.push(db.sequelize.where(db.sequelize.col('owner.full_name'), {[Op.iLike]:'%surya%'}));
    // conditionArr.push(db.sequelize.where(db.sequelize.col('cat.display_order'), {[Op.gte]:1}));
    console.log('Going to execute query...');
    let prospects = await db.Prospect.findAll({
      attributes: [
        'id', 'prospect_name', 'primary_office_city', 'region'
        , 'priority_code', 'assessment_stage_code', 'category_code'
        , 'fund_raise_stage_code', 'ticket_size', 'owner_employee_id'
      ]
      , include: includeArr
      , where: {
        [req.query.and_or_value=='or'?Op.or:Op.and]:conditionArr
      }
      , limit: 3
      , order: [orderByArr]
      //, order: [[{model: db.Employee, as: 'owner'}, {model: db.CommonListValue, as: 'dept'}, 'display_order', 'ASC']]
    });
    let oneProspect = {};
    let prospectfieldKeys = [];
    console.log(`----8888-- prospect length: ${prospects.length} ----8888----`);    
    prospectsArr = [];
    prospectsArr = prospects;
    res.json({status: 'success', messages: [], data: { prospects: prospectsArr
                                                      , fileList: fieldListArr
                                                      , filterArrObj: {
                                                          fielsArr:fieldsArr
                                                          , operationsArr: operationsArr
                                                          , valuesArr: valuesArr
                                                        }
                                                      , andOrValue: req.query.and_or_value
                                                      , orderBy: orderByObj
                                                      , currentFilters: currFiltersArr
                                                      //, orderBy: orderByArr
                                                      , whereClause: conditionArr}});
  },
};