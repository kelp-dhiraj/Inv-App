const db = require('../models');
const moment = require('moment');
const auth = require('./authorizations');

async function validateBasicMandatory(dataObj, keyName, fieldDesc) {
  if(!dataObj[keyName] || dataObj[keyName]=='') {
    return {status: 'error', messages: [`${fieldDesc} is mandatory`]};
  }
  return {status: 'success', messages: []};
}
async function validateCLV(lookupCode, listCode, fieldDesc) {
  let checkValFromCLV = await db.CommonListValue.findOne({
    where: {list_code: listCode
            , lookup_code: lookupCode
          }
        });
  if(!checkValFromCLV) {
    return {status: 'error', messages: [`Invalid ${fieldDesc}`]};
  }
  return {status: 'success', messages: []};
}

module.exports = {
  async validateBasicMandatory(dataObj, keyName, fieldDesc) {
    return validateBasicMandatory(dataObj, keyName, fieldDesc);
  },
  async validateCLV(lookupCode, listCode, fieldDesc) {
    return validateCLV(lookupCode, listCode, fieldDesc);
  }
}