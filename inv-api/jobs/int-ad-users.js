const 
  AzureGraphClient = require('azure-graph'),
  msRestAzure = require('ms-rest-azure');

const azureConfig = require('../config/azure-config');

const db = require('../models');
const moment = require('moment');

const PMSLogger = require('../utils/pms-logger');
const logger  = new PMSLogger('int-ad-users');

const PMSMail = require('../utils/pms-mailqueue');

msRestAzure.loginWithServicePrincipalSecret(
  azureConfig.applicationId, 
  azureConfig.applicationSecret, 
  azureConfig.activeDirectoryId, 
  { tokenAudience: 'graph', domain: azureConfig.activeDirectoryId }, 
  function (err, credentials, subscriptions) {
    if (err) {
      //console.log(err);
      logger.log('Azure Login Error: '+err);
      return;
    }
    var client = new AzureGraphClient(credentials, azureConfig.activeDirectoryId);

    getUsers(client)

  }
);

async function getUsers(client) {

  try {

    let userList = [];
    let result = await client.users.list();
    result.forEach(function(r) {
      userList.push(r)
    });

    while(result.odatanextLink) {
      result = await client.users.listNext(result.odatanextLink);
      result.forEach(function(r) { 
        userList.push(r);
      });
    }
    userList.forEach(processUser);

  } catch(error) {
    console.log(error);
  }
}

async function processUser(v) {
  try {

    //const allowedEmails = ['surya@truenorth.co.in', 'jolly@truenorth.co.in', 'mitesh@truenorth.co.in', 'guru@abc.com'];
    //console.log('Processing '+v.objectId+' '+v.mail);
    logger.log('Processing '+v.objectId+' '+v.mail);
    if(v.mail == 'pmstest1@truenorth.co.in') console.log('-_-_-_-_-_ Found pmstest1@truenorth.co.in -_-_-_-_-_-');
    if(v.mail == 'pmstest2@truenorth.co.in') console.log('-_-_-_-_-_ Found pmstest2@truenorth.co.in -_-_-_-_-_-');
    if(v.mail == 'pmstest3@truenorth.co.in') console.log('-_-_-_-_-_ Found pmstest3@truenorth.co.in -_-_-_-_-_-');
    if(v.mail == 'pmstest4@truenorth.co.in') console.log('-_-_-_-_-_ Found pmstest4@truenorth.co.in -_-_-_-_-_-');
    if(v.mail == 'pmstest5@truenorth.co.in') console.log('-_-_-_-_-_ Found pmstest5@truenorth.co.in -_-_-_-_-_-');

    if(v.givenName == 'pmstest1') console.log('-_-_-_-_-_ Found pmstest1 -_-_-_-_-_-', v);
    if(v.givenName == 'pmstest2') console.log('-_-_-_-_-_ Found pmstest2 -_-_-_-_-_-', v);
    if(v.givenName == 'pmstest3') console.log('-_-_-_-_-_ Found pmstest3 -_-_-_-_-_-', v);
    if(v.givenName == 'pmstest4') console.log('-_-_-_-_-_ Found pmstest4 -_-_-_-_-_-', v);
    if(v.givenName == 'pmstest5') console.log('-_-_-_-_-_ Found pmstest5 -_-_-_-_-_-', v);

    const allowedEmails = ['surya@truenorth.co.in', 'vishal@truenorth.co.in', 'mitesh@truenorth.co.in', 'pmstest1@truenorth.co.in', 'pmstest2@truenorth.co.in'];
    //console.log('Processing '+v.objectId+' '+v.mail);
    logger.log('Processing '+v.objectId+' '+v.mail);
    
    //dont process null data - more logic here
    let exists = allowedEmails.filter(ele => {return ele == v.mail }).length;
    //console.log(' exists result from array filter : ', exists);

    if(exists == 0) return;
    console.log(v.mail+' exists in allowed list.. check if user exists');


    if (
      !v.mail || (!v.surname && !v.givenName) || !v.accountEnabled ||
      v.surname == 'Admin' || v.surname == 'Helpdesk' || v.surname == 'Audit' ||
      v.surname == '1' || v.surname == 'Guest' || v.surname == 'Alerts' ||
      v.surname == 'Secretarial' || v.surname == 'Support' ||
      v.surname == 'User 2' || v.surname == 'User' || v.surname == '(PWC)'
    ) {
      console.log('Rejecting.. ', v.givenName, v.email, v.surname);
      return;
    }

    if(exists == 0) return;
    //console.log(v.mail+' check if user exists');

    //see if the profile already exists
    let emp = await db.Employee.findOne({
      where: {
        ad_oid: v.objectId
      }
    });
    //console.log('Back from employee check...');
    
    if (!emp) {
      //if not, create shell
      logger.log(' No emp with oid for email '+v.mail+' ...Creating Employee');
      console.log(' No emp with oid for email '+v.mail+' ...Creating Employee');
      let newEmp = await db.Employee.create({
        user_type: 'AD',
        user_status: 'ACTIVE',
        ad_oid: v.objectId,
        full_name: v.givenName+' '+v.surname,
        email: v.mail /*v.otherMails[0]*/
      });

      logger.log('New Profile Created, id: '+newEmp.id);
      console.log('new employee created: ', newEmp.id);

    } else {
      logger.log('Employee exists with oid for email '+v.mail+' ...No action..');
      console.log('Employee exists with oid for email '+v.mail+' ...No action..');
      return;

      if (v.accountEnabled && user.user_status =='INACTIVE') {
        logger.log('Reactivating Profile');
        user.user_status='ACTIVE';
        user.save().then(() => {console.log('user data savedi for user id:'+user.id)});

      }
    }
  } catch(error) {
    console.log(error);
  }
}


