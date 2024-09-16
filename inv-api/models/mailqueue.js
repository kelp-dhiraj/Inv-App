'use strict';
module.exports = (sequelize, DataTypes) => {
  const MailQueue = sequelize.define('MailQueue', {
    maildata: DataTypes.JSON,
    status: DataTypes.STRING,
    result: DataTypes.JSON
  }, {
    tableName: 'mailqueue'
  });

  return MailQueue;
};
