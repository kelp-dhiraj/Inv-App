const db = require('../models');

class PMSMail {
  constructor() {
    this.maildata = {};
    this._template = 'default';
    this._to = []
    this._cc = []
    this._data = {}
  }

  to(to) {
    if (typeof to === 'undefined') return mailer._to;
  
    if (to.constructor === Array) this._to = to;
    else if (typeof to === 'string') this._to.push(to);
    return this;
  }
  cc(cc) {
    if (typeof cc === 'undefined') return mailer._cc;
  
    if (cc.constructor === Array) this._cc = cc;
    else if (typeof cc === 'string') this._cc.push(cc);
    return this;
  }
  template(template) {
    if (typeof template === 'undefined') return this._template;
  
    if (typeof template === 'string') this._template = template;
    return this;
  }
  data(var1, var2) {
    if (typeof var1 === 'undefined') return this._data;
    if (typeof var1 === 'object') Object.assign(this._data,var1); 
    else if (typeof var1 === 'string'  && typeof var2!== 'undefined') this._data[var1] = var2;
    return this;
  }

  queue() {
    this.maildata  = {
      template: this._template,
      to: this._to.join(','),
      cc: this._cc.join(','),
      data: this._data
    }
    db.MailQueue.create({
      maildata: this.maildata,
      status: 'NEW'
    }).then(function(result){

    }).catch(function(error) {
      console.log(error);
    })
  }

} 

module.exports = PMSMail;