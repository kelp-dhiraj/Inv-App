
const 
  nodemailer = require('nodemailer'),
  Email = require('email-templates'),
  mailerConfig = require('../config/mailer-config');

const PSTLogger = require('../utils/pst-logger');
const logger  = new PSTLogger('int-ad-users');

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

const db = require('../models');
let mails = []


db.MailQueue.update(
  { status: 'QUEUED' },
  { returning: true, where: { status: 'NEW' } }
)
  .then(
    (result) => {
      if (result) {
        logger.log('Processing ' + result.length + ' mails')
        mails = result[1];
        processMailQueue();
      }
    }
  )
  .catch(err => {
    logger.log('Error ' + err)
  })

processMailQueue = async function(){

  if (mails.length > 0) {
    let mail = mails[0];
    mails.splice(0,1)
    try {
      let mailResult = await mailer.send({
        template: mail.maildata.template,
        message: {
          to: mail.maildata.to || '',
          cc: mail.maildata.cc || ''
        },
        locals: mail.maildata.data || {}
      })
      if (mailResult) {
        mail.status = 'PROCESSED';
        mail.result = mailResult;
        mail.save();
      }
    } catch(err) {
      mail.status = 'ERRORED';
      mail.result = err;
      mail.save();
      logger.log('Error '+err)
    }

    setTimeout(processMailQueue, mailerConfig.timeBetweenSends);

  }

} 