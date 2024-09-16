'use strict';
module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    email: DataTypes.STRING,
    full_name: DataTypes.STRING,
    token: DataTypes.STRING,
    ad_oid: DataTypes.STRING,
    user_status: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    enabled: DataTypes.BOOLEAN,
    supervisor_emp_id: DataTypes.INTEGER,
    hr_emp_id: DataTypes.INTEGER,
    is_admin: DataTypes.BOOLEAN,
    profile_picture: DataTypes.STRING,
    designation_code: DataTypes.STRING,
    department_code: DataTypes.STRING,
  }, {
    tableName: 'employees'
  });
  
  Employee.associate = function(models) {
    models.Employee.belongsTo(models.Employee, {
      foreignKey: 'supervisor_emp_id',
      as: 'sup'
    });
    models.Employee.belongsTo(models.Employee, {
      foreignKey: 'hr_emp_id',
      as: 'hr'
    });
    models.Employee.belongsTo(models.CommonListValue, {
      foreignKey: 'designation_code',
      targetKey: 'lookup_code',
      as: 'desg'
    });
    models.Employee.belongsTo(models.CommonListValue, {
      foreignKey: 'department_code',
      targetKey: 'lookup_code',
      as: 'dept'
    });
  };
  
  return Employee;
};
