'use strict';
module.exports = (sequelize, DataTypes) => {
  const FileDownload = sequelize.define('FileDownload', {
    uniqueid: DataTypes.STRING,
    base_path: DataTypes.STRING,
    file_name: DataTypes.STRING,
    uploaded_file_name: DataTypes.STRING,
    downloaded_by_id: DataTypes.INTEGER,
    downloaded: DataTypes.BOOLEAN
  }, {
    tableName: 'file_downloads'
  });
  
  FileDownload.associate = function(models) {
    // associations can be defined here
  };
  
  return FileDownload;
};
