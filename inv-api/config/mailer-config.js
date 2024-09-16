'use strict';

const host = "smtp.mailtrap.io"; //SMTP Server
const port = 2525; //smtp port
const user = "18d119e9032f31";//"b134d1bf6f72f5"; //smtp user id
const pass = "fa9b57ee01bbc8";//"5be1703a41a8eb"; //smtp password
const from = "admin@port-ability.co.in";
const templateRoot = '/home/guru/tn/inv/inv-api/emails';
const applicationBaseUrl = 'http://inv.truenorth.co.in';
//const intAppBaseUrl = 'http://dmc-int.truenorth.co.in';
//const extAppBaseUrl = 'http://dmc-ext.truenorth.co.in';
const timeBetweenSends = 2000;

module.exports.host = host;
module.exports.port = port;
module.exports.user = user; 
module.exports.pass = pass;
module.exports.from = from;
module.exports.templateRoot = templateRoot;
module.exports.applicationBaseUrl = applicationBaseUrl;
// module.exports.intAppBaseUrl = intAppBaseUrl;
// module.exports.extAppBaseUrl = extAppBaseUrl;
module.exports.timeBetweenSends = timeBetweenSends;
