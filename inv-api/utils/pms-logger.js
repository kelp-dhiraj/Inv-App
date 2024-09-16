const fs = require('fs');
const config=require('../config/config');

class PMSLogger {
  constructor(fileName) {
    let ts=new Date().toISOString();
    this.fileName = config.logDirectory + fileName + '-' + ts + '.log';
  }
  log(input) {
    let ts = new Date().toISOString();
    fs.appendFile(this.fileName, ts+':: '+input+"\n", (err) => {
      if (err) throw err;
    });
  }
}

module.exports = PMSLogger;