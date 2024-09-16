'use strict';
module.exports = (sequelize, DataTypes) => {
  const CommonListValue = sequelize.define('CommonListValue', {
    list_code: DataTypes.STRING,
    lookup_code: DataTypes.STRING,
    lookup_value: DataTypes.STRING,
    lookup_description: DataTypes.STRING,
    enabled: DataTypes.BOOLEAN,
    display_order: DataTypes.INTEGER
  }, {
    tableName: 'common_list_values'
  });
  CommonListValue.associate = function(models) {
    // associations can be defined here
  };
  return CommonListValue;
};
