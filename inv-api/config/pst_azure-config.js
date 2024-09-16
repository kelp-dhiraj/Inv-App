'use strict';


const tenantName    = 'truenorth.co.in'; //from azure Ad
const applicationId      = '754a0bb7-cbd1-4e9c-9d46-e3d002294aca'; //of the registered application
const activeDirectoryId = '95706a18-beb5-4797-9ff7-f4043588be9d'; //Azure Active Directory Id
const applicationSecret = 'S/Cu=*N8yV]XRPYboyq3dwwAcSrc9ej5'; //key from the application for auzre direcitory integration

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
