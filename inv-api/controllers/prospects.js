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
  let fieldsArr = ['id', 'owner_employee_id', 'prospect_name', 'owner.full_name', 'owner.email', 'owner.desg.lookup_value'];
  let operationsArr = ['<=', '=', 'like', 'like', '=', 'like'];
  let valuesArr = [20, 3, 'GPD', 'surya', 'surya@tn.com', 'VP'];
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
  console.log('Order by field: ', orderByField);
  let orderByArr = [];
  if(orderByField) {
    if(fieldMasterObj[orderByField]['model']!='') {
      orderByArr.push({model: fieldMasterObj[orderByField]['model'], as: fieldMasterObj[orderByField]['alias']});
    }
    orderByFieldName = orderByField.split('.').reverse().shift();
    orderByArr.push(orderByFieldName);
    orderByArr.push(orderByDirection);
  }
  console.log('order by arr: ', orderByArr);
  return {status: 'success', messages: [], data: orderByArr}
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
  // let fieldsArr = req.field_arr;
  // let valuesArr = req.values_arr;
  let whereClauseInputArr = [];
  for (const field of fieldsArr) {
    let fieldIdx = fieldsArr.indexOf(field);
    let operation = operationsArr[fieldIdx];
    let value = valuesArr[fieldIdx];
    //console.log(`field: ${field}, idx: ${fieldIdx}, operation: ${operation}, value: ${value}`);
    whereClauseInputArr.push({field: field, op: operation, value: value});
  }
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

async function constructWhereClauseSyntax(wcFieldObj, fieldMasterObj){
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
  //console.log('field obj: ', wcFieldObj);
  let a = {};
  if(wcFieldObj.op=='=') {
    //a[wcFieldObj.field] ={[Op.eq]: wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.eq]: wcFieldObj.value}}
  } else if(wcFieldObj.op=='!=') {
    //a[wcFieldObj.field] = {[Op.ne]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.ne]: wcFieldObj.value}}
  } else if(wcFieldObj.op=='<') {
    //a[wcFieldObj.field] = {[Op.lt]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.lt]: wcFieldObj.value}}
  } else if(wcFieldObj.op=='<=') {
    //a[wcFieldObj.field] = {[Op.lte]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.lte]: wcFieldObj.value}}
  } else if(wcFieldObj.op=='>') {
    //a[wcFieldObj.field] = {[Op.gt]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.gt]: wcFieldObj.value}}
  } else if(wcFieldObj.op=='>=') {
    //a[wcFieldObj.field] = {[Op.gte]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.gte]: wcFieldObj.value}}
  } else if(wcFieldObj.op=='like') {
    //a[wcFieldObj.field] = {[Op.like]:wcFieldObj.value};
    a = {fieldName: wcFieldObj.field, wcVal:{[Op.like]: wcFieldObj.value}}
  }
  //console.log('returning : ', a);
  return {status: 'success', messages: [], data: a};
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

// note that the call has changed, do not use the new call for this as it sends obj
async function createObjFromFieldRecursive(field) {
  let arr = field.split('.');
  if(arr.length==1) {
    console.log(`passed value: ${field}, last level reached, return final level obj`);
    return {wcField: field};
  }
  let shiftedLevel = arr.shift();
  let remainingField = arr.join('.');
  console.log(`passed value: ${field}, this is not final level, recursive call using ${remainingField}`);
  res = await createObjFromFieldRecursive(remainingField);
  console.log(`returned from call for ${shiftedLevel}, obj returned: `, res);
  let a = {};
  a[shiftedLevel] = res;
  return a;
}

async function createObjFromField(wcObj) {
  let field = wcObj.field;
  let arr = field.split('.');
  arr.reverse();
  let fieldName = arr.shift();
  let remainingField = arr.reverse().join('.');
  //console.log(`passed value: ${field}, key: ${remainingField}, val: ${fieldName}`);
  let a ={};
  if(remainingField=='') remainingField = 'baseQuery';
  // a[remainingField] = {field: fieldName, op: wcObj.op, value: wcObj.value};
  // console.log('a: ', a);
  // return a;
  return {wcKey: remainingField, wc: {field: fieldName, op: wcObj.op, value: wcObj.value} }
}

function getProspects(req, res) {
  //we can filter data later as needed 
  //for now sending all prospects available in db
  Prospect.findAll().then((prospects) => {
    res.json({
      status: 'success',
      messages: [],
      data: prospects
    });
  }).catch(error => {
    res.json({
      status: 'error',
      messages: [error.message || 'Error while fetching Prospects'],
      data: []
    });
  });

}

async function getProspectNames(ownerUserId) {
  if(ownerUserId=='') {
    return {status: 'error', messages: ['Owner User Id is mandatory to get prospect names'], data: null}
  }
  // TODO: order by name..
  let prospects = await db.Prospect.findAll({
    attributes: ['id', 'prospect_name', 'primary_office_city', 'region']
    , where: {owner_employee_id: ownerUserId}
  });
  return {status: 'success', messages: [], data: prospects};
}

async function getProspectById(userData, prospectId) {
  if(!userData || !userData.id || userData.id == '') {
    return {status: 'error', messages: ['Owner User is mandatory to get prospect data'], data: null}
  }
  let prospect = await db.Prospect.findOne({
    where: {owner_employee_id: userData.id
            , id: prospectId
          }
    , include: [
      {
        model: db.Employee
        , as: 'owner'
      },
      {
        model: db.CommonListValue
        , as: 'priority'
        , required: false
        , where: {list_code: 'PRIORITY_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'cat'
        , required: false
        , where: {list_code: 'CATEGORY_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'asses_stg'
        , required: false
        , where: {list_code: 'ASSESSMENT_STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'fund_stg'
        , required: false
        , where: {list_code: 'FUND_RAISE_STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'india_alloc'
        , required: false
        , where: {list_code: 'INDIA_ALLOC_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'india_align'
        , required: false
        , where: {list_code: 'STRATEGIC_INDIA_ALIGN_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'tn_bias'
        , required: false
        , where: {list_code: 'TN_TRACK_RECORD_BIAS_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'advocate'
        , required: false
        , where: {list_code: 'SENIOR_ADVOCATE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'surprise'
        , required: false
        , where: {list_code: 'POSITIVE_NEGATIVE_SURPRISE_CODES'}
      },
      {
        model: db.Interaction
        , as: 'interactions'
        , required: false
        , where: {client_type_code: 'PROSPECT'}
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
      }
    ]
  });
  if(!prospect) {
    return {status: 'error', messages: [`Invalid prospect id ${prospectId} for user: ${userData.id}`], data: null}
  }
  return {status: 'success', messages: [], data: prospect};
}

async function getAllProspectsDashboard(userData, allFlag) {
  if(!userData || !userData.id || userData.id == '') {
    return {status: 'error', messages: ['Owner User is mandatory to get prospect data'], data: null}
  }
  // initialize:
  let result = {
    prospect_universe: {
      label: "Prospect Universe"
      , table_heading_array:[
        {position: 0, label: "Category (Gross)"},
        {position: 1, label: "#"}
        //, {position: 2, label: "$M"}
      ]
      , row_keys_array: []
      //, row_keys_obj_array: []
      , data_obj: {}
    },
    investor_qualification: {
      label: "Investor Qualification"
      , table_heading_array:[
        {position: 0, label: "# of LPs (Prospects Only)"},
        {position: 1, label: "#"},
        {position: 2, label: "$M"}
      ]
      , row_keys_array: []
      //, row_keys_obj_array: []
      , data_obj: {}
    },
    /*
    qualified_pipeline: {
      label: "Qualified Pipeline (Gross)"
      , table_heading_array:[
        {position: 0, label: "Likelihood Index Breakdown"},
        {position: 1, label: "#"},
        {position: 2, label: "$M"}
      ]
      , row_keys_array: []
      , data_obj: {}
    },
    */
    investors_by_stage: {
      label: "Investors by Stage"
      , table_heading_array:[
        {position: 0, label: "Category"},
        {position: 1, label: "#"},
        {position: 2, label: "$M"}
      ]
      , row_keys_array: []
      //, row_keys_obj_array: []
      , data_obj: {}
    },
    qualified_pipeline: {
      label: "Qualified Pipeline (Gross)"
      , table_heading_array:[
        {position: 0, label: "Likelihood Index breakdown"},
        {position: 1, label: "#"},
        {position: 2, label: "$M"}
      ]
      //, row_keys_array: ['LT40PCT', 'F40TO49PCT', 'F50TO59PCT', 'F60TO74PCT', 'GTE75PCT']
      //, row_keys_array: ['LT40PCT', 'F40TO49PCT', 'F50TO59PCT', 'F60TO74PCT', 'GTE75PCT']
      , row_keys_array: ['EQ0PCT', 'LT40PCT', 'F40TO49PCT', 'F50TO59PCT', 'F60TO74PCT', 'GTE75PCT']
      , data_obj: {
        'EQ0PCT': {0: '0%', 1: 0, 2: 0, low: -100, high: 0, fontColour: 'red'}
        , 'LT40PCT': {0: '<40%', 1: 0, 2: 0, low: 1, high: 39, fontColour: 'red'}
        , 'F40TO49PCT': {0: '<50%', 1: 0, 2: 0, low: 40, high: 49, fontColour: 'red'}
        , 'F50TO59PCT': {0: '<60%', 1: 0, 2: 0, low: 50, high: 59, fontColour: 'red'}
        , 'F60TO74PCT': {0: '<75%', 1: 0, 2: 0, low: 60, high: 74, fontColour: 'green'}
        , 'GTE75PCT': {0: '75% or More', 1: 0, 2: 0, low: 75, high: 9999, fontColour: 'red'}
      }
    },
    activity_levels: {
      label: "Activity Levels"
      , table_heading_array:[
        {position: 0, label: ""},
        {position: 1, label: "IR Team"},
        {position: 2, label: "Deal Team"},
        {position: 3, label: "Roadshows"},
        {position: 4, label: "Onsites"},
      ]
      , row_keys_array: []
      , data_obj: {}
    },
    coverage_levels: {
      label: "Coverage Levels"
      , table_heading_array:[
        {position: 0, label: ""},
        {position: 1, label: "#"},
        {position: 2, label: "% (# of investors)"},
        {position: 3, label: "$M"},
        {position: 4, label: "% Covered"},
      ]
      , row_keys_array: []
      //, row_keys_obj_array: []
      , data_obj: {}
    },
    investors_by_fund: {
      label: "Investors by Fund"
      , table_heading_array:[
        {position: 0, label: "Fund"},
        {position: 1, label: "#"},
        {position: 2, label: "$M"}
      ]
      //, row_keys_array: ['GTE75PCT', 'F60TO74PCT']
      , row_keys_array: [{key:'GTE75PCT', order: 1}, {key: 'F60TO74PCT', order: 2}]
      , data_obj: {}
    },
  }
  let whereClause = {};
  if(!allFlag) {
    whereClause = {owner_employee_id: userData.id};
  }
  let prospects = await db.Prospect.findAll({
    where: whereClause
    , include: [
      {
        model: db.Employee
        , as: 'owner'
      },
      {
        model: db.CommonListValue
        , as: 'priority'
        , required: false
        , where: {list_code: 'PRIORITY_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'cat'
        , required: false
        , where: {list_code: 'CATEGORY_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'asses_stg'
        , required: false
        , where: {list_code: 'ASSESSMENT_STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'fund_stg'
        , required: false
        , where: {list_code: 'FUND_RAISE_STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'india_alloc'
        , required: false
        , where: {list_code: 'INDIA_ALLOC_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'india_align'
        , required: false
        , where: {list_code: 'STRATEGIC_INDIA_ALIGN_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'tn_bias'
        , required: false
        , where: {list_code: 'TN_TRACK_RECORD_BIAS_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'advocate'
        , required: false
        , where: {list_code: 'SENIOR_ADVOCATE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'surprise'
        , required: false
        , where: {list_code: 'POSITIVE_NEGATIVE_SURPRISE_CODES'}
      },
      {
        model: db.Interaction
        , as: 'interactions'
        , required: false
        , where: {
          client_type_code: 'PROSPECT'
          , interaction_date: {[Op.gte]:moment().startOf('quarter')}
        }
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
      }
    ]
    , order: [[{model: db.CommonListValue, as: 'cat'}, 'display_order']
            // there is no need to add multiple order by as we doing a single loop no point doing more than one order by
            // , [{model: db.CommonListValue, as: 'priority'}, 'display_order']
            // , [{model: db.CommonListValue, as: 'fund_stg'}, 'display_order']
          ]
  });
  if(prospects.length==0) {
    return {status: 'error', messages: [`No prspect data..`], data: null};
  }
  let allProspectsTotalRelScore = 0;
  let countProspects = 0;
  let countCoveredProspects = 0;
  console.log('result qualified pipeline: ', result.qualified_pipeline);
  console.log('result qualified pipeline.data_obj: ', result.qualified_pipeline.data_obj);
  for (const prospect of prospects) {
    countProspects++;
    // find the total liklihood score..
    let prospectTotRelScore = Number(prospect.india_allocation_code)+Number(prospect.strategic_india_alignment_code)+Number(prospect.tn_track_record_bias_code)+Number(prospect.senior_advocate_code)+Number(prospect.positive_negative_surprise_code);
    allProspectsTotalRelScore += prospectTotRelScore;
    //console.log(`prospect id: ${prospect.id}, India alloc: ${prospect.india_allocation_code}, strat align: ${prospect.strategic_india_alignment_code}, trac rec bias: ${prospect.tn_track_record_bias_code}, senior advocate: ${prospect.senior_advocate_code}, surprise: ${prospect.positive_negative_surprise_code} `);
    //console.log(`prospect total: ${prospectTotRelScore}, total rel score: ${allProspectsTotalRelScore}`);
    for (const qualPipeKey of result.qualified_pipeline.row_keys_array) {
      //console.log(`   looping for qual pipe low: ${result.qualified_pipeline.data_obj[qualPipeKey]["low"]}, high: ${result.qualified_pipeline.data_obj[qualPipeKey]["high"]} curr count: ${result.qualified_pipeline.data_obj[qualPipeKey][1]}, curr ticket size: ${result.qualified_pipeline.data_obj[qualPipeKey][2]}`);
      if(result.qualified_pipeline.data_obj[qualPipeKey]["low"]<=prospectTotRelScore && result.qualified_pipeline.data_obj[qualPipeKey]["high"]>=prospectTotRelScore) {
        result.qualified_pipeline.data_obj[qualPipeKey][1]++;
        result.qualified_pipeline.data_obj[qualPipeKey][2]+= Number(prospect.ticket_size);
        //console.log(`Added count: ${result.qualified_pipeline.data_obj[qualPipeKey][1]}, ticket size: ${result.qualified_pipeline.data_obj[qualPipeKey][2]}`);
        break;
      }
    }
    if(prospect.category_code!='') {
      // no need to object this as no need to sort, as this is in the order by
      if(!result.prospect_universe.row_keys_array.find(e=>e==prospect.category_code)) result.prospect_universe.row_keys_array.push(prospect.category_code);
      //if(!result.prospect_universe.row_keys_array.find(e=>e==prospect.category_code)) result.prospect_universe.row_keys_array.push({key: prospect.category_code, order: prospect.cat?prospect.cat.display_order:99});
      //if(!result.prospect_universe.data_obj[prospect.category_code]) result.prospect_universe.data_obj[prospect.category_code] = {0: prospect.cat?prospect.cat.lookup_value:"Undefined", 1: 1, 2: Number(prospect.ticket_size!=''?prospect.ticket_size:0)};
      if(!result.prospect_universe.data_obj[prospect.category_code]) result.prospect_universe.data_obj[prospect.category_code] = {0: prospect.cat?prospect.cat.lookup_value:"Undefined", 1: 1};
      else {
        result.prospect_universe.data_obj[prospect.category_code][1]++;
        //result.prospect_universe.data_obj[prospect.category_code][2]+=Number(prospect.ticket_size!=''?prospect.ticket_size:0);
      }
    }
    if(prospect.assessment_stage_code!= '') {
      //if(!result.investor_qualification.row_keys_array.find(e=>e==prospect.assessment_stage_code)) result.investor_qualification.row_keys_array.push(prospect.assessment_stage_code);
      if(!result.investor_qualification.row_keys_array.find(e=>e.key==prospect.assessment_stage_code)) result.investor_qualification.row_keys_array.push({key: prospect.assessment_stage_code, order: prospect.asses_stg?prospect.asses_stg.display_order:99});
      if(!result.investor_qualification.data_obj[prospect.assessment_stage_code]) result.investor_qualification.data_obj[prospect.assessment_stage_code] = {0: prospect.asses_stg?prospect.asses_stg.lookup_value:"Undefined", 1: 1, 2: Number(prospect.ticket_size!=''?prospect.ticket_size:0)};
      else {
        result.investor_qualification.data_obj[prospect.assessment_stage_code][1]++;
        result.investor_qualification.data_obj[prospect.assessment_stage_code][2]+=Number(prospect.ticket_size!=''?prospect.ticket_size:0);
      }
    }
    if(prospect.fund_raise_stage_code!= '') {
      //if(!result.investors_by_stage.row_keys_array.find(e=>e==prospect.fund_raise_stage_code)) result.investors_by_stage.row_keys_array.push(prospect.fund_raise_stage_code);
      if(!result.investors_by_stage.row_keys_array.find(e=>e.key==prospect.fund_raise_stage_code)) result.investors_by_stage.row_keys_array.push({key: prospect.fund_raise_stage_code, order: prospect.fund_stg?prospect.fund_stg.display_order:99});
      if(!result.investors_by_stage.data_obj[prospect.fund_raise_stage_code]) result.investors_by_stage.data_obj[prospect.fund_raise_stage_code] = {0: prospect.fund_stg?prospect.fund_stg.lookup_value:"Undefined", 1: 1, 2: Number(prospect.ticket_size!=''?prospect.ticket_size:0)};
      else {
        result.investors_by_stage.data_obj[prospect.fund_raise_stage_code][1]++;
        result.investors_by_stage.data_obj[prospect.fund_raise_stage_code][2]+=Number(prospect.ticket_size!=''?prospect.ticket_size:0);
      }
    }

    priortyFlag = false;
    if(prospect.priority_code!='') {
      priortyFlag = true;
      //if(!result.activity_levels.row_keys_array.find(e=>e==prospect.priority_code)) {
      if(!result.activity_levels.row_keys_array.find(e=>e.key==prospect.priority_code)) {
        //result.activity_levels.row_keys_array.push(prospect.priority_code);
        result.activity_levels.row_keys_array.push({key: prospect.priority_code, order: prospect.priority?prospect.priority.display_order:99});
        result.activity_levels.data_obj[prospect.priority_code] ={0: prospect.priority?prospect.priority.lookup_value:"Undefined", 1: 0, 2: 0, 3:0, 4:0};
      }
      //if(!result.coverage_levels.row_keys_array.find(e=>e==prospect.priority_code)) {
      if(!result.coverage_levels.row_keys_array.find(e=>e.key==prospect.priority_code)) {
        //result.coverage_levels.row_keys_array.push(prospect.priority_code);
        result.coverage_levels.row_keys_array.push({key: prospect.priority_code, order: prospect.priority?prospect.priority.display_order:99});
        result.coverage_levels.data_obj[prospect.priority_code] ={0: prospect.priority?prospect.priority.lookup_value:"Undefined", 1: 1, 2: 0, 3:Number(prospect.ticket_size), 4:0, 5:0};
      } else {
        result.coverage_levels.data_obj[prospect.priority_code][1]++;
        result.coverage_levels.data_obj[prospect.priority_code][3]+= Number(prospect.ticket_size);
        // // guru 8-Jun-2020, defect - running calc will be correct only for the last one.
        // result.coverage_levels.data_obj[prospect.priority_code][2]=result.coverage_levels.data_obj[prospect.priority_code][1]/countProspects;
        // result.coverage_levels.data_obj[prospect.priority_code][2] = Math.round(result.coverage_levels.data_obj[prospect.priority_code][2]*100)+'%';
      }
    }
    //console.log(`prospect: ${prospect.id}, priority_code: ${prospect.priority_code}, priority flag: ${priortyFlag}, interaction count: ${prospect.interactions.length}`);
    if(prospect.interactions.length>0) {
      countCoveredProspects++;
      if(priortyFlag) {
        // covered %
        result.coverage_levels.data_obj[prospect.priority_code][4] = countCoveredProspects/result.coverage_levels.data_obj[prospect.priority_code][1];
        result.coverage_levels.data_obj[prospect.priority_code][4] = Math.round(result.coverage_levels.data_obj[prospect.priority_code][4]*100)+'%';
        result.coverage_levels.data_obj[prospect.priority_code][5]++;
      }
      for (const interaction of prospect.interactions) {
        if(priortyFlag) {
          if(interaction.team_code=='IR') result.activity_levels.data_obj[prospect.priority_code][1]++;
          if(interaction.team_code=='DT') result.activity_levels.data_obj[prospect.priority_code][2]++;
          if(interaction.interaction_type_code=='DT_ROADSHOW_VCS') result.activity_levels.data_obj[prospect.priority_code][3]++;
          if(interaction.interaction_type_code=='DT_SITE_VISIT') result.activity_levels.data_obj[prospect.priority_code][4]++;
        }
      }
      
    }
  }
  // guru 8-Jun-2020, covarage_level %age needs to be done here outside the loop.
  console.log('row key array of coverage levels: ', result.coverage_levels.row_keys_array);
  console.log('result.coverage_levels.dataObj: ', result.coverage_levels.data_obj);
  console.log(`total covered prospects: ${countCoveredProspects}`);
  for (const coverageRow of result.coverage_levels.row_keys_array) {
    console.log('row key: ', coverageRow);
    //console.log(`--------- computing coverage level for priority code: ${prospect.priority_code}----`); // has error
    //console.log(`--------- computing coverage level 4 as 2 / 1: ${prospect.priority_code}, count coveredPropects`)
    result.coverage_levels.data_obj[coverageRow.key][2] = result.coverage_levels.data_obj[coverageRow.key][1]/countProspects;
    result.coverage_levels.data_obj[coverageRow.key][2] = Math.round(result.coverage_levels.data_obj[coverageRow.key][2]*100)+'%';

    //result.coverage_levels.data_obj[coverageRow.key][4] = countCoveredProspects/result.coverage_levels.data_obj[coverageRow.key][1];
    result.coverage_levels.data_obj[coverageRow.key][4] = result.coverage_levels.data_obj[coverageRow.key][5]/result.coverage_levels.data_obj[coverageRow.key][1];
    result.coverage_levels.data_obj[coverageRow.key][4] = Math.round(result.coverage_levels.data_obj[coverageRow.key][4]*100)+'%';
  }

  result.investors_by_fund.data_obj['GTE75PCT'] = result.qualified_pipeline.data_obj['GTE75PCT'];
  result.investors_by_fund.data_obj['F60TO74PCT'] = result.qualified_pipeline.data_obj['F60TO74PCT'];
  let existingInvestors = await db.ExistingInvestor.findAll({
    where: {fund_code: {[Op.ne]:null}}
    , include: [
      {
        model: db.CommonListValue
        , as: 'fund'
        , where: {list_code: 'FUND_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'fund_raise_stg'
        , required: false
        , where: {list_code: 'FUND_RAISE_STAGE_CODES'}
      }
    ]
  });
  for (const investor of existingInvestors) {
    //if(!result.investors_by_fund.row_keys_array.find(e=>e==investor.fund_code)) result.investors_by_fund.row_keys_array.push(investor.fund_code);
    if(!result.investors_by_fund.row_keys_array.find(e=>e.key==investor.fund_code)) result.investors_by_fund.row_keys_array.push({key: investor.fund_code, order: investor.fund?Number(investor.fund.display_order)+3:999});
    if(!result.investors_by_fund.data_obj[investor.fund_code]) result.investors_by_fund.data_obj[investor.fund_code] = {0: investor.fund?investor.fund.lookup_value:"Undefined", 1: 1, 2: Number(investor.ticket_size!=''?investor.ticket_size:0)};
    else {
      result.investors_by_fund.data_obj[investor.fund_code][1]++;
      result.investors_by_fund.data_obj[investor.fund_code][2]+=Number(investor.ticket_size!=''?investor.ticket_size:0);
    }
    if(investor.fund_raise_stage_code!='') {
      if(!result.investors_by_stage.row_keys_array.find(e=>e.key==investor.fund_raise_stage_code)) result.investors_by_stage.row_keys_array.push({key: investor.fund_raise_stage_code, order: investor.fund_raise_stg?investor.fund_raise_stg.display_order:99});
      if(!result.investors_by_stage.data_obj[investor.fund_raise_stage_code]) result.investors_by_stage.data_obj[investor.fund_raise_stage_code] = {0: investor.fund_raise_stg?investor.fund_raise_stg.lookup_value:"Undefined", 1: 1, 2: Number(investor.ticket_size!=''?investor.ticket_size:0)};
      else {
        result.investors_by_stage.data_obj[investor.fund_raise_stage_code][1]++;
        result.investors_by_stage.data_obj[investor.fund_raise_stage_code][2]+=Number(investor.ticket_size!=''?investor.ticket_size:0);
      }
    }
  }
  // sort investors_by_stage, investor_qualification, activity_levels, coverage_levels
  // no sort needed for prospect_universe
  function sortKeyObjArr(a, b) {if(a.order>b.order) return 1; if(a.order<b.order) return -1; return 0;}
  // console.log('result.investors_by_stage.row_keys_array before sort');
  // console.log(result.investors_by_stage.row_keys_array);
  result.investors_by_stage.row_keys_array.sort(sortKeyObjArr);
  // console.log('after sort');
  // console.log(result.investors_by_stage.row_keys_array);
  result.investors_by_stage.row_keys_array = result.investors_by_stage.row_keys_array.map(e=>e.key);
  // console.log('after map');
  // console.log(result.investors_by_stage.row_keys_array);
  result.investor_qualification.row_keys_array.sort(sortKeyObjArr);
  result.investor_qualification.row_keys_array = result.investor_qualification.row_keys_array.map(e=>e.key);
  result.activity_levels.row_keys_array.sort(sortKeyObjArr);
  result.activity_levels.row_keys_array = result.activity_levels.row_keys_array.map(e=>e.key);
  result.coverage_levels.row_keys_array.sort(sortKeyObjArr);
  result.coverage_levels.row_keys_array = result.coverage_levels.row_keys_array.map(e=>e.key);
  result.investors_by_fund.row_keys_array.sort(sortKeyObjArr);
  result.investors_by_fund.row_keys_array = result.investors_by_fund.row_keys_array.map(e=>e.key);
  return {status: "success", messages: [], data: result};
}

async function updateProspect(userData, prospectId, prospectData) {
  if(!userData || !userData.id || userData.id=='') {
    return {status: 'error', messages: ['Owner User Id is mandatory to create prospect'], data: null};
  }

  if(prospectId=='') {
    return {status: 'error', messages: ['Prospect id is mandatory for update'], data: null};
  }
  // find the prospect data for the id passed
  let prospect = await db.Prospect.findOne({
    where: {id: prospectId}
  });
  if(!prospect) {
    return {status: 'error', messages: ['Prospect id is invalid'], data: null};
  }
  // this check should be on the queried data..
  if(prospect.owner_employee_id != userData.id) {
    return {status: 'error', messages: ['This prospect does not belong to logged in user, update not possible'], data: null};
  }
  // TODO: validations need to be added...
  // only some fields can be updated..
  let dirtyFlag = false;
  let changeArr = [];
  if(prospectData.assessment_stage_code && (prospectData.assessment_stage_code != prospect.assessment_stage_code)) {
      changeArr.push({field:'assessment_stage_code',old:prospect.assessment_stage_code,new:prospectData.assessment_stage_code});
      prospect.assessment_stage_code = prospectData.assessment_stage_code; 
      dirtyFlag=true;
    }
  if(prospectData.fund_raise_stage_code && (prospectData.fund_raise_stage_code != prospect.fund_raise_stage_code)) {
      changeArr.push({field:'fund_raise_stage_code',old:prospect.fund_raise_stage_code,new:prospectData.fund_raise_stage_code});
      prospect.fund_raise_stage_code = prospectData.fund_raise_stage_code; 
      dirtyFlag=true;
    }
  if(prospectData.fund_raise_stage_comment && (prospectData.fund_raise_stage_comment != prospect.fund_raise_stage_comment)) {
      changeArr.push({field:'fund_raise_stage_comment',old:prospect.fund_raise_stage_comment,new:prospectData.fund_raise_stage_comment});
      prospect.fund_raise_stage_comment = prospectData.fund_raise_stage_comment; 
      dirtyFlag=true;
    }
  if(prospectData.ticket_size && (prospectData.ticket_size != prospect.ticket_size)) {
    changeArr.push({field:'ticket_size',old:prospect.ticket_size,new:prospectData.ticket_size});
    prospect.ticket_size= prospectData.ticket_size; 
    dirtyFlag=true;
  }
  if(prospectData.india_allocation_code && (prospectData.india_allocation_code != prospect.india_allocation_code)) {
    changeArr.push({field:'india_allocation_code',old:prospect.india_allocation_code,new:prospectData.india_allocation_code});
    prospect.india_allocation_code = prospectData.india_allocation_code; 
    dirtyFlag=true;
  }
  if(prospectData.india_allocation_comment && (prospectData.india_allocation_comment != prospect.india_allocation_comment)) {
    // guru 17-Nov-20, mistake in variable name changeArr fixed
    changeArr.push({field:'india_allocation_comment',old:prospect.india_allocation_comment,new:prospectData.india_allocation_comment});
    prospect.india_allocation_comment = prospectData.india_allocation_comment; 
    dirtyFlag=true;
  }
  if(prospectData.strategic_india_alignment_code && (prospectData.strategic_india_alignment_code != prospect.strategic_india_alignment_code)) {
    changeArr.push({field:'strategic_india_alignment_code',old:prospect.strategic_india_alignment_code,new:prospectData.strategic_india_alignment_code});
    prospect.strategic_india_alignment_code = prospectData.strategic_india_alignment_code; 
    dirtyFlag=true;
  }
  if(prospectData.strategic_india_alignment_comment && (prospectData.strategic_india_alignment_comment != prospect.strategic_india_alignment_comment)) {
    changeArr.push({field:'strategic_india_alignment_comment',old:prospect.strategic_india_alignment_comment,new:prospectData.strategic_india_alignment_comment});
    prospect.strategic_india_alignment_comment = prospectData.strategic_india_alignment_comment; 
    dirtyFlag=true;
  }
  if(prospectData.tn_track_record_bias_code && (prospectData.tn_track_record_bias_code != prospect.tn_track_record_bias_code)) {
    changeArr.push({field:'tn_track_record_bias_code',old:prospect.tn_track_record_bias_code,new:prospectData.tn_track_record_bias_code});
    prospect.tn_track_record_bias_code = prospectData.tn_track_record_bias_code; 
    dirtyFlag=true;
  }
  if(prospectData.tn_track_record_bias_comment && (prospectData.tn_track_record_bias_comment != prospect.tn_track_record_bias_comment)) {
    changeArr.push({field:'tn_track_record_bias_comment',old:prospect.tn_track_record_bias_comment,new:prospectData.tn_track_record_bias_comment});
    prospect.tn_track_record_bias_comment = prospectData.tn_track_record_bias_comment; 
    dirtyFlag=true;
  }
  if(prospectData.senior_advocate_code && (prospectData.senior_advocate_code != prospect.senior_advocate_code)) {
    changeArr.push({field:'senior_advocate_code',old:prospect.senior_advocate_code,new:prospectData.senior_advocate_code});
    prospect.senior_advocate_code = prospectData.senior_advocate_code; 
    dirtyFlag=true;
  }
  if(prospectData.senior_advocate_comment && (prospectData.senior_advocate_comment != prospect.senior_advocate_comment)) {
    changeArr.push({field:'senior_advocate_comment',old:prospect.senior_advocate_comment,new:prospectData.senior_advocate_comment});
    prospect.senior_advocate_comment = prospectData.senior_advocate_comment; 
    dirtyFlag=true;
  }
  if(prospectData.positive_negative_surprise_code && (prospectData.positive_negative_surprise_code != prospect.positive_negative_surprise_code)) {
    changeArr.push({field:'positive_negative_surprise_code',old:prospect.positive_negative_surprise_code,new:prospectData.positive_negative_surprise_code});
    prospect.positive_negative_surprise_code = prospectData.positive_negative_surprise_code; 
    dirtyFlag=true;
  }
  if(prospectData.positive_negative_surprise_comment && (prospectData.positive_negative_surprise_comment != prospect.positive_negative_surprise_comment)) {
    changeArr.push({field:'positive_negative_surprise_comment',old:prospect.positive_negative_surprise_comment,new:prospectData.positive_negative_surprise_comment});
    prospect.positive_negative_surprise_comment = prospectData.positive_negative_surprise_comment; 
    dirtyFlag=true;
  }

  if(dirtyFlag){
    changeArr.push({field:'updated_by',old:prospect.updated_by,new:userData.id});
    console.log('prospect update, something was changed, set updated by and save..');
    prospect.updated_by = userData.id;
    await prospect.save();
    await db.ProspectChangeLog.create({prospect_id:prospectId,change_json:changeArr,updated_by:userData.id});
  }
  else{
    console.log('Nothing to update...');
  }
  return {status: 'success', messages: [], data: prospect};  
}

async function createProspect(userData, prospectData) {
  if(!userData || !userData.id || userData.id=='') {
    return {status: 'error', messages: ['Owner User Id is mandatory to create prospect'], data: null}
  }
  
  // // owner cannot be initialized here any more as we do not know if this is called from screen or load.
  // // either owner_email has to be passed, or owner_employee_id, defaulting can be taken care of the caller.
  // if(!prospectData.owner_employee_id || prospectData.owner_employee_id =='') {
  //   prospectData.owner_employee_id = userData.id;
  // }
  let validatedFlag = true;
  let errors = [];
  let errorMessages = [];
  let errorFields = [];
  let errObj = {};
  let valRes;
  console.log(' prospect data to check owner employee id',prospectData.owner_email);
  console.log('create prospect fn: check prospect owner');
  valRes = await validateProspectOwner(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect owner error, exit');
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  // TODO: print the prospect data to check that owner_employee_id is available here..

  console.log('create prospect fn: check prospect name');
  valRes = await validateProspectName(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect name error, exit');
      //errObj = {fieldName: 'prospect_name', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect primary office');
  valRes = await validateProspectPrimaryOffice(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect primary office error, exit');
      //errObj = {fieldName: 'primary_office_city', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect region');
  valRes = await validateProspectRegion(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect primary region, exit');
      //errObj = {fieldName: 'region', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect priority');
  valRes = await validateProspectPriority(prospectData);
  console.log('back from validateProspectPriority, result: ', valRes);
  if(valRes.status=='error') {

      validatedFlag = false;
    
      console.log('create prospect fn: prospect priority, exit.');
      //errObj = {fieldName: 'priority_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);

      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect category');
  valRes = await validateProspectCategory(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect category, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect: check prospect assessment stage code');
  valRes = await validateProspectAssessmentStage(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect assessment stage code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect Fund stage code');
  valRes = await validateProspectFundRaiseStage(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect Fund stage code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect India Alloc code');
  valRes = await validateProspectIndiaAlloc(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect India alloc code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect statergic align code');
  valRes = await validateProspectStatergicIndiaAlloc(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect statergic align code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect TN track record bias code');
  valRes = await validateProspectTNBias(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect TN track record bias code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect Senior Advocate code');
  valRes = await validateProspectSeniorAdvocate(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect senior advocate code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create prospect fn: check prospect positive negative code');
  valRes = await validateProspectPosNegSurprise(prospectData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create prospect fn: prospect positive code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  if(!validatedFlag) {
    return {status: 'error', messages: errorMessages, data:{errorFields: errorFields, errorObjArr: errors}};
  }
  console.log('create prospect: All validations are passed, create the prospect now..');
  console.log('Revised data: ', prospectData);
  prospectData.created_by = userData.id;
  let prospect = await db.Prospect.create(prospectData);
  console.log('create prospect result: ', prospect)
  return {status: "success", messages: [], data: prospect};
}
async function validateProspectOwner(prospectData) {
  // check if owner_employee_id is passed, use it, check validity 
  // else check if owner_email is passed, use it, check validity, derive owner_employee_id from email
  if(prospectData.owner_email&&prospectData.owner_email!='') {
    let checkEmp = await db.Employee.findOne({
      where: {
        email: prospectData.owner_email
      }
    });
    if(!checkEmp) {
      let errObj = {fieldName: 'owner_email', message: 'Invalid Owner Email'};
      return {status: 'error', messages: ['Owner Employee'], data: {errObj: errObj}};
    }
    prospectData.owner_employee_id = checkEmp.id;
  }

  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(prospectData, 'owner_employee_id', 'Owner');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'owner_employee_id', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  
  return {status: 'success', messages: []};
}
async function validateProspectName(prospectData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(prospectData, 'prospect_name', 'Prospect Name');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'prospect_name', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  // check for duplicate:
  let checkProspect = await db.Prospect.findOne({
    where: {
        prospect_name: prospectData.prospect_name
      }
    });
    if(checkProspect) {
      let errObj = {fieldName: 'prospect_name', message: 'Duplicate Prospect'};
      return {status: 'error', messages: ['Duplicate Prospect'], data: {errObj: errObj}};
    }
    return {status: 'success', messages: []};
}
async function validateProspectPrimaryOffice(prospectData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(prospectData, 'primary_office_city', 'Primary Office or City');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'primary_office_city', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectRegion(prospectData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(prospectData, 'region', 'Region');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'region', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectPriority(prospectData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(prospectData, 'priority_code', 'Priority Code');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'priority_code', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  let checkCLVRes = await utilCtl.validateCLV(prospectData.priority_code, 'PRIORITY_CODES', 'Priority Code');
  console.log('back from validateCLV, result: ', checkCLVRes);
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'priority_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectCategory(prospectData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(prospectData, 'category_code', 'Category Code');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'prospect_name', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  let checkCLVRes = await utilCtl.validateCLV(prospectData.category_code, 'CATEGORY_CODES', 'Category Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'category_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectAssessmentStage(prospectData) {
  if(!prospectData.assessment_stage_code || prospectData.assessment_stage_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(prospectData.assessment_stage_code, 'ASSESSMENT_STAGE_CODES', 'Assessment Stage Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'category_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectFundRaiseStage(prospectData) {
  if(!prospectData.fund_raise_stage_code || prospectData.fund_raise_stage_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(prospectData.fund_raise_stage_code, 'FUND_RAISE_STAGE_CODES', 'Fund Raise Stage Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'category_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectIndiaAlloc(prospectData) {
  if(!prospectData.india_allocation_code || prospectData.india_allocation_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(prospectData.india_allocation_code, 'INDIA_ALLOC_CODES', 'India Allocation Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'india_allocation_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};  
}
async function validateProspectStatergicIndiaAlloc(prospectData) {
  if(!prospectData.strategic_india_alignment_code || prospectData.strategic_india_alignment_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(prospectData.strategic_india_alignment_code, 'STRATEGIC_INDIA_ALIGN_CODES', 'Statergic India Alignment Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'strategic_india_alignment_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectTNBias(prospectData) {
  if(!prospectData.tn_track_record_bias_code || prospectData.tn_track_record_bias_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(prospectData.tn_track_record_bias_code, 'TN_TRACK_RECORD_BIAS_CODES', 'TN Track Record Bias Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'tn_track_record_bias_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectSeniorAdvocate(prospectData) {
  if(!prospectData.senior_advocate_code || prospectData.senior_advocate_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(prospectData.senior_advocate_code, 'SENIOR_ADVOCATE_CODES', 'Senior Advocate Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'senior_advocate_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateProspectPosNegSurprise(prospectData) {
  if(!prospectData.positive_negative_surprise_code || prospectData.positive_negative_surprise_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(prospectData.positive_negative_surprise_code, 'POSITIVE_NEGATIVE_SURPRISE_CODES', 'Positve Negative Surprise Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'positive_negative_surprise_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
//pooja 19-May-2020 file upload and insert
async function readLinesFromFile(fullFileName) {
  console.log('In function readLinsFromFile...');
  return new Promise((resolve, reject) => {
      let fileLine = readline.createInterface({
          input: fs.createReadStream(fullFileName)
      });
      let linesArr = [];
      fileLine.on('line', (line) => {  console.log('In function 1...');
          console.log('Inside on line to push data is: ', line);
          linesArr.push(line);
      });
      fileLine.on('close', () => {  console.log('In function 2...');
          resolve({linesArr: linesArr});
      });
      fileLine.on('error', (err) => {  console.log('In function 3...');
          console.log(' cuaght error in fileLine on error..');
          reject(err);
      });
  });
}
async function processDataObjArr(dataObjArr, userData) {
  console.log('data obj array',dataObjArr);
  console.log('user data', userData);
  console.log('In process data obj..');
  if(!userData.id || userData.id=='') {
      return {status: 'error', messages:['Unable to find prospect info from logged in prospect, please contact support'], data: {}};
  }

  let prospectDataWithResultObjArr = [];
  for (const prospectDataObj of dataObjArr) {
      console.log(`process data loop for data: `, prospectDataObj);
      let retData = await createProspect(userData, prospectDataObj);
      let retDataObjPart;

      if(retData.status=='success') {
          //retDataObjPart = {prospect: retData.data.prospect, companyEmployeeRelative: retData.data.companyEmployeeRelative};
          //retDataObjPart = {userId: retData.data.prospect.id, empId: retData.data.companyEmployeeRelative.id, userUrl: config.hostForActivation+'/ia/'+retData.data.prospect.token};
          retDataObjPart = {prospectId: retData.data.id
                            , prospectName: retData.data.prospect_name
                            , prospectName: retData.data.primary_office_city
                            , prospectName: retData.data.region
                            , prospectName: retData.data.priority_code
                            , prospectName: retData.data.stage_code
                            // put all the other attributes that user uploaded in file.// TODO:
                          };

      } else {
          retDataObjPart = retData.data;
      }
      let dataObj = {
          inputData: prospectDataObj
          , status: retData.status
          , messages: retData.messages
          , data: retDataObjPart
      }
      prospectDataWithResultObjArr.push(dataObj);
      //res.json({status: retData.status, messages: retData.messages, data: retDataObjPart});
  }
  return prospectDataWithResultObjArr;
}
async function convertLineDataArrToDataObj(arrayOfDataArr) {
  console.log('In convert line data array into data obj for prospect creation', arrayOfDataArr);
  let dataObjArr = [];
  dataObjArr = arrayOfDataArr.map(e => {return {sr : e[0], owner_email : e[1], prospect_name:e[2], primary_office_city: e[3], region:e[4], priority_code:e[5], category_code:e[6], assessment_stage_code :e[7]}});
  console.log('Final dataObjArr:', dataObjArr);
  return dataObjArr;
}
async function classifyLines(linesArr, acceptableColumnsCount) {
  console.log('In classify lines function: acceptable coumns count, ', acceptableColumnsCount);
  console.log('In classify lines lines to process, ', linesArr.length);
  let hdrRowCount = 0;
  let acceptedRowsCount = 0;
  let rejectedRowsCount = 0;
  let rejectedLinesArr = [];
  let acceptedLineDataArr = [];
  let lineNo = 1;
  for (const lineStr of linesArr) {
      console.log('processing line #', lineNo, ' line data: ', lineStr);
      lineDataArr = lineStr.split(',');
      console.log('classify: columns count in the line: ', lineDataArr.length);
      if(lineNo==1 && (lineDataArr[0]=='#'||lineDataArr[0].toUpperCase() == 'SL NO' || lineDataArr[0].toUpperCase() == 'SL NO.')) {
          hdrRowCount++;
          console.log('classify: header row found, ignore this line..');
      } else if(lineDataArr.length!=acceptableColumnsCount) {
          console.log('classify: no of columns supplied != acceptable columns, reject this line.');
          rejectedRowsCount++;
          rejectedLinesArr.push(lineStr);
      } else {
          acceptedRowsCount++;
          console.log('classify: final else, accept this line.');
          acceptedLineDataArr.push(lineDataArr);
      }
      lineNo++;
  }
  console.log(`classify: end of loop - stats: total lines looped; ${lineNo-1}, rejected: ${rejectedRowsCount}, accepted: ${acceptedRowsCount}, header: ${hdrRowCount}`);
  // console.log(' classify final data: accepted lineDataArr', acceptedLineDataArr);
  // console.log(' classify before return, final data: Rejected linesArr', rejectedLinesArr);
  return {acceptedLineDataArr: acceptedLineDataArr, rejectedLinesArr: rejectedLinesArr, headerRowCount: hdrRowCount};
}
async function writeLinesAndMessagesData(dataLinesArr, loggedInUser) {
  console.log('We are on writevLinesvAndvMessagesData..');
  let hdr = '#, Owner email, Prospect name, Primary office city, Region, Priority code, Category code, Assessment Stage code, Error Massage \r\n';

  let rand = Math.floor(Math.random() * 10000000);
  let filePath = config.uploadDirectory;
  let fileName = rand+'.csv'; 
  console.log('file..',filePath+fileName);
  let outFileName = filePath+fileName;
  console.log('write Lines And Messages Data bad file name: ', outFileName);
  var writer = fs.createWriteStream(outFileName, {
    flags: 'a'
  })

  writer.write(hdr);
  dataLinesArr.forEach(dataLine => {
    console.log('writing line: ', dataLine.data);
    writer.write(dataLine.data+','+dataLine.message+'\r\n');
  });
  writer.end();
  console.log('we finished writing data records. Now the file needs to be added to table.');
  let file = await db.File.create({
    base_path: filePath
    , file_name: fileName
    , uploaded_file_name: fileName
    , uploaded_by_id: loggedInUser.id
  });
  let fileId = file.id;
  console.log('File record created.. id:', fileId);
  // uploadPersonFile.bad_file_id = fileId;
  // uploadPersonFile.bad_file_name = outFileName;
  //res.json({status: 'success', data: {fileName: outFileName}});
  return {status: 'status', messages:[], data: file};
}
module.exports = { 
  getProspects,
  async getProspectNames(req, res) {
    console.log('get prospect names: going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    console.log('get prospect names, User data from req: ', userData);
    console.log('get prospect names, going to call function with owner id: ', userData.id);
    let prospectNamesRetData = await getProspectNames(userData.id);
    console.log('get prospect names: returned, send response.. ');
    //console.log('get prospect names: returned data: ', prospectNamesRetData);
    res.json(prospectNamesRetData);
    return;
  },
  async getProspectById(req, res) {
    console.log('get prospect by Id: going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let prospectId = req.params.id;
    console.log('get prospect by Id, User data from req: ', userData);
    console.log('get prospect by Id, going to call function with user and prospect id: ');
    let prospectRetData = await getProspectById(userData, prospectId);
    console.log('get prospect by id: returned.. respond to client ');
    //console.log('get prospect by id: returned data: ', prospectRetData);
    res.json(prospectRetData);
    return;
  },
  async getAllProspectsDashboard(req, res) {
    console.log('get all prospects: going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let allFlag = req.query.all_flag=='Y'?true:false;
    console.log('get prospect dashboard, User data from req: ', userData);
    console.log('get prospect dashboard, going to call function with user and prospect id: ');
    let prospectRetData = await getAllProspectsDashboard(userData, allFlag)
    console.log('get prospect dashboard: returned.. respond to client ');
    //console.log('get prospect dashboard: returned data: ', prospectRetData);
    res.json(prospectRetData);
    return;
  },
  async createProspect(req, res) {
    console.log('create prospect : going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let prospectData = req.body;
    console.log('create prospect, User data from req: ', userData);
    console.log('create prospect, going to call function with user and prospect data: ');
    let prospectRetData = await createProspect(userData, prospectData);
    console.log('create prospect: returned data: ', prospectRetData);
    res.json(prospectRetData);
    return;
  },
  async updateProspect(req, res) {
    try {
      console.log('update prospect : going to get user info');
      let userRetData = await auth.getUserDataFromReq(req);
      if(userRetData.status=='error') {
        res.json(userRetData);
        return;
      }
      let prospectId = req.params.id;
      let userData = userRetData.data;
      let prospectData = req.body;
      console.log('update prospect, User data from req: ', userData);
      console.log('update prospect, going to call function with user and prospect data: ');
      let prospectRetData = await updateProspect(userData, prospectId, prospectData);
      console.log('update prospect: returned data: ', prospectRetData);
      res.json(prospectRetData);
      return;
    // guru 17-Nov-20, added try catch
    } catch (err) {
      console.log(err);
      res.json({status:'error', messages:['Error in updating prospect: '+err]});
    }
  },
  async prospectReport(req, res) {
    console.log('controllers/prospects 1 - prospectReport'); 
    try {
        console.log('controllers/prospects/prospectReport 2 - pre auth'); 
        
        let user = {};
        let report_name;

        let userRetData = await auth.getUserDataFromReq(req);
        if(userRetData.status=='error') {
          res.json(userRetData);
          return;
        }
        let userData = userRetData.data;
        console.log('prospect report, User data from req: ', userData);
        console.log('prospect report, owner id: ', userData.id);

        let reportLevelMetaData = {title: 'Prospects Report', description: 'TThis report gives prospects data.', dataExport:true};

        let metaDataObj = [
          {name: "Prospect Name", key: "prospect_name", type: "text", format: "", display:'Y'},
          {name: "Office", key: "primary_office_city", type: "text", format: "", display:'N'},
          {name: "Region", key: "region", type: "text", format: "", display:'N'},
          {name: "Priority Code", key: "priority_code", type: "text", format: "", display:'N'},
          {name: "Priority", key: "priority", type: "text", format: "", display:'Y'},
          {name: "Assess stg code", key: "assessment_stage_code", type: "text", format: "", display:'N'},
          {name: "Assess stge", key: "assessment", type: "text", format: "", display:'Y'},
          {name: "Category Code", key: "category_code", type: "text", format: "", display:'N'},
          {name: "Category", key: "category", type: "text", format: "", display:'Y'},
          {name: "Fund Raise Stg Code", key: "fund_raise_stage_code", type: "text", format: "", display:'N'},
          {name: "Fund Raise Stge", key: "fund_raise_stage", type: "text", format: "", display:'Y'},
          {name: "Fund Raise Stg Comm", key: "fund_raise_stage_comment", type: "text", format: "", display:'N'},
          {name: "Ticket Size ($M)", key: "ticket_size", type: "number", format: "", display:'Y'},
          {name: "India Alloc Code", key: "india_allocation_code", type: "text", format: "", display:'N'},
          {name: "India Alloc", key: "india_alloc", type: "text", format: "", display:'Y'},
          {name: "India Alloc Comm", key: "india_allocation_comment", type: "text", format: "", display:'N'},
          {name: "Strategic India Align Code", key: "strategic_india_alignment_code", type: "text", format: "", display:'N'},
          {name: "Strategic India Align", key: "statergic", type: "text", format: "", display:'Y'},
          {name: "Strategic India Align Comment", key: "strategic_india_alignment_comment", type: "text", format: "", display:'N'},
          {name: "TN Track Rec Bias Code", key: "tn_track_record_bias_code", type: "text", format: "", display:'N'},
          {name: "TN Track Rec Bias", key: "tn_track_record", type: "text", format: "", display:'Y'},
          {name: "TN Track Rec Bias Comment", key: "tn_track_record_bias_comment", type: "text", format: "", display:'N'},
          {name: "Senior TN Advocate Code", key: "senior_advocate_code", type: "text", format: "", display:'N'},
          {name: "Senior TN Advocate", key: "senior_advocate", type: "text", format: "", display:'Y'},
          {name: "Senior TN Advocate Comment", key: "senior_advocate_comment", type: "text", format: "", display:'N'},
          {name: "Pos Neg Surprise Code", key: "positive_negative_surprise_code", type: "text", format: "", display:'N'},
          {name: "Pos Neg Surprise", key: "positive_negative_surprise", type: "text", format: "", display:'Y'},
          {name: "Pos Neg Surprise Comment", key: "positive_negative_surprise_comment", type: "text", format: "", display:'N'},
          {name: "Team Update", key: "tot_team_update", type: "number", format: "", display:'Y'},
          {name: "Trips Update", key: "tot_trips_update", type: "number", format: "", display:'Y'},
          {name: "Emails", key: "tot_email_sent", type: "number", format: "", display:'Y'},
          {name: "Intro", key: "tot_intro", type: "number", format: "", display:'Y'},
          {name: "IR Team Total", key: "tot_ir_team", type: "number", format: "", display:'Y'},
          {name: "Macro", key: "tot_macro", type: "number", format: "", display:'Y'},
          {name: "Sector Updt", key: "tot_sector_update", type: "number", format: "", display:'Y'},
          {name: "Co Invest", key: "tot_co_invest", type: "number", format: "", display:'Y'},
          {name: "Qtrly Updt", key: "tot_qtrly_update", type: "number", format: "", display:'Y'},
          {name: "Half Yrly Updt", key: "tot_half_yr_updt", type: "number", format: "", display:'Y'},
          {name: "Road Show", key: "tot_road_show", type: "number", format: "", display:'Y'},
          {name: "Site Visit", key: "tot_site_visit", type: "number", format: "", display:'Y'},
          {name: "Deal Team Total", key: "tot_deal_team", type: "number", format: "", display:'Y'},
          {name: "Likelihood Score", key: "total_likelihood_score", type: "text", format: "", display:'Y'},
        ]

        queryStr = "select p.id, p.owner_employee_id "
                    +" , p.prospect_name, p.primary_office_city, p.region "
                    +" , priority_code, priority_clv.lookup_value priority "
                    +" , assessment_stage_code, assess_clv.lookup_value assessment "
                    +" , category_code, cat_clv.lookup_value category "
                    +" , fund_raise_stage_code, fund_raise_clv.lookup_value fund_raise_stage, p.fund_raise_stage_comment "
                    +" , p.ticket_size "
                    +" , p.india_allocation_code, ind_alloc_clv.lookup_value india_alloc, p.india_allocation_comment "
                    +" , p.strategic_india_alignment_code, stat_ind_align_clv.lookup_value statergic, p.strategic_india_alignment_comment "
                    +" , p.tn_track_record_bias_code, tn_track_clv.lookup_value tn_track_record, p.tn_track_record_bias_comment "
                    +" , p.senior_advocate_code, sr_adv_clv.lookup_value senior_advocate, p.senior_advocate_comment "
                    +" , p.positive_negative_surprise_code, pos_neg_clv.lookup_value positive_negative_surprise, p.positive_negative_surprise_comment "
                    +" , i.tot_team_update, i.tot_trips_update, i.tot_email_sent, i.tot_intro "
                    +" , i.tot_ir_team "
                    +" , i.tot_macro, i.tot_sector_update, i.tot_co_invest, i.tot_qtrly_update, i.tot_half_yr_updt, i.tot_road_show, i.tot_site_visit "
                    +" , i.tot_deal_team "
                    +" , e.full_name "
                    +" , cast(cast(case when india_allocation_code='' then null else india_allocation_code end as integer) "
                    +"  + cast(case when strategic_india_alignment_code ='' then null else strategic_india_alignment_code end as integer) "
                    +"  + cast(case when senior_advocate_code ='' then null else senior_advocate_code end as integer) "
                    +"  + cast(case when tn_track_record_bias_code ='' then null else tn_track_record_bias_code end as integer) "
                    +"  + cast(case when positive_negative_surprise_code ='' then null else positive_negative_surprise_code	 end as integer) "
                    +"  as varchar)||'%' as total_likelihood_score "
                    +" from prospects p "
                    +" join employees e on p.owner_employee_id = e.id "
                    +" join common_list_values priority_clv on priority_clv.lookup_code = priority_code and priority_clv.list_code = 'PRIORITY_CODES' "
                    +" left join common_list_values fund_raise_clv on fund_raise_clv.lookup_code = fund_raise_stage_code and fund_raise_clv.list_code = 'FUND_RAISE_STAGE_CODES' "
                    +" join common_list_values cat_clv on cat_clv.lookup_code = p.category_code and cat_clv.list_code = 'CATEGORY_CODES' "
                    +" left join common_list_values ind_alloc_clv on ind_alloc_clv.lookup_code = india_allocation_code and ind_alloc_clv.list_code = 'INDIA_ALLOC_CODES' "
                    +" left join common_list_values assess_clv on assess_clv.lookup_code = assessment_stage_code and assess_clv.list_code = 'ASSESSMENT_STAGE_CODES' "
                    +" left join common_list_values stat_ind_align_clv on stat_ind_align_clv.lookup_code = strategic_india_alignment_code and stat_ind_align_clv.list_code = 'STRATEGIC_INDIA_ALIGN_CODES' "
                    +" left join common_list_values tn_track_clv on tn_track_clv.lookup_code = tn_track_record_bias_code and tn_track_clv.list_code = 'TN_TRACK_RECORD_BIAS_CODES' "
                    +" left join common_list_values sr_adv_clv on sr_adv_clv.lookup_code = senior_advocate_code and sr_adv_clv.list_code = 'SENIOR_ADVOCATE_CODES' "
                    +" left join common_list_values pos_neg_clv on pos_neg_clv.lookup_code = positive_negative_surprise_code and pos_neg_clv.list_code = 'POSITIVE_NEGATIVE_SURPRISE_CODES' "
                    +" left join (select client_id "
                    +"       , sum(case when interaction_type_code='IR_TEAM_UPDATE' then 1 else 0 end) as tot_team_update "
                    +"       , sum(case when interaction_type_code='IR_TRIPS_UPDATE' then 1 else 0 end) as tot_trips_update "
                    +"       , sum(case when interaction_type_code='IR_EMAIL_OUTREACH' then 1 else 0 end) as tot_email_sent "
                    +"       , sum(case when interaction_type_code='IR_TN_INTRO_CALLS' then 1 else 0 end) as tot_intro "
                    +"       , sum(case when team_code ='IR' then 1 else 0 end) as tot_ir_team "
                    +"       , sum(case when interaction_type_code='DT_INDIA_MACRO_UPDATE' then 1 else 0 end) as tot_macro "
                    +"       , sum(case when interaction_type_code='DT_SECTOR_UPDATE' then 1 else 0 end) as tot_sector_update "
                    +"       , sum(case when interaction_type_code='DT_CO_INVEST_DISCUSSION' then 1 else 0 end) as tot_co_invest "
                    +"       , sum(case when interaction_type_code='DT_QUARTERLY_PORTFOLIO_UPDATE' then 1 else 0 end) as tot_qtrly_update "
                    +"       , sum(case when interaction_type_code='DT_HALF_YEARLY_UPDATE' then 1 else 0 end) as tot_half_yr_updt "
                    +"       , sum(case when interaction_type_code='DT_ROADSHOW_VCS' then 1 else 0 end) as tot_road_show "
                    +"       , sum(case when interaction_type_code='DT_SITE_VISIT' then 1 else 0 end) as tot_site_visit "
                    +"       , sum(case when team_code ='DT' then 1 else 0 end) as tot_deal_team "
                    +"     from interactions where client_type_code = 'PROSPECT' group by client_id "
                    +"   ) i on p.id = i.client_id  "
                    +" where p.owner_employee_id = :ownerId "
                ;

        console.log("controllers/prospects/ report  4: query sting: ", queryStr);
        let queryData = await db.sequelize.query(queryStr, {replacements: {ownerId: userData.id}, type: db.sequelize.QueryTypes.SELECT});
        console.log('result length : ', queryData.length);
        res.json({status: 'success', data: {reportLevelMetaData: reportLevelMetaData, metaData: metaDataObj, reportData: queryData}});
        return;
    } catch(err) {
        console.log(err);
        res.json({status:'error', messages:['Error in prospects users report ']});
    }
  },
  async testGetAllProspects(req, res) {

    let fieldListObj = {
      'id' : {dispName:'Prospect Id', dataType:'integer', model: '', alias: ''},
      'owner_employee_id' : {dispName:'Prospect Id', dataType:'integer', model:'', alias: ''},
      'owner.desg.lookup_value' : {dispName:'Owner Desg', dataType:'string', model:'db.CommonListValue'},
      'prospect_name' : {dispName:'Prospect Name', dataType:'string', model:'', alias: ''},
      'primary_office_city' : {dispName:'Primary Office',dataType:'string', model:'', alias: ''},
      'region' : {dispName:'Region',dataType:'string', model:'', alias: '', wcFieldName: 'region'},
      'priority_code' : {dispName:'Priortity Code',dataType:'string', model:'', alias: ''},
      'assessment_stage_code' : {dispName:'Assessment Stage Code',dataType:'string', model:'', alias: ''},
      'category_code' : {dispName:'Category Code',dataType:'string', model:'', alias: ''},
      'fund_raise_stage_code' : {dispName:'Fund Raise Stage code',dataType:'string', model:'', alias: ''},
      'ticket_size' : {dispName:'Ticket Size',dataType:'number', model:'', alias: ''},
      'owner.email' : {dispName:'Owner Email',dataType:'string', model: db.Employee, alias: 'owner'},
      'owner.full_name' : {dispName:'Owner Name',dataType:'string', model: db.Employee, alias: 'owner'},
      'owner.enabled' : {dispName:'Owner Enabled',dataType:'boolean', model: db.Employee, alias: 'owner'},
      'priority.lookup_value' : {dispName:'Priority Value',dataType:'string', model: db.CommonListValue, alias: 'priority'},
      'lookup_description' : {dispName:'Priority Desc',dataType:'string', model: db.CommonListValue, alias: 'priority'},
      'priority.enabled' : {dispName:'Priority Enabled',dataType:'boolean', model: db.CommonListValue, alias: 'priority'},
      'priority.display_order' : {dispName:'Priority Disp Order',dataType:'integer', model: db.CommonListValue, alias: 'priority'},
      'cat.lookup_value' : {dispName:'Category Value',dataType:'string', model: db.CommonListValue, alias: 'cat'},
      'cat.lookup_description' : {dispName:'Category Desc',dataType:'string', model: db.CommonListValue, alias: 'cat'},
      'cat.enabled' : {dispName:'Category Enabled',dataType:'string', model: db.CommonListValue, alias: 'priority'}
    };

    // let orderByField=null;
    // let orderByDirection=null;
    // if(req.query.order_by_field) {
    //   if(!fieldListObj[req.query.order_by_field]) {
    //     res.json({status: 'error', messages: ['Invalid field for order by, please contact support.']});
    //     return;
    //   }
    //   orderByField = req.query.order_by_field;
    //   if(!req.query.order_by_direction) orderByDirection = 'ASC';
    //   else orderByDirection = req.query.order_by_direction;
    //   console.log('order by direction: ', orderByDirection);
    //   if(orderByDirection!='ASC'&&orderByDirection!='DESC') {
    //     res.json({status: 'error', messages: ['Invalid value for order by direction, please contact support.']});
    //     return;
    //   }
    // }
    // console.log('Order by field: ', orderByField);
    // let orderByArr = [];
    // if(orderByField) {
    //   if(fieldListObj[orderByField]['model']!='') {
    //     orderByArr.push({model: fieldListObj[orderByField]['model'], as: fieldListObj[orderByField]['alias']});
    //   }
    //   orderByFieldName = orderByField.split('.').reverse().shift();
    //   orderByArr.push(orderByFieldName);
    //   orderByArr.push(orderByDirection);
    // }
    // console.log('order by arr: ', orderByArr);
    let orderByRes = await getOrderByFromReq(req, fieldListObj);
    if(orderByRes.status=='error') {
      res.json(orderByRes);
      return;
    }
    let orderByArr = orderByRes.data;
    if(orderByArr.length==0) orderByArr = ['id'];
    //// moved to function..
    // let fieldListArr = [];
    // await Object.keys(fieldListObj).forEach(fieldListObjKey => fieldListArr.push({
    //   dispName: fieldListObj[fieldListObjKey]['dispName']
    //   , fieldName: fieldListObjKey
    //   , dataType: fieldListObj[fieldListObjKey]['dataType']
    // }));
    let fieldListArr = await convertFieldListObjToArr(fieldListObj);
    //// moved to function..
    // let fieldsArr = ['id', 'owner_employee_id', 'prospect_name', 'owner.full_name', 'owner.email', 'owner.desg.lookup_value'];
    // let operationsArr = ['<=', '=', 'like', 'like', '=', 'like'];
    // let valuesArr = [20, 3, 'GPD', 'surya', 'surya@tn.com', 'VP'];
    // if(fieldsArr.length!=operationsArr.length || fieldsArr.length!=valuesArr.length) {
    //   res.json({status: 'error', messages: ['Fields, operations and values do not tally, please contact support']});
    //   return;
    // }
    let wcInputsFromReqRes = await getWCInputsFromReq(req);
    if(wcInputsFromReqRes.status=='error') {
      res.json(wcInputsFromReqRes);
      return;
    }
    let fieldsArr = wcInputsFromReqRes.data.fieldsArr;
    let operationsArr = wcInputsFromReqRes.data.operationsArr;
    let valuesArr = wcInputsFromReqRes.data.valuesArr;
    whereClauseRes = await constructWhereClause(fieldsArr, operationsArr, valuesArr, fieldListObj);
    console.log('......----back from construct whereClause---....');
    if(whereClauseRes.status=='error') {
      res.json(whereClauseRes);
      return;
    }
    Object.keys(whereClauseRes.data).forEach(modelKey => whereClauseRes.data[modelKey].map(e=>{console.log(e.actualWC);}));
    console.log('hey...1');
    finalWC = {};
    // Object.keys(whereClauseRes.data).forEach(modelKey => {
    //   a[modelKey] = convertWCArrToObj(whereClauseRes.data[modelKey].map(e=>e.actualWC), 'fieldName', 'wcVal');
    // });
    for (const modelKey of Object.keys(whereClauseRes.data)) {
      finalWC[modelKey] = await convertWCArrToObj(whereClauseRes.data[modelKey].map(e=>e.actualWC), 'fieldName', 'wcVal');
    }

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
        // , where: {
        //   id:{[Op.gt]:0},
        //   email: {[Op.eq]:'surya@tn.co.in'}
        // }
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
    console.log('Going to execute query...');
    let prospects = await db.Prospect.findAll({
      attributes: [
        'id', 'prospect_name', 'primary_office_city', 'region'
        , 'priority_code', 'assessment_stage_code', 'category_code'
        , 'fund_raise_stage_code', 'ticket_size'
      ],
      include: includeArr
      , where: finalWC['baseQuery']?finalWC['baseQuery']:{}
      , limit: 3
      // , raw: true
      // , nest: true
      , order: [orderByArr]
    });
    let oneProspect = {};
    let prospectfieldKeys = [];
    console.log(`----8888-- prospect length: ${prospects.length} ----8888----`);
    // if(prospects.length>0) {
    //   let oneProspectId = prospects[0].id;
    //   console.log('---- full object----');
    //   console.log(prospects[0]);
    //   console.log('---- stringified object----');
    //   console.log(JSON.stringify(prospects[0]));
    //   oneProspect = await db.Prospect.findOne({
    //       include: includeArr
    //       , where: {id: oneProspectId}
    //       , raw: true
    //     });
    //     prospectFieldKeys = Object.keys(oneProspect);
    //   }
    
    prospectsArr = [];
    //prospectsArr.push(prospects.map(e=>e.get({plain:true})));
    //prospectsArr.push(prospects.map(e=>e.get({raw:true})));
    prospectsArr = prospects;
    // console.log('prospects Arr..');
    // console.log(prospectsArr);
    
    //res.json({status: 'success', messages: [], data: {prospectData: prospectsArr, rawStructure: oneProspect, structureKeys: prospectFieldKeys, whereClause: whereClauseRes.data}});
    //res.json({status: 'success', messages: [], data: {prospectData: prospectsArr, fileList: fieldListArr, whereClause: whereClauseRes.data, fieldListObj: fieldListObj}});
    res.json({status: 'success', messages: [], data: {prospectData: prospectsArr, fileList: fieldListArr, filterArrObj: {fielsArr:fieldsArr, operationsArr: operationsArr, valuesArr: valuesArr}, orderBy: orderByArr, whereClause: finalWC}});
  },
  async testGetAllProspectsForOrCond(req, res) {
    let fieldListObj = {
      'id' : {dispName:'Prospect Id', dataType:'integer', model: '', alias: ''},
      'owner_employee_id' : {dispName:'Prospect Id', dataType:'integer', model:'', alias: ''},
      'owner.desg.lookup_value' : {dispName:'Owner Desg', dataType:'string', model:'db.CommonListValue'},
      'prospect_name' : {dispName:'Prospect Name', dataType:'string', model:'', alias: ''},
      'primary_office_city' : {dispName:'Primary Office',dataType:'string', model:'', alias: ''},
      'region' : {dispName:'Region',dataType:'string', model:'', alias: '', wcFieldName: 'region'},
      'priority_code' : {dispName:'Priortity Code',dataType:'string', model:'', alias: ''},
      'assessment_stage_code' : {dispName:'Assessment Stage Code',dataType:'string', model:'', alias: ''},
      'category_code' : {dispName:'Category Code',dataType:'string', model:'', alias: ''},
      'fund_raise_stage_code' : {dispName:'Fund Raise Stage code',dataType:'string', model:'', alias: ''},
      'ticket_size' : {dispName:'Ticket Size',dataType:'number', model:'', alias: ''},
      'owner.email' : {dispName:'Owner Email',dataType:'string', model: db.Employee, alias: 'owner'},
      'owner.full_name' : {dispName:'Owner Name',dataType:'string', model: db.Employee, alias: 'owner'},
      'owner.enabled' : {dispName:'Owner Enabled',dataType:'boolean', model: db.Employee, alias: 'owner'},
      'priority.lookup_value' : {dispName:'Priority Value',dataType:'string', model: db.CommonListValue, alias: 'priority'},
      'lookup_description' : {dispName:'Priority Desc',dataType:'string', model: db.CommonListValue, alias: 'priority'},
      'priority.enabled' : {dispName:'Priority Enabled',dataType:'boolean', model: db.CommonListValue, alias: 'priority'},
      'priority.display_order' : {dispName:'Priority Disp Order',dataType:'integer', model: db.CommonListValue, alias: 'priority'},
      'cat.lookup_value' : {dispName:'Category Value',dataType:'string', model: db.CommonListValue, alias: 'cat'},
      'cat.lookup_description' : {dispName:'Category Desc',dataType:'string', model: db.CommonListValue, alias: 'cat'},
      'cat.enabled' : {dispName:'Category Enabled',dataType:'string', model: db.CommonListValue, alias: 'priority'}
    };
    let orderByRes = await getOrderByFromReq(req, fieldListObj);
    if(orderByRes.status=='error') {
      res.json(orderByRes);
      return;
    }
    let orderByArr = orderByRes.data;
    if(orderByArr.length==0) orderByArr = ['id'];
    let fieldListArr = await convertFieldListObjToArr(fieldListObj);
    let wcInputsFromReqRes = await getWCInputsFromReq(req);
    if(wcInputsFromReqRes.status=='error') {
      res.json(wcInputsFromReqRes);
      return;
    }
    let fieldsArr = wcInputsFromReqRes.data.fieldsArr;
    let operationsArr = wcInputsFromReqRes.data.operationsArr;
    let valuesArr = wcInputsFromReqRes.data.valuesArr;
    whereClauseRes = await constructWhereClause(fieldsArr, operationsArr, valuesArr, fieldListObj);
    console.log('......----back from construct whereClause---....');
    if(whereClauseRes.status=='error') {
      res.json(whereClauseRes);
      return;
    }
    Object.keys(whereClauseRes.data).forEach(modelKey => whereClauseRes.data[modelKey].map(e=>{console.log(e.actualWC);}));
    console.log('hey...1');
    finalWC = {};
    for (const modelKey of Object.keys(whereClauseRes.data)) {
      finalWC[modelKey] = await convertWCArrToObj(whereClauseRes.data[modelKey].map(e=>e.actualWC), 'fieldName', 'wcVal');
    }
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
    let conditionArr = [];
    conditionArr.push(db.sequelize.where(db.sequelize.col('owner_employee_id'), {[Op.gt]:0}));
    conditionArr.push(db.sequelize.where(db.sequelize.col('prospect_name'), {[Op.iLike]:'%GPD%'}));
    conditionArr.push(db.sequelize.where(db.sequelize.col('owner.full_name'), {[Op.iLike]:'%surya%'}));
    conditionArr.push(db.sequelize.where(db.sequelize.col('cat.display_order'), {[Op.gte]:1}));
    console.log('Going to execute query...');
    let prospects = await db.Prospect.findAll({
      attributes: [
        'id', 'prospect_name', 'primary_office_city', 'region'
        , 'priority_code', 'assessment_stage_code', 'category_code'
        , 'fund_raise_stage_code', 'ticket_size', 'owner_employee_id'
      ]
      , include: includeArr
      , where: {
        //[Op.and]:[
        //[Op.or]:
        // [
        //   db.sequelize.where(db.sequelize.col('owner_employee_id'), {[Op.gt]:0})
        //   , db.sequelize.where(db.sequelize.col('prospect_name'), {[Op.iLike]:'%GPD%'})
        //   , db.sequelize.where(db.sequelize.col('owner.full_name'), {[Op.iLike]:'%surya%'})
        // ]
        [req.query.and_or_value=='or'?Op.or:Op.and]:conditionArr
      }
      //, where: db.sequelize.where(db.sequelize.col('owner_employee_id'), {[Op.gt]:0})
      //, where: {[db.sequelize.col('owner_employee_id')]: 0}
      //, where: db.sequelize.where(db.sequelize.fn('char_length', db.sequelize.col('prospect_name')), 3)
      //, where: db.sequelize.where(db.Prospect.owner_employee_id,{[Op.gt]:0})
      //, where: finalWC['baseQuery']?finalWC['baseQuery']:{}
      //, where: {$and: [{'owner_employee_id': {$lt: 20}}, {'prospect_name': {$ilike: '%'+'GPD'+'%'}}, {'owner.full_name':{$ilike: '%'+'surya'+'%'}}, {'cat.lookup_value':{$eq:'TIER1'}}]}
      // , where: {'owner_employee_id': {[Op.lt]:20}, 'prospect_name': {[Op.iLike]:'%'+'GPD'+'%'}
      //           //, 'owner.full_name':{[Op.iLike]: '%'+'surya'+'%'}
      //           //` , 'prospect_name':{[Op.col]:'owner.full_name'}
      //         }
      , limit: 3
      // , raw: true
      // , nest: true
      , order: [orderByArr]
    });
    let oneProspect = {};
    let prospectfieldKeys = [];
    console.log(`----8888-- prospect length: ${prospects.length} ----8888----`);    
    prospectsArr = [];
    //prospectsArr.push(prospects.map(e=>e.get({plain:true})));
    //prospectsArr.push(prospects.map(e=>e.get({raw:true})));
    prospectsArr = prospects;
    // console.log('prospects Arr..');
    // console.log(prospectsArr);
    res.json({status: 'success', messages: [], data: {prospectData: prospectsArr, fileList: fieldListArr, filterArrObj: {fielsArr:fieldsArr, operationsArr: operationsArr, valuesArr: valuesArr}, orderBy: orderByArr, whereClause: finalWC}});
  },  
  //pooja 19-May-2020 file upload and insert
  async readFileData(req, res) {
    try {
        let data = req.body;
        let userId;
        console.log('req body: ', data);
        // if(data.test_mode && data.test_mode=='Y') {
        //     console.log('This is test mode.. get prospect id from req body');
        //     if(data.user_id) {
        //         userId = data.user_id;
        //     } else {
        //         res.json({status: 'error', messages:['User id must be supplied in test mode']});
        //         return;
        //     }
        // } else {
        //     console.log('This is Real mode.. get user id from req token');
        //     if(req.user && req.user.id) userId = req.user.id;
        //     else {
        //         res.json({status: 'error', messages:['Unable to get user information, please contact support']});
        //         return;
        //     }
        // }
        // let userData = await db.User.findOne({
        //     where: {id: userId}
        // });
        // if(!userData) {
        //     res.json({status: 'error', messages: ['Invalid user information, please contact support.']});
        // }
        let userRetData = await auth.getUserDataFromReq(req);
        if(userRetData.status=='error') {
          res.json(userRetData);
          return;
        }
        let userData = userRetData.data;
        //let filePath = '/home/guru/tn/inv/inv-api/csv-files/';
        //let filePath = __basedir+'/csv-files/';
        let filePath = config.csvDirectory;
        let fileName;
        if(data.file_id) {
            let inputFileObj = await db.File.findOne({
                where: {id: data.file_id}
            });
            if(!inputFileObj) {
                res.json({status: 'error', messages:['file id is invalid']});
                return;
            }
            fileName = inputFileObj.base_path+inputFileObj.file_name;
        } else if(data.file_name) {
            fileName = filePath+data.file_name;
        }
        
        if(!fileName) {
            res.json({status: 'error', messages:['file name must be supplied']});
            return;
        }
        // // temp: guru 31-May
        // console.log('going to send a dummy response...');
        // res.json({status:'success', messages:[]
        //         , data: {acceptedLineDataArr: 'acceptedLineStrings'
        //                 , rejectedLinesArr: []
        //                 , dataObjArr: []
        //                 , processedData: []
        //                 , stats: {
        //                     totalLines: 15
        //                     , totalLinesRejected: 5
        //                     , headerRowCount: 2
        //                     , totalLinesAccepted: 8
        //                     , totalErrored: 2
        //                     , totalSuccess: 6
        //                 },
        //                 files: {
        //                     rejectedDataFileId: 5
        //                     , errorDataFileId: 2
        //                     , successDataFileId: 1
        //                     // rejectedDataFileName: rejectedDataFileName
        //                     // , erroredDataFileName: errorDataFileName
        //                     // , successDataFileName: successDataFileName
        //                 }
        //               }
        //             }
        //           );
        // return;
        let acceptableColumnsCount = 8;
        //console.log('Full file name: ', filePath+fileName);
        //console.log('Full file name: ', fileName);
        console.log('going to call read lines from file..');
        //let fileDataArrObj = await readLinesFromFile(filePath+fileName);
        let fileDataArrObj = await readLinesFromFile(fileName);
        console.log('read lines from file is done.. result is:', fileDataArrObj);
        let validInvalidLinesArrObj = await classifyLines(fileDataArrObj.linesArr, acceptableColumnsCount);
        console.log(`returned from classify: stats: accepted lines count: ${validInvalidLinesArrObj.acceptedLineDataArr.length}, rejected: ${validInvalidLinesArrObj.rejectedLinesArr.length}`);
        // rejected data in format for write.
        let rejectedLinesForWrite = validInvalidLinesArrObj.rejectedLinesArr.map(e => {return {data: e, message: 'Rejected for columns mismatch'}});
        console.log('Rejected lines to write: ', rejectedLinesForWrite);
        let rejectedDataFileId = null;
        let rejectedDataFileName = null;
        if(rejectedLinesForWrite.length >0) {
            let rejectedFileRetObj = await writeLinesAndMessagesData(rejectedLinesForWrite, userData);
            let rejectedFileObj = rejectedFileRetObj.data;
            console.log('Rejected file Obj: ', rejectedFileObj&&rejectedFileObj.id);
            if(rejectedFileObj) rejectedDataFileId = rejectedFileObj.id;
            rejectedDataFileName = rejectedFileObj.base_path+rejectedFileObj.file_name;
            console.log('Rejected data file name: ', rejectedDataFileName);
        } 
        // just for a better looking data.. back to line format
        acceptedLineStrings = validInvalidLinesArrObj.acceptedLineDataArr.map(e => e.join(','));

        let dataObjArr = await convertLineDataArrToDataObj(validInvalidLinesArrObj.acceptedLineDataArr);
        // res.json({status: 'success', messages:['temp stop']});
        // return;
        let processedDataObjArr = await processDataObjArr(dataObjArr, userData);
        console.log('After process data: ', processedDataObjArr);
        // extract all the error data..
        let erroredData = processedDataObjArr.filter(e => e.status=='error');
        // Change this TODO:
        let erroredLinesForWrite = erroredData.map(e => { return {data:e.inputData.sr+','+e.inputData.owner_email+','+e.inputData.prospect_name+','+e.inputData.primary_office_city+','+e.inputData.region+','+e.inputData.priority_ce+','+e.inputData.category_code+','+e.inputData.assessment_stage_code
                                                            , message: e.messages.join(',')
                                                        }
                                                });
        console.log('Error Data lines to write: ', erroredLinesForWrite);
        let errorDataFileName = null;
        let errorDataFileId = null;
        if(erroredLinesForWrite.length>0) {
            let erroredFileRetObj = await writeLinesAndMessagesData(erroredLinesForWrite, userData);
            let erroredFileObj = erroredFileRetObj.data;
            console.log('Error data file Obj: ', erroredFileObj&&erroredFileObj.id);
            if(erroredFileObj) errorDataFileId = erroredFileObj.id;
            errorDataFileName = erroredFileObj.base_path+erroredFileObj.file_name;
            console.log('Error data file name: ', errorDataFileName);
        }
        // change here TODO:
        let successDataForWrite = processedDataObjArr.filter(e => e.status=='success').map(e => { return {data: e.inputData.sr+','+e.inputData.owner_email+','+e.inputData.prospect_name+','+e.inputData.primary_office_city+','+e.inputData.region+','+e.inputData.priority_code+','+e.inputData.category_code+','+e.inputData.assessment_stage_code
                                                                                                }
                                                                                            });
        console.log('Success Data lines to write: ', successDataForWrite);
        let successDataFileName = null;
        let successDataFileId = null;
        if(successDataForWrite.length>0) {
            let successFileRetObj = await writeLinesAndMessagesData(successDataForWrite, userData);
            let successFileObj = successFileRetObj.data;
            console.log('Success data file Obj: ', successFileObj&&successFileObj.id);
            if(successFileObj) successDataFileId = successFileObj.id;
            successDataFileName = successFileObj.base_path+successFileObj.file_name;
            console.log('Success data file name: ', successDataFileName);
        }
        /*
        res.json({status:'success', messages:[], data: {acceptedLineDataArr: acceptedLineStrings
                                                        , rejectedLinesArr: validInvalidLinesArrObj.rejectedLinesArr
                                                        //, dataObjArr: dataObjArr
                                                        , processedData: processedDataObjArr
                                                    }});
        */
        res.json({status:'success', messages:[], data: {acceptedLineDataArr: acceptedLineStrings
                                                        , rejectedLinesArr: validInvalidLinesArrObj.rejectedLinesArr
                                                        , dataObjArr: dataObjArr
                                                        , processedData: processedDataObjArr
                                                        , stats: {
                                                            totalLines: fileDataArrObj.linesArr.length
                                                            , totalLinesRejected: validInvalidLinesArrObj.rejectedLinesArr.length
                                                            , headerRowCount: validInvalidLinesArrObj.headerRowCount
                                                            , totalLinesAccepted: validInvalidLinesArrObj.acceptedLineDataArr.length
                                                            , totalErrored: erroredLinesForWrite.length
                                                            , totalSuccess: successDataForWrite.length
                                                        },
                                                        files: {
                                                            rejectedDataFileId: rejectedDataFileId
                                                            , errorDataFileId: errorDataFileId
                                                            , successDataFileId: successDataFileId
                                                            , rejectedDataFileName: rejectedDataFileName
                                                            , erroredDataFileName: errorDataFileName
                                                            , successDataFileName: successDataFileName
                                                        }
                                                    }});
    } catch(err) {
        console.log(err);
        res.json({status:'error', messages:['Error in prospect file ', err]});
    }
  }
};