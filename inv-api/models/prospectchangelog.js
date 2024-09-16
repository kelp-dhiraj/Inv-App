'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProspectChangeLog = sequelize.define('ProspectChangeLog', {
    id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
    prospect_id: DataTypes.INTEGER,
    change_json: DataTypes.JSON,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER
  }, {
    tableName: 'prospect_change_logs'
  });
  ProspectChangeLog.associate = function(models) {
    models.ProspectChangeLog.belongsTo(models.Prospect, {
      foreignKey: 'id',
      as: 'prospect_data_id'
    });

  };
  return ProspectChangeLog;
};
