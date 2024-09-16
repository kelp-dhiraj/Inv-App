'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    user_id: DataTypes.INTEGER,
    role_code: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    enabled: DataTypes.BOOLEAN
  }, {
    tableName: 'user_roles'
  });
  UserRole.associate = function(models) {
    // associations can be defined here
  };
  return UserRole;
};
