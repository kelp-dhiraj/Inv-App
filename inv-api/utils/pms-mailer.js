const 
  nodemailer = require('nodemailer'),
  Email = require('email-templates'),
  mailerConfig = require('../config/mailer-config');

let transport = nodemailer.createTransport({
  host: mailerConfig.host,
  port: mailerConfig.port,
  auth: {
    user: mailerConfig.user,
    pass: mailerConfig.pass
  }
});

const mailer = new Email({
  views: {
    root: mailerConfig.templateRoot
  },
  message: {
    from: mailerConfig.from
  },
  send: true,
  transport: transport
});

mailer.init = function(){
  mailer._template = 'default';
  mailer._to = []; 
  mailer._cc = []; 
  mailer._data = {
    //applicationBaseUrl: mailerConfig.applicationBaseUrl
    extAppBaseUrl: mailerConfig.extAppBaseUrl,
    intAppBaseUrl: mailerConfig.intAppBaseUrl
  }; 
}
mailer.init()

mailer.to = function(to) {
  if (typeof to === 'undefined') return mailer._to;

  if (to.constructor === Array) this._to = to;
  else if (typeof to === 'string') this._to.push(to);
  return this;
}
mailer.cc = function(cc) {
  if (typeof cc === 'undefined') return mailer._cc;

  if (cc.constructor === Array) this._cc = cc;
  else if (typeof cc === 'string') this._cc.push(cc);
  return this;
}
mailer.template = function(template) {
  if (typeof template === 'undefined') return this._template;

  if (typeof template === 'string') this._template = template;
  return this;
}
mailer.data = function(var1, var2) {
  if (typeof var1 === 'undefined') return this._data;
  if (typeof var1 === 'object') Object.assign(this._data,var1); 
  else if (typeof var1 === 'string'  && typeof var2!== 'undefined') this._data[var1] = var2;
  return this;
}
mailer.sendMail = function(success, error) {
  if (typeof success !== 'function') success = console.log;
  if (typeof error !== 'function') error = console.error;

  console.log(this._data);
  mailer.send({
    template: this._template,
    message: {
      to: this._to.join(','),
      cc: this._cc.join(','),
    },
    locals: this._data
  })
  .then(success)
  .catch(error);
}

module.exports = mailer;
