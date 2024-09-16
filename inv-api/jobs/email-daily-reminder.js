const mailer = require('../utils/pst-mailer');

mailer
  .template('daily-reminder')
  .to('s.paul@port-ability.co.in')
  .cc('guru.dhar@port-ability.co.in')
  .data('name','Test');

mailer.sendMail(function(data){
  console.log(data.originalMessage);
}); 



//*/5 * * * * /usr/bin/node /home/pauser/projects/tn/pst/pst-jobs/email-daily-reminder.js


