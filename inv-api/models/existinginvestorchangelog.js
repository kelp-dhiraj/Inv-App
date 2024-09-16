'use strict';
module.exports = (sequelize, DataTypes) => {
  const ExistingInvestorChangeLog = sequelize.define('ExistingInvestorChangeLog', {
    id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
    existing_investor_id: DataTypes.INTEGER,
    change_json: DataTypes.JSON,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    tableName: 'existinginvestor_change_logs'
  });
  ExistingInvestorChangeLog.associate = function(models) {
    models.ExistingInvestorChangeLog.belongsTo(models.ExistingInvestor, {
      foreignKey: 'id',
      as: 'existinginvestor_data_id'
    });

  };
  return ExistingInvestorChangeLog;
};
