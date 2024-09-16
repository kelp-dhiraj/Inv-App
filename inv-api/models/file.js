'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    base_path: DataTypes.STRING,
    file_name: DataTypes.STRING,
    uploaded_file_name: DataTypes.STRING,
    uploaded_by_id: DataTypes.INTEGER
  }, {
    tableName: 'files'
  });
  
  File.associate = function(models) {
    // associations can be defined here
  };
  
  return File;
};
