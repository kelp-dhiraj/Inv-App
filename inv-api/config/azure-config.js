'use strict';


const tenantName    = 'truenorth.co.in'; //from azure Ad
const applicationId      = '82a27711-b598-46d5-b5c8-8bd0e0c157ef'; //'e39d9f16-66d3-478a-a2b5-203d465b22a2'; //of the registered application
const activeDirectoryId = '95706a18-beb5-4797-9ff7-f4043588be9d'; //Azure Active Directory Id
const applicationSecret = 'IFXDqKNKQOGHvs3@]CHP?1G6xR3@w196'; //'XDHfB1+uV/=m3W.k454bLhgG2KztWkxr'; //key from the application for auzre direcitory integration

//passport credentials
module.exports.credentials = {
  identityMetadata: `https://login.microsoftonline.com/${tenantName}/.well-known/openid-configuration`,
  clientID: applicationId,
  passReqToCallback: false
};

//signin by service principal credentials
module.exports.activeDirectoryId = activeDirectoryId;
module.exports.applicationId = applicationId;
module.exports.applicationSecret = applicationSecret; 
