const db = require('../models');
const moment = require('moment');
const utilCtl = require('./commonutils');
const auth = require('./authorizations');
const Op = db.Sequelize.Op;
const config = require('../config/config');
const uploadDirectory = require('../config/config').uploadDirectory;
const fs = require('fs');
const readline = require('readline');
const https = require('https');

async function getExistingInvestorNames(ownerUserId) {
  if(ownerUserId=='') {
    return {status: 'error', messages: ['Owner User Id is mandatory to get existing investor names'], data: null}
  }
  let existingInvestor = await db.ExistingInvestor.findAll({
    attributes: ['id', 'investor_name', 'primary_office_city', 'region']
    , where: {owner_employee_id: ownerUserId}
  });
  return {status: "success", messages: [], data: existingInvestor};
}

async function getExistingInvestorById(userData, existingInvestorId) {
  if(!userData || !userData.id || userData.id == '') {
    return {status: 'error', messages: ['Owner User is mandatory to get existing investor data'], data: null}
  }
  let existingInvestor = await db.ExistingInvestor.findOne({
    where: {owner_employee_id: userData.id
            , id: existingInvestorId
          }
    , include: [
      {
        model: db.Employee
        , as: 'owner'
      },
      {
        model: db.CommonListValue
        , as: 'fund'
        , required: false
        , where: {list_code: 'FUND_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'stage'
        , required: false
        , where: {list_code: 'STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'category'
        , required: false
        , where: {list_code: 'CATEGORY_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'fund_raise_stg'
        , required: false
        , where: {list_code: 'FUND_RAISE_STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'share_of_wallet'
        , required: false
        , where: {list_code: 'SHARE_OF_WALLET_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'investment_per'
        , required: false
        , where: {list_code: 'INVESTMENT_PERFORMANCE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'work_lvl_support'
        , required: false
        , where: {list_code: 'WORKING_LEVEL_SUPPORT_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'senior_lvl_conn'
        , required: false
        , where: {list_code: 'SENIOR_LEVEL_CONNECT_CODES'}
      },
      // {
      //   model: db.CommonListValue
      //   , as: 'sub_fact'
      //   , required: false
      //   , where: {list_code: 'SUBJECTIVE_FACTOR_CODES'}
      // },
      {
        model: db.Interaction
        , as: 'interactions'
        , required: false
        , where: {client_type_code: 'EXISTING_INVESTOR'}
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
  if(!existingInvestor) {
    return {status: 'error', messages: [`Invalid existing investor id ${existingInvestorId} for user: ${userData.id}`], data: null}
  }
  return {status: "success", messages: [], data: existingInvestor};
}

async function getAllExistingInvestorsDashboard(userData, allFlag) {
  if(!userData || !userData.id || userData.id == '') {
    return {status: 'error', messages: ['Owner User is mandatory to get existing investor data'], data: null}
  }
  let whereClause = {};
  if(!allFlag) {
    whereClause = {owner_employee_id: userData.id};
  }

  let strengthOfRelSubTableHeaders = [
    {refKey: 0, label: "#"},
    {refKey: 1, label: "$M"},
    {refKey: 2, label: "Avg. Segment"},
  ];
  let result = {
    strength_of_rel: {
      label: "Strength of Existing Relationship"
      , table_heading_array:[
        {label: "",headerCols: [{refKey: 0 , label: "Relationship Index Breakdown"}]}
      ]
      , sub_table_keys: ['column1']
      , row_keys_array: []
      , data_obj: {}
    },
    existing_inv_pipeline: {
      label: "Existing Investor Fund VII pipeline"
      , table_heading_array:[
        {position: 0, label: "Category"},
        {position: 1, label: "#"},
        {position: 2, label: "$M"}
      ]
      , row_keys_array: []
      , data_obj: {}
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
      , data_obj: {}
    },
    avg_rel_score: {
      label: "Average Relationship Index"
    }
  };

  let existingInvestors = await db.ExistingInvestor.findAll({
    where: {
          }
    , include: [
      {
        model: db.Employee
        , as: 'owner'
      },
      {
        model: db.CommonListValue
        , as: 'fund'
        , required: false
        , where: {list_code: 'FUND_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'stage'
        , required: false
        , where: {list_code: 'STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'category'
        , required: false
        , where: {list_code: 'CATEGORY_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'fund_raise_stg'
        , required: false
        , where: {list_code: 'FUND_RAISE_STAGE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'share_of_wallet'
        , required: false
        , where: {list_code: 'SHARE_OF_WALLET_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'investment_per'
        , required: false
        , where: {list_code: 'INVESTMENT_PERFORMANCE_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'work_lvl_support'
        , required: false
        , where: {list_code: 'WORKING_LEVEL_SUPPORT_CODES'}
      },
      {
        model: db.CommonListValue
        , as: 'senior_lvl_conn'
        , required: false
        , where: {list_code: 'SENIOR_LEVEL_CONNECT_CODES'}
      },
      // {
      //   model: db.CommonListValue
      //   , as: 'sub_fact'
      //   , required: false
      //   , where: {list_code: 'SUBJECTIVE_FACTOR_CODES'}
      // },
      {
        model: db.Interaction
        , as: 'interactions'
        , required: false
        , where: {
          client_type_code: 'EXISTING_INVESTOR'
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
    , order: [[{model: db.CommonListValue, as: 'stage'}, 'display_order']]
  });
  if(existingInvestors.length==0) {
    return {status: 'error', messages: [`No investor data`], data: null}
  }
  let stageCodeLists = await db.CommonListValue.findAll({
    where: {list_code: 'STAGE_CODES'}
     ,order: [['display_order']]
  });
  consolidatedStageCodeArr = [];
  consolidatedStageCodes = {};
  for (const stage of stageCodeLists) {
    // TODO: summarise the stage ..
    //consolidatedStageCodes[stage.lookup_code] = stage.lookup_value.replace(/[\ %()-_!@#$^&*]/g, '');
    consolidatedStageCodes[stage.lookup_code] = stage.lookup_value.replace(/[\ ]/g, '');
  }
  console.log('consolidated Stage codes: ', consolidatedStageCodes);
  let countinvestors = 0;
  let totalTicketSize = 0;
  let countCoveredinvestors = 0;
  let allInvestorTotalRelScore = 0;
  for (const investor of existingInvestors) {
    // find the total liklihood score..
    let investorTotRelScore = Number(investor.share_of_wallet_code)+Number(investor.investment_performance_code)+Number(investor.working_level_support_code)+Number(investor.senior_level_connect_code)+Number(investor.subjective_factor_code);
    allInvestorTotalRelScore += investorTotRelScore;
    console.log(`investor id: ${investor.id}, investor name: ${investor.investor_name} `);
    console.log(`investor id: ${investor.id}, wallet share: ${investor.share_of_wallet_code}, invest pref: ${investor.investment_performance_code}, working level support: ${investor.working_level_support_code}, senior level connect: ${investor.senior_level_connect_code}, subjective factor: ${investor.subjective_factor_code} `);
    console.log(`investor total: ${investorTotRelScore}, total rel score: ${allInvestorTotalRelScore}`);

    if(investor.stage_code!='') investor.consolidatedStageCode = consolidatedStageCodes[investor.stage_code];
    else investor.consolidatedStageCode = 'x';
    countinvestors++;
    totalTicketSize += Number(investor.ticket_size);
    //console.log(`looping for investor id: ${investor.id}, fund: ${investor.fund_code}, stage: ${investor.stage_code}, ticket: ${investor.ticket_size} `);
    if(investor.fund_code!=''&&investor.fund_code!=null&&investor.stage_code!=''&&investor.stage_code!=null) {
      // toggle this to commented
      // if(!result.strength_of_rel.row_keys_array.find(e=>e==investor.stage_code)) result.strength_of_rel.row_keys_array.push(investor.stage_code);
      // toggle this to UN-commented
      if(!result.strength_of_rel.row_keys_array.find(e=>e==investor.consolidatedStageCode)) {
        console.log(`pushing - ${investor.consolidatedStageCode}, for stage code: ${investor.stage_code}`);
        result.strength_of_rel.row_keys_array.push(investor.consolidatedStageCode);
      }
      if(!result.strength_of_rel.sub_table_keys.find(e=>e==investor.fund_code)) {
        result.strength_of_rel.sub_table_keys.push(investor.fund_code);
        result.strength_of_rel.table_heading_array.push({label: investor.fund?investor.fund.lookup_value:"Undefined", headerCols: strengthOfRelSubTableHeaders});
      }
      if(!result.strength_of_rel.data_obj["column1"]) result.strength_of_rel.data_obj["column1"] = {};
      // toggle this to commented
      // result.strength_of_rel.data_obj["column1"][investor.stage_code] = {0: investor.stage?investor.stage.lookup_value:"Undefined"};
      // if(!result.strength_of_rel.data_obj[investor.fund_code]||!result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code]) {
      //   if(!result.strength_of_rel.data_obj[investor.fund_code]) result.strength_of_rel.data_obj[investor.fund_code] = {};
      //   result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code] = {0: 1, 1: Number(investor.ticket_size!=''?investor.ticket_size:0)};
      //   result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code][2] = result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code][1];
      // }
      // else {
      //   result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code][0]++;
      //   result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code][1]+=Number(investor.ticket_size!=''?investor.ticket_size:0);
      //   result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code][2] = result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code][1]/result.strength_of_rel.data_obj[investor.fund_code][investor.stage_code][0];
      // }
      // toggle this to UN-commented
      result.strength_of_rel.data_obj["column1"][investor.consolidatedStageCode] = {0: investor.stage?investor.stage.lookup_value:"Undefined"};
      if(!result.strength_of_rel.data_obj[investor.fund_code]||!result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode]) {
        if(!result.strength_of_rel.data_obj[investor.fund_code]) result.strength_of_rel.data_obj[investor.fund_code] = {};
        result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode] = {0: 1, 1: Number(investor.ticket_size!=''?investor.ticket_size:0)};
        result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode][2] = result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode][1];
      }
      else {
        result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode][0]++;
        result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode][1]+=Number(investor.ticket_size!=''?investor.ticket_size:0);
        result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode][2] = Math.round(result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode][1]/result.strength_of_rel.data_obj[investor.fund_code][investor.consolidatedStageCode][0]*10)/10;
      }
    }
    if(investor.fund_code!='') {
      //if(!result.existing_inv_pipeline.row_keys_array.find(e=>e==investor.fund_code)) result.existing_inv_pipeline.row_keys_array.push(investor.fund_code);
      if(!result.existing_inv_pipeline.row_keys_array.find(e=>e.key==investor.fund_code)) result.existing_inv_pipeline.row_keys_array.push({key:investor.fund_code, order:investor.fund?investor.fund.display_order:99 });
      if(!result.existing_inv_pipeline.data_obj[investor.fund_code]) result.existing_inv_pipeline.data_obj[investor.fund_code] = {0: investor.fund?investor.fund.lookup_value:"Undefined", 1: 1, 2: Number(investor.ticket_size!=''?investor.ticket_size:0)};
      else {
        result.existing_inv_pipeline.data_obj[investor.fund_code][1]++;
        result.existing_inv_pipeline.data_obj[investor.fund_code][2]+=Number(investor.ticket_size!=''?investor.ticket_size:0);
      }
      // avg rel score section
      if(!result.avg_rel_score[investor.fund_code]) {
        result.avg_rel_score[investor.fund_code] = {totalInvestors: 0, totalInvestorRelScore: 0};
      }
      result.avg_rel_score[investor.fund_code]["totalInvestors"]++;
      result.avg_rel_score[investor.fund_code]["totalInvestorRelScore"]+= investorTotRelScore;
      // // guru 8-Jun-2020, defect - running calc will be correct only for the last one.
      // result.avg_rel_score[investor.fund_code]["avg_rel_score"] = result.avg_rel_score[investor.fund_code]["totalInvestorRelScore"]/result.avg_rel_score[investor.fund_code]["totalInvestors"];
      // result.avg_rel_score[investor.fund_code]["avg_rel_score"] = Math.round(result.avg_rel_score[investor.fund_code]["avg_rel_score"])+'%';
    }
    stageFlag = false;
    fundFlag = false;
    if(investor.stage_code!=''&&investor.stage_code!=null /*&&investor.interactions.length==0*/) {
      console.log(`Investor stage code: ${investor.stage_code} is not null.. consolidated stage code: ${investor.consolidatedStageCode}`);
      // toggle this to commented
      //if(!result.activity_levels.row_keys_array.find(e=>e==investor.stage_code)) {
        // result.activity_levels.row_keys_array.push(investor.stage_code);
        // result.activity_levels.data_obj[investor.stage_code] ={0: investor.stage?investor.stage.lookup_value:"Undefined", 1: 0, 2: 0, 3:0, 4:0};
        // toggle this to UN-commented
      console.log('activity levels row keys array: ', result.activity_levels.row_keys_array);
      if(!result.activity_levels.row_keys_array.find(e=>e==investor.consolidatedStageCode)) {
        console.log('consolidated stage code not found in keys array - pushing 2: ', investor.consolidatedStageCode);
        result.activity_levels.row_keys_array.push(investor.consolidatedStageCode);
        result.activity_levels.data_obj[investor.consolidatedStageCode] ={0: investor.stage?investor.stage.lookup_value:"Undefined", 1: 0, 2: 0, 3:0, 4:0};
        stageFlag = true;
      } else {
        console.log('consolidated stage code WAS found in keys array: ', investor.consolidatedStageCode);
        // 17-Nov-20, stageFlag should still be set to true..
        stageFlag = true;
      }
      // else the data remains same..
      console.log(`stage Flag is: - ${stageFlag} `);
      console.log(` result activity levels data obj for stage code: ${investor.consolidatedStageCode} is: `, result.activity_levels.data_obj[investor.consolidatedStageCode])
    }
    if(investor.fund_code!=''/*&&investor.interactions.length==0*/) {
      // if(!result.coverage_levels.row_keys_array.find(e=>e==investor.fund_code)) {
      //   result.coverage_levels.row_keys_array.push(investor.fund_code);
      if(!result.coverage_levels.row_keys_array.find(e=>e.key==investor.fund_code)) {
        result.coverage_levels.row_keys_array.push({key: investor.fund_code, order: investor.fund?investor.fund.display_order:99});
        result.coverage_levels.data_obj[investor.fund_code] ={0: investor.fund?investor.fund.lookup_value:"Undefined", 1: 1, 2: 0, 3: Number(investor.ticket_size!=''?investor.ticket_size:0), 4:0, 5:0};
      } else {
        result.coverage_levels.data_obj[investor.fund_code][1]++;
        console.log('Count -',result.coverage_levels.data_obj[investor.fund_code][1]);
        result.coverage_levels.data_obj[investor.fund_code][2]=result.coverage_levels.data_obj[investor.fund_code][1]/countinvestors;
        console.log ('total count - ',countinvestors);
        console.log('Value before %', result.coverage_levels.data_obj[investor.fund_code][2]);

        result.coverage_levels.data_obj[investor.fund_code][2] = Math.round(result.coverage_levels.data_obj[investor.fund_code][2]*100)+'%';
        console.log('Value  %', result.coverage_levels.data_obj[investor.fund_code][2]);

        result.coverage_levels.data_obj[investor.fund_code][3]+= Number(investor.ticket_size);
      }
      fundFlag = true;
    }
    
    if(investor.interactions.length>0) {
      // moved up....
      // if(investor.stage_code!='') {
      //   if(!result.activity_levels.data_obj[investor.stage_code]) result.activity_levels.data_obj[investor.stage_code] = {0: investor.stage?investor.stage.lookup_value:"Undefined", 1: 0, 2: 0, 3:0, 4:0};
      //   stageFlag = true;
      // }
      // if(investor.fund_code!='') {
      //   if(!result.coverage_levels.data_obj[investor.fund_code]) result.coverage_levels.data_obj[investor.fund_code] = {0: investor.fund?investor.fund.lookup_value:"Undefined", 1: 0, 2: 0, 3:0, 4:0};
      // }
      console.log(`Investor interactions length > 0 - ${investor.interactions.length} `);
      countCoveredinvestors++;
      if(fundFlag) {
        // covered %
        
        result.coverage_levels.data_obj[investor.fund_code][4]=countCoveredinvestors/result.coverage_levels.data_obj[investor.fund_code][3];
        result.coverage_levels.data_obj[investor.fund_code][4] = Math.round(result.coverage_levels.data_obj[investor.fund_code][4]*100)+'%';
        result.coverage_levels.data_obj[investor.fund_code][5]++;
      }
      for (const interaction of investor.interactions) {
        console.log(`interaction id: ${interaction.id}, interaction type code: ${interaction.interaction_type_code}, date: ${interaction.interaction_date}, team: ${interaction.team_code}`);
        if(stageFlag) {
          console.log(`stage flag is true, add to activity level data object`);
          // toggle this to commented
          // if(interaction.team_code=='IR') result.activity_levels.data_obj[investor.stage_code][1]++;
          // if(interaction.team_code=='DT') result.activity_levels.data_obj[investor.stage_code][2]++;
          // if(interaction.interaction_type_code=='DT_ROADSHOW_VCS') result.activity_levels.data_obj[investor.stage_code][3]++;
          // if(interaction.interaction_type_code=='DT_SITE_VISIT') result.activity_levels.data_obj[investor.stage_code][4]++;
          // toggle this to UN-commented
          if(interaction.team_code=='IR') result.activity_levels.data_obj[investor.consolidatedStageCode][1]++;
          if(interaction.team_code=='DT') result.activity_levels.data_obj[investor.consolidatedStageCode][2]++;
          if(interaction.interaction_type_code=='DT_ROADSHOW_VCS') result.activity_levels.data_obj[investor.consolidatedStageCode][3]++;
          if(interaction.interaction_type_code=='DT_SITE_VISIT') result.activity_levels.data_obj[investor.consolidatedStageCode][4]++;
          console.log(`Activity level daa object`, result.activity_levels.data_obj[investor.consolidatedStageCode]);
        } else {
          console.log(`stage flag is false, nothing happens..`);
        }
      }
    } else {
      console.log(`Investor interactions length == 0 - ${investor.interactions.length} `);
    }
  }
  // guru 8-Jun-2020, covarage_level %age needs to be done here outside the loop.
  for (const coverageRow of result.coverage_levels.row_keys_array) {
    result.coverage_levels.data_obj[coverageRow.key][2] = result.coverage_levels.data_obj[coverageRow.key][1]/countinvestors;
    result.coverage_levels.data_obj[coverageRow.key][2] = Math.round(result.coverage_levels.data_obj[coverageRow.key][2]*100)+'%';

    //result.coverage_levels.data_obj[coverageRow.key][4] = countCoveredinvestors/result.coverage_levels.data_obj[coverageRow.key][3];
    result.coverage_levels.data_obj[coverageRow.key][4] = result.coverage_levels.data_obj[coverageRow.key][5]/result.coverage_levels.data_obj[coverageRow.key][1];
    result.coverage_levels.data_obj[coverageRow.key][4] = Math.round(result.coverage_levels.data_obj[coverageRow.key][4]*100)+'%';
  }
  console.log('result.avg_rel_score: ', result.avg_rel_score);
  console.log('result.strength_of_rel: ', result.strength_of_rel);
  console.log('result.existing_inv_pipeline.row_keys_array: ', result.existing_inv_pipeline.row_keys_array);
  for (const fundRow of result.existing_inv_pipeline.row_keys_array) {
    result.avg_rel_score[fundRow.key]["avg_rel_score"] = result.avg_rel_score[fundRow.key]["totalInvestorRelScore"]/result.avg_rel_score[fundRow.key]["totalInvestors"];
    result.avg_rel_score[fundRow.key]["avg_rel_score"] = Math.round(result.avg_rel_score[fundRow.key]["avg_rel_score"]*10)/10;
    //result.avg_rel_score[fundRow.key]["avg_rel_score"] = Math.round(result.avg_rel_score[fundRow.key]["avg_rel_score"]*100)+'%';
  }
  function sortKeyObjArr(a, b) {if(a.order>b.order) return 1; if(a.order<b.order) return -1; return 0;}
  // console.log('result.coverage_levels.row_keys_array before sort');
  // console.log(result.coverage_levels.row_keys_array);
  result.coverage_levels.row_keys_array.sort(sortKeyObjArr);
  // console.log('after sort');
  // console.log(result.coverage_levels.row_keys_array);
  result.coverage_levels.row_keys_array = result.coverage_levels.row_keys_array.map(e=>e.key);
  result.existing_inv_pipeline.row_keys_array.sort(sortKeyObjArr);
  result.existing_inv_pipeline.row_keys_array = result.existing_inv_pipeline.row_keys_array.map(e=>e.key);
  result.otherData = {"noOfInvestors": countinvestors, "totalTicketSize:": totalTicketSize, "coveredInvestors": countCoveredinvestors};
  return {status: "success", messages: [], data: result};
}

async function updateExistingInvestor(userData, existingInvestorId, existingInvestorData) {
  if(!userData || !userData.id || userData.id=='') {
    return {status: 'error', messages: ['Owner User Id is mandatory to create existing investor'], data: null};
  }

  if(existingInvestorId=='') {
    return {status: 'error', messages: ['Existing investor id is mandatory for update'], data: null};
  }
  // find the existing investor data for the id passed
  let existingInvestor = await db.ExistingInvestor.findOne({
    where: {id: existingInvestorId}
  });
  console.log('Old_investor',existingInvestor);
  console.log('new_investor',existingInvestorData);
  if(!existingInvestor) {
    return {status: 'error', messages: ['Existing Investor id is invalid'], data: null};
  }
  // this check should be on the queried data..
  if(existingInvestor.owner_employee_id != userData.id) {
    return {status: 'error', messages: ['This existing investor does not belong to logged in user, update not possible'], data: null};
  }
  // TODO: validations need to be added...
  // only some fields can be updated..
  let dirtyFlag = false;
  let changeArr = [];
  if(existingInvestorData.stage_code != existingInvestor.stage_code) {
    changeArr.push({field:'stage_code',old:existingInvestor.stage_code,new:existingInvestorData.stage_code});
    existingInvestor.stage_code = existingInvestorData.stage_code;
    dirtyFlag=true;
  }
  if(existingInvestorData.fund_raise_stage_code != existingInvestor.fund_raise_stage_code){ 
      changeArr.push({field:'fund_raise_stage_code',old:existingInvestor.fund_raise_stage_code,new:existingInvestorData.fund_raise_stage_code});
      existingInvestor.fund_raise_stage_code = existingInvestorData.fund_raise_stage_code;
      dirtyFlag=true;
    }
  if(existingInvestorData.ticket_size != existingInvestor.ticket_size){
      changeArr.push({field:'ticket_size',old:existingInvestor.ticket_size,new:existingInvestorData.ticket_size}); 
      existingInvestor.ticket_size= existingInvestorData.ticket_size;
      dirtyFlag=true;
    }
  if(existingInvestorData.share_of_wallet_code != existingInvestor.share_of_wallet_code){ 
      changeArr.push({field:'share_of_wallet_code',old:existingInvestor.share_of_wallet_code,new:existingInvestorData.share_of_wallet_code});
      existingInvestor.share_of_wallet_code = existingInvestorData.share_of_wallet_code;
      dirtyFlag=true;
    }
  if(existingInvestorData.share_of_wallet_comment != existingInvestor.share_of_wallet_comment){ 
      changeArr.push({field:'share_of_wallet_comment',old:existingInvestor.share_of_wallet_comment,new:existingInvestorData.share_of_wallet_comment});
      existingInvestor.share_of_wallet_comment = existingInvestorData.share_of_wallet_comment;
      dirtyFlag=true;
    }
  if(existingInvestorData.investment_performance_code != existingInvestor.investment_performance_code){
     changeArr.push({field:'investment_performance_code',old:existingInvestor.investment_performance_code,new:existingInvestorData.investment_performance_code});
     existingInvestor.investment_performance_code = existingInvestorData.investment_performance_code;
     dirtyFlag=true;
   }
  if(existingInvestorData.investment_performance_comment != existingInvestor.investment_performance_comment){
    changeArr.push({field:'investment_performance_comment',old:existingInvestor.investment_performance_comment,new:existingInvestorData.investment_performance_comment}); 
    existingInvestor.investment_performance_comment = existingInvestorData.investment_performance_comment;
    dirtyFlag=true;
    }
  if(existingInvestorData.working_level_support_code != existingInvestor.working_level_support_code){ 
      changeArr.push({field:'working_level_support_code',old:existingInvestor.working_level_support_code,new:existingInvestorData.working_level_support_code});
      existingInvestor.working_level_support_code = existingInvestorData.working_level_support_code;
      dirtyFlag=true;
    }
  if(existingInvestorData.working_level_support_comment != existingInvestor.working_level_support_comment){ 
    changeArr.push({field:'working_level_support_comment',old:existingInvestor.working_level_support_comment,new:existingInvestorData.working_level_support_comment});
    existingInvestor.working_level_support_comment = existingInvestorData.working_level_support_comment;
    dirtyFlag=true;       
    }
  if(existingInvestorData.senior_level_connect_code != existingInvestor.senior_level_connect_code){ 
      changeArr.push({field:'senior_level_connect_code',old:existingInvestor.senior_level_connect_code,new:existingInvestorData.senior_level_connect_code});
      existingInvestor.senior_level_connect_code = existingInvestorData.senior_level_connect_code;
      dirtyFlag=true;
    }
  if(existingInvestorData.senior_level_connect_comment != existingInvestor.senior_level_connect_comment){ 
      changeArr.push({field:'senior_level_connect_comment',old:existingInvestor.senior_level_connect_comment,new:existingInvestorData.senior_level_connect_comment});
      existingInvestor.senior_level_connect_comment = existingInvestorData.senior_level_connect_comment;
      dirtyFlag=true;
    }
  if(existingInvestorData.subjective_factor_code != existingInvestor.subjective_factor_code){
    changeArr.push({field:'subjective_factor_code',old:existingInvestor.subjective_factor_code,new:existingInvestorData.subjective_factor_code});
    existingInvestor.subjective_factor_code = existingInvestorData.subjective_factor_code;
    dirtyFlag=true;
   }
  if(existingInvestorData.subjective_factor_comment != existingInvestor.subjective_factor_comment){
     changeArr.push({field:'subjective_factor_comment',old:existingInvestor.subjective_factor_comment,new:existingInvestorData.subjective_factor_comment});
     existingInvestor.subjective_factor_comment = existingInvestorData.subjective_factor_comment;
     dirtyFlag=true;
   }

   if(dirtyFlag){
     changeArr.push({field:'updated_by',old:existingInvestor.updated_by,new:userData.id});
     console.log('existingInvestor update, something was changed, set updated by and save..');
     existingInvestor.updated_by = userData.id;
     await existingInvestor.save();
     await db.ExistingInvestorChangeLog.create({existing_investor_id:existingInvestorId,change_json:changeArr,updated_by:userData.id});
   }
   else{
     console.log('Nothing to update...');
   }
   return {status: 'success', messages: [], data: existingInvestor};  
}

async function createExistingInvestor(userData, existingInvestorData) {
  // if(!userData || !userData.id || userData.id=='') {
  //   return {status: 'error', messages: ['Owner User Id is mandatory to create Existing Investor'], data: null}
  // }
  // if(!existingInvestorData.owner_employee_id || existingInvestorData.owner_employee_id =='') {
  //   existingInvestorData.owner_employee_id = userData.id;
  // }
  let validatedFlag = true;
  let errors = [];
  let errorMessages = [];
  let errorFields = [];
  let errObj = {};
  let valRes;

  console.log(' existing investor data to check owner employee id',existingInvestorData.owner_email);
  console.log('create existing investor fn: check existing investor owner');
  valRes = await validateExistingInvestorOwner(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor owner error, exit');
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }

  console.log('create existingInvestor fn: check existing investor name');
  valRes = await validateExistingInvestorName(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn:  existing investor name error, exit');
      //errObj = {fieldName: 'existingInvestor_name', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create  existing investor fn: check  existing investor primary office');
  valRes = await validateExistingInvestorPrimaryOffice(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor primary office error, exit');
      //errObj = {fieldName: 'primary_office_city', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor region');
  valRes = await validateExistingInvestorRegion(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor primary region, exit');
      //errObj = {fieldName: 'region', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor fund');
  valRes = await validateExistingInvestorFund(existingInvestorData);
  console.log('back from validateExistingInvestorFund, result: ', valRes);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor fund, exit');
      //errObj = {fieldName: 'fund_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor category');
  valRes = await validateExistingInvestorCategory(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor category, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor stage code');
  valRes = await validateExistingInvestorStage(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor  stage code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor Fund stage code');
  valRes = await validateExistingInvestorFundRaiseStage(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor Fund stage code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor share of wallet code');
  valRes = await validateExistingInvestorShareOfWallet(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor share of wallet code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor investment performance code');
  valRes = await validateExistingInvestorInvestmentPerformance(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor investment performance code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor working level support code');
  valRes = await validateExistingInvestorWorkingLevelSupport(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor working level support code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  console.log('create existing investor fn: check existing investor senior level connect code');
  valRes = await validateExistingInvestorSeniorLevelConnect(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor senior level connect code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }
  
  console.log('create existing investor fn: check existing investor subjective factor code');
  valRes = await validateExistingInvestorSubjectiveFactor(existingInvestorData);
  if(valRes.status=='error') {
      validatedFlag = false;
      console.log('create existing investor fn: existing investor subjective factor code, exit');
      //errObj = {fieldName: 'category_code', message: valRes.messages[0]};
      errObj = valRes.data.errObj;
      errors.push(errObj);
      errorMessages.push(errObj.message);
      if(errObj.fieldName) errorFields.push(errObj.fieldName);
  }


  if(!validatedFlag) {
    return {status: 'error', messages: errorMessages, data:{errorFields: errorFields, errorObjArr: errors}};
  }
  console.log('create existing investor: All validations are passed, create the existing investor now..');
  console.log('Revised data: ', existingInvestorData);
  existingInvestorData.created_by = userData.id;
  let existingInvestor = await db.ExistingInvestor.create(existingInvestorData);
  console.log('create existing investor result: ', existingInvestor)
  return {status: "success", messages: [], data: existingInvestor};
}
async function validateExistingInvestorOwner(existingInvestorData) {
  // check if owner_employee_id is passed, use it, check validity 
  // else check if owner_email is passed, use it, check validity, derive owner_employee_id from email
  if(existingInvestorData.owner_email&&existingInvestorData.owner_email!='') {
    let checkEmp = await db.Employee.findOne({
      where: {
        email: existingInvestorData.owner_email
      }
    });
    if(!checkEmp) {
      let errObj = {fieldName: 'owner_email', message: 'Invalid Owner Email'};
      return {status: 'error', messages: ['Owner Employee'], data: {errObj: errObj}};
    }
    existingInvestorData.owner_employee_id = checkEmp.id;
  }

  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(existingInvestorData, 'owner_employee_id', 'Owner');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'owner_employee_id', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  
  return {status: 'success', messages: []};
}
async function validateExistingInvestorName(existingInvestorData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(existingInvestorData, 'investor_name', 'Investor Name');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'investor_name', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  // check for duplicate:
  let checkExistingInvestor = await db.ExistingInvestor.findOne({
    where: {
        investor_name: existingInvestorData.investor_name
      }
    });
    if(checkExistingInvestor) {
      let errObj = {fieldName: 'investor_name', message: 'Duplicate Investor'};
      return {status: 'error', messages: ['Duplicate Investor'], data: {errObj: errObj}};
    }
    return {status: 'success', messages: []};
}
async function validateExistingInvestorPrimaryOffice(existingInvestorData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(existingInvestorData, 'primary_office_city', 'Primary Office or City');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'primary_office_city', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  return {status: 'success', messages: []};
}
async function validateExistingInvestorRegion(existingInvestorData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(existingInvestorData, 'region', 'Region');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'region', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  return {status: 'success', messages: []};
}

async function validateExistingInvestorFund(existingInvestorData) {
  /*
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(existingInvestorData, 'fund_code', 'Fund Code');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'fund_code', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  */
  if(!existingInvestorData.fund_code || existingInvestorData.fund_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.fund_code, 'FUND_CODES', 'Fund Code');
  console.log('back from validateCLV, result: ', checkCLVRes);
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'fund_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateExistingInvestorCategory(existingInvestorData) {
  let mandatoryCheckRes = await utilCtl.validateBasicMandatory(existingInvestorData, 'category_code', 'Category Code');
  if(mandatoryCheckRes.status=='error') {
    let errObj = {fieldName: 'category_code', message: mandatoryCheckRes.messages[0]};
    mandatoryCheckRes.data = {errObj: errObj};
    return mandatoryCheckRes;
  }
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.category_code, 'CATEGORY_CODES', 'Category Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'category_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}

async function validateExistingInvestorStage(existingInvestorData) {
  if(!existingInvestorData.stage_code || existingInvestorData.stage_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.stage_code, 'STAGE_CODES', 'Stage Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'stage_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}

async function validateExistingInvestorFundRaiseStage(existingInvestorData) {
  if(!existingInvestorData.fund_raise_stage_code || existingInvestorData.fund_raise_stage_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.fund_raise_stage_code, 'FUND_RAISE_STAGE_CODES', 'Fund Raise Stage Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'fund_raise_stage_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateExistingInvestorShareOfWallet(existingInvestorData) {
  if(!existingInvestorData.share_of_wallet_code || existingInvestorData.share_of_wallet_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.share_of_wallet_code, 'SHARE_OF_WALLET_CODES', 'share of wallet Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'share_of_wallet_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};  
}
async function validateExistingInvestorInvestmentPerformance(existingInvestorData) {
  if(!existingInvestorData.investment_performance_code || existingInvestorData.investment_performance_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.investment_performance_code, 'INVESTMENT_PERFORMANCE_CODES', 'Investment Performance Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'investment_performance_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateExistingInvestorWorkingLevelSupport(existingInvestorData) {
  if(!existingInvestorData.working_level_support_code || existingInvestorData.working_level_support_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.working_level_support_code, 'WORKING_LEVEL_SUPPORT_CODES', 'Working Level Support Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'working_level_support_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateExistingInvestorSeniorLevelConnect(existingInvestorData) {
  if(!existingInvestorData.senior_level_connect_code || existingInvestorData.senior_level_connect_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.senior_level_connect_code, 'SENIOR_LEVEL_CONNECT_CODES', 'Senior Level Connect Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'senior_level_connect_code', message: checkCLVRes.messages[0]};
    checkCLVRes.data = {errObj: errObj};
    return checkCLVRes;
  }
  return {status: 'success', messages: []};
}
async function validateExistingInvestorSubjectiveFactor(existingInvestorData) {
  if(!existingInvestorData.subjective_factor_code || existingInvestorData.subjective_factor_code=='') return {status: 'success', messages: []};
  let checkCLVRes = await utilCtl.validateCLV(existingInvestorData.subjective_factor_code, 'SUBJECTIVE_FACTOR_CODES', 'Subjective Factor Code');
  if(checkCLVRes.status=='error') {
    let errObj = {fieldName: 'subjective_factor_code', message: checkCLVRes.messages[0]};
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
      return {status: 'error', messages:['Unable to find User info from logged in user, please contact support'], data: {}};
  }

  let existingInvestorDataWithResultObjArr = [];
  for (const existingInvestorDataObj of dataObjArr) {
      console.log(`process data loop for data: `, existingInvestorDataObj);
      let retData = await createExistingInvestor(userData, existingInvestorDataObj);
      let retDataObjPart;

      if(retData.status=='success') {
          //retDataObjPart = {existingInvestor: retData.data.existingInvestor, companyEmployeeRelative: retData.data.companyEmployeeRelative};
          //retDataObjPart = {userId: retData.data.existingInvestor.id, empId: retData.data.companyEmployeeRelative.id, userUrl: config.hostForActivation+'/ia/'+retData.data.existingInvestor.token};
          retDataObjPart = {existingInvestorId: retData.data.id, 
                            investorName: retData.data.investor_name, 
                            primaryOfficeCity: retData.data.primary_office_city,
                            region: retData.data.region,
                            fundCode: retData.data.fund_code,
                            stagCode: retData.data.category_code,
                           };

      } else {
          retDataObjPart = retData.data;
      }
      let dataObj = {
          inputData: existingInvestorDataObj
          , status: retData.status
          , messages: retData.messages
          , data: retDataObjPart
      }
      existingInvestorDataWithResultObjArr.push(dataObj);
      //res.json({status: retData.status, messages: retData.messages, data: retDataObjPart});
  }
  return existingInvestorDataWithResultObjArr;
}
async function convertLineDataArrToDataObj(arrayOfDataArr) {
  console.log('In convert line data array into data obj for existingInvestor creation', arrayOfDataArr);
  let dataObjArr = [];
  dataObjArr = arrayOfDataArr.map(e => {return {sr : e[0], owner_email : e[1], investor_name:e[2], primary_office_city: e[3], region:e[4], fund_code:e[5], category_code :e[6]}});
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
  console.log('We are on writeLinesAndMessagesData..');
  let hdr = '#, Owner email, existingInvestor name, primary office city, region, Fund code, category code, Error Massage \r\n';

  let rand = Math.floor(Math.random() * 10000000);
  //let filePath = __basedir+'/uploads/';
  let filePath = config.uploadDirectory;
  //let filePath = '/home/guru/tn/inv/inv-api/csv-files/';

  let fileName = rand+'.csv'; 
  console.log('file..',filePath+fileName);

  //let outFileName = 'uploads/'+rand+'.bad';
  let outFileName = filePath+fileName;
  console.log('writeLinesAndMessagesData bad file name: ', outFileName);
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
  async getExistingInvestorNames(req, res) {
    console.log('get Existing Investor names: going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    console.log('get existing investor names, User data from req: ', userData);
    console.log('get existing investor names, going to call function with owner id: ', userData.id);
    let existingInvestorNamesRetData = await getExistingInvestorNames(userData.id);
    console.log('get existing investor names: returned, send response.. ');
    //console.log('get existingInvestor names: returned data: ', existingInvestorNamesRetData);
    res.json(existingInvestorNamesRetData);
    return;
  },
  async getExistingInvestorById(req, res) {
    console.log('get existing investor by Id: going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let existingInvestorId = req.params.id;
    console.log('get existing investor by Id, User data from req: ', userData);
    console.log('get existing investor by Id, going to call function with user and existing investor id: ');
    let existingInvestorRetData = await getExistingInvestorById(userData, existingInvestorId);
    console.log('get existing investor by id: returned.. respond to client ');
    //console.log('get  existing investor by id: returned data: ', existingInvestorRetData);
    res.json(existingInvestorRetData);
    return;
  },
  async getAllExistingInvestorsDashboard(req, res) {
    console.log('get existing investor by Id: going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let allFlag = req.query.all_flag=='Y'?true:false;
    console.log('get existing investor dashboard, User data from req: ', userData);
    console.log('get existing investor dashboard, going to call function with user and existing investor id: ');
    let existingInvestorRetData = await getAllExistingInvestorsDashboard(userData, allFlag);
    console.log('get existing investor dashboard: returned.. respond to client ');
    //console.log('get  existing investor by id: returned data: ', existingInvestorRetData);
    res.json(existingInvestorRetData);
    return;
  },
  async createExistingInvestor(req, res) {
    console.log('create existing investor : going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let userData = userRetData.data;
    let existingInvestorData = req.body;
    console.log('create existing investor, User data from req: ', userData);
    console.log('create existing investor, going to call function with user and existing investor data: ');
    let existingInvestorRetData = await createExistingInvestor(userData, existingInvestorData);
    console.log('create existing investor: returned data: ', existingInvestorRetData);
    res.json(existingInvestorRetData);
    return;
  },
  async updateExistingInvestor(req, res) {
    console.log('update existing investor : going to get user info');
    let userRetData = await auth.getUserDataFromReq(req);
    if(userRetData.status=='error') {
      res.json(userRetData);
      return;
    }
    let existingInvestorId = req.params.id;
    let userData = userRetData.data;
    let existingInvestorData = req.body;
    console.log('update existing investor, User data from req: ', userData);
    console.log('update existing investor, going to call function with user and existing investor data: ');
    let existingInvestorRetData = await updateExistingInvestor(userData, existingInvestorId, existingInvestorData);
    console.log('update existing investor: returned data: ', existingInvestorRetData);
    res.json(existingInvestorRetData);
    return;
  },
  async existingInvestorsReport(req, res) {
    console.log('controllers/existing investor 1 - existingInvestorsReport'); 
    try {
        console.log('controllers/existing investor/existingInvestorsReport 2 - pre auth'); 
        
        let user = {};
        let report_name;

        let userRetData = await auth.getUserDataFromReq(req);
        if(userRetData.status=='error') {
          res.json(userRetData);
          return;
        }
        let userData = userRetData.data;
        console.log('existing investor report, User data from req: ', userData);
        console.log('existing investor report, owner id: ', userData.id);

        let reportLevelMetaData = {title: 'Existing Investor Report', description: 'This report gives Existing Investors data.', dataExport:true};

        let metaDataObj = [
          {name: "Investor Name", key: "investor_name", type: "text", format: "", display:'Y'},
          {name: "Office", key: "primary_office_city", type: "text", format: "", display:'N'},
          {name: "Region", key: "region", type: "text", format: "", display:'N'},
          {name: "Category Code", key: "category_code", type: "text", format: "", display:'N'},
          {name: "Category", key: "category", type: "text", format: "", display:'Y'},
          {name: "Fund", key: "fund", type: "text", format: "", display:'Y'},
          {name: "Fund Raise Stg Code", key: "fund_raise_stage_code", type: "text", format: "", display:'N'},
          {name: "Fund Raise Stge", key: "fund_raise_stage", type: "text", format: "", display:'Y'},
          {name: "Ticket Size ($M)", key: "ticket_size", type: "number", format: "", display:'Y'},
          {name: "Share of Wallet Code", key: "share_of_wallet_code", type: "text", format: "", display:'N'},
          {name: "Share of Wallet", key: "share_of_wallet", type: "text", format: "", display:'Y'},
          {name: "Share of Wallet Comment", key: "share_of_wallet_comment", type: "text", format: "", display:'N'},
          {name: "Investment Performance Code", key: "investment_performance_code", type: "text", format: "", display:'N'},
          {name: "Investment Performance", key: "investment_performance", type: "text", format: "", display:'Y'},
          {name: "Investment Performance Comment", key: "investment_performance_comment", type: "text", format: "", display:'N'},
          {name: "Working Level Support Code", key: "working_level_support_code", type: "text", format: "", display:'N'},
          {name: "Working Level Support", key: "working_level_support", type: "text", format: "", display:'Y'},
          {name: "Working Level Support Comment", key: "working_level_support_comment", type: "text", format: "", display:'N'},
          {name: "Senior Level Connect Code", key: "senior_level_connect_code", type: "text", format: "", display:'N'},
          {name: "Senior Level Connect", key: "senior_level_connect", type: "text", format: "", display:'Y'},
          {name: "Senior Level Connect Comment", key: "senior_level_connect_comment", type: "text", format: "", display:'N'},
          {name: "Subjective Factor Code", key: "subjective_factor_code", type: "text", format: "", display:'N'},
          {name: "Subjective Factor", key: "subjective_factor", type: "text", format: "", display:'Y'},
          {name: "Subjective Factor Comment", key: "subjective_factor_comment", type: "text", format: "", display:'N'},
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
          {name: "Relation Score", key: "total_relationship_score", type: "text", format: "", display:'Y'},
        ]

        queryStr = "select ei.id, ei.owner_employee_id "
                    +" , ei.investor_name, ei.primary_office_city, ei.region "
                    //+" , ei.investor_name, ei.region "
                    +" , fund_code, fund_clv.lookup_value as fund, stage_code, category_code, cat_clv.lookup_value as category "
                    +" , fund_raise_stage_code, fund_raise_clv.lookup_value as fund_raise_stage"
                    +" , ei.ticket_size "
                    +" , share_of_wallet_code, share_of_wallet_comment, share_wal_clv.lookup_value as share_of_wallet "
                    +" , investment_performance_code, investment_performance_comment, inv_perf_clv.lookup_value as investment_performance "
                    +" , working_level_support_code, working_level_support_comment, work_lvl_clv.lookup_value as working_level_support "
                    +" , senior_level_connect_code, senior_level_connect_comment, sr_lvl_conn_clv.lookup_value as senior_level_connect "
                    +" , subjective_factor_code, subjective_factor_comment, subj_fact_clv.lookup_value as subjective_factor "
                    +" , i.tot_team_update, i.tot_trips_update, i.tot_email_sent, i.tot_intro "
                    +" , i.tot_ir_team "
                    +" , i.tot_macro, i.tot_sector_update, i.tot_co_invest, i.tot_qtrly_update, i.tot_half_yr_updt, i.tot_road_show, i.tot_site_visit "
                    +" , i.tot_deal_team "
                    +" , e.full_name "
                    +" , cast(cast(case when share_of_wallet_code='' then null else share_of_wallet_code end as integer) "
                    +"   + cast(case when investment_performance_code ='' then null else investment_performance_code end as integer) "
                    +"   + cast(case when working_level_support_code ='' then null else working_level_support_code end as integer) "
                    +"   + cast(case when senior_level_connect_code ='' then null else senior_level_connect_code end as integer) "
                    +"   as varchar)||'%' as total_relationship_score "
                    +" from existing_investors ei "
                    +" join employees e on ei.owner_employee_id = e.id "
                    +" join common_list_values cat_clv on cat_clv.lookup_code = ei.category_code and cat_clv.list_code = 'CATEGORY_CODES' "
                    +" left join common_list_values fund_raise_clv on fund_raise_clv.lookup_code = fund_raise_stage_code and fund_raise_clv.list_code = 'FUND_RAISE_STAGE_CODES' "
                    +" left join common_list_values fund_clv on fund_clv.lookup_code = fund_code and fund_clv.list_code = 'FUND_CODES' "
                    +" left join common_list_values share_wal_clv on share_wal_clv.lookup_code = share_of_wallet_code and share_wal_clv.list_code = 'SHARE_OF_WALLET_CODES' "
                    +" left join common_list_values inv_perf_clv on inv_perf_clv.lookup_code = investment_performance_code and inv_perf_clv.list_code = 'INVESTMENT_PERFORMANCE_CODES' "
                    +" left join common_list_values work_lvl_clv on work_lvl_clv.lookup_code = working_level_support_code and work_lvl_clv.list_code = 'WORKING_LEVEL_SUPPORT_CODES' "
                    +" left join common_list_values sr_lvl_conn_clv on sr_lvl_conn_clv.lookup_code = senior_level_connect_code and sr_lvl_conn_clv.list_code = 'SENIOR_LEVEL_CONNECT_CODES' "
                    +" left join common_list_values subj_fact_clv on subj_fact_clv.lookup_code = subjective_factor_code and subj_fact_clv.list_code = 'SUBJECTIVE_FACTOR_CODES' "
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
                    +"     from interactions where client_type_code = 'EXISTING_INVESTOR' group by client_id "
                    +"   ) i on ei.id = i.client_id  "
                    +" where ei.owner_employee_id = :ownerId "
                ;

        console.log("controllers/existing investors/ report  4: query sting: ", queryStr);
        let queryData = await db.sequelize.query(queryStr, {replacements: {ownerId: userData.id}, type: db.sequelize.QueryTypes.SELECT});
        console.log('result length : ', queryData.length);
        res.json({status: 'success', data: {reportLevelMetaData: reportLevelMetaData, metaData: metaDataObj, reportData: queryData}});
        return;
    } catch(err) {
        console.log(err);
        res.json({status:'error', messages:['Error in existing investors report ']});
    }
  },
  //pooja 19-May-2020 file upload and insert
    async readFileData(req, res) {
      try {
          let data = req.body;
          let userId;
          console.log('req body: ', data);
          // if(data.test_mode && data.test_mode=='Y') {
          //     console.log('This is test mode.. get existingInvestor id from req body');
          //     if(data.user_id) {
          //         userId = data.user_id;
          //     } else {
          //         res.json({status: 'error', messages:['User id must be supplied in test mode']});
          //         return;
          //     }
          // } else {
          //     console.log('This is Real mode.. get existingInvestor id from req token');
          //     if(req.user && req.existingInvestor.id) userId = req.existingInvestor.id;
          //     else {
          //         res.json({status: 'error', messages:['Unable to get existingInvestor information, please contact support']});
          //         return;
          //     }
          // }
          // let existingInvestorData = await db.ExistingInvestor.findOne({
          //     where: {id: userId}
          // });
          // if(!existingInvestorData) {
          //     res.json({status: 'error', messages: ['Invalid existingInvestor information, please contact support.']});
          // }
          //let filePath = '/home/guru/tn/inv/inv-api/csv-files/';
          //let filePath = __basedir+'/csv-files/';

          let userRetData = await auth.getUserDataFromReq(req);
          if(userRetData.status=='error') {
            res.json(userRetData);
            return;
          }
          let userData = userRetData.data;
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
                  // temp: guru 31-May
        // console.log('going to send a dummy response...');
        // res.json({status:'success', messages:[]
        //           , data: {acceptedLineDataArr: 'acceptedLineStrings'
        //                   , rejectedLinesArr: []
        //                   , dataObjArr: []
        //                   , processedData: []
        //                   , stats: {
        //                       totalLines: 15
        //                       , totalLinesRejected: 5
        //                       , headerRowCount: 2
        //                       , totalLinesAccepted: 8
        //                       , totalErrored: 2
        //                       , totalSuccess: 6
        //                   },
        //                   files: {
        //                       rejectedDataFileId: 5
        //                       , errorDataFileId: 2
        //                       , successDataFileId: 1
        //                       // rejectedDataFileName: rejectedDataFileName
        //                       // , erroredDataFileName: errorDataFileName
        //                       // , successDataFileName: successDataFileName
        //                   }
        //                 }
        //               }
        //             );
        //   return;

          let acceptableColumnsCount = 7;
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
          let erroredLinesForWrite = erroredData.map(e => { return {data:e.inputData.sr+','+e.inputData.owner_email+','+e.inputData.investor_name+','+e.inputData.primary_office_city+','+e.inputData.region+','+e.inputData.fund_code+','+e.inputData.category_code
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
          
          let successDataForWrite = processedDataObjArr.filter(e => e.status=='success').map(e => { return {data: e.inputData.sr+','+e.inputData.owner_email+','+e.inputData.investor_name+','+e.inputData.primary_office_city+','+e.inputData.region+','+e.inputData.fund_code+','+e.inputData.category_code
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
          res.json({status:'error', messages:['Error in existingInvestor file ', err]});
      }
    }

};