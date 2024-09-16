const db = require('../models');
const auth = require('./authorizations');
const formidable = require('formidable');
const uuidv1 = require('uuid/v1');
const config = require('../config/config');
const uploadDirectory = require('../config/config').uploadDirectory;
const fs = require('fs');

const csvDirectory = require('../config/config').csvDirectory; // /home/guru/tn/dmc/dmc-api/csv-files/

module.exports = {
  async downloadCSV(req, res) {
    let basePath = config.base_path
    try {
      let fileName = req.params.id;
      fs.exists(csvDirectory + fileName, function(exists){
        if (exists) {
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=report.csv"
          });
          fs.createReadStream(csvDirectory + fileName).pipe(res);
        } else {
          res.writeHead(400, {"Content-Type": "text/plain"});
          res.end("ERROR File does not exist");
        }
      });
    } catch(err) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("System Error");
    }
  },
  async upload2(req, res) {

    try {
      const form = new formidable.IncomingForm();
      const user = await auth.user(req);

      let files = [], result = {};

      form.parse(req);

      form.on('fileBegin', function (name, file){

        let uniqeFileName = uuidv1();
        file.uniqeFileName = uniqeFileName;
        file.path = uploadDirectory + file.uniqeFileName;

      });

      form.on('file', function (name, file){
        
        let data = {
          base_path: uploadDirectory,
          file_name: file.uniqeFileName,
          uploaded_file_name: file.name,
          uploaded_by_id: user.id
        };
        
        files.push(data);

      });

      form.on('end', ()=> {

        db.File.bulkCreate(files, {returning: true})
          .then(ids => {
            result['status'] = 'success';
            result['data'] = ids.map(d=>({ id: d.id, uploaded_file_name: d.uploaded_file_name }));
            res.json(result);
          });

      });



      form.on('aborted', function () {
        console.log('aborted');
        //return throwError(new Error(`当前请求被用户发出中止时！`));
      });

    } catch(err) {
      res.json({status:'error', message: err});
    }
  },

  async upload(req, res) {
    console.log('starting upload')
    try {
      const user = await auth.user(req);

      let filesData = [], result = {};

      for (var key in req.files) {
        if (req.files.hasOwnProperty(key)) {

          let file = req.files[key]

          let uniqeFileName = uuidv1();
        
          let data = {
            base_path: uploadDirectory,
            file_name: uniqeFileName,
            uploaded_file_name: file.name,
            uploaded_by_id: user.id
          };
          console.log(file.path)
          fs.renameSync(file.path, `${uploadDirectory}${uniqeFileName}`);
          //fs.unlinkSync(file.path);

          filesData.push(data);
        }
      }

      db.File.bulkCreate(filesData, {returning: true})
      .then(data => {
        result['status'] = 'success';
        result['data'] = data.map(d=>({ id: d.id, uploaded_file_name: d.uploaded_file_name }));
        res.json(result);
      });

    } catch(err) {
      console.log(err)
      res.json({status:'error', message: err});
    }
  },
  
  async getTemporaryId(req, res) {
    try {
      const user = await auth.user(req);

      let fileId = req.params.id;
  
      let file = await db.File.findOne({
        where: {
          id: fileId
        },
        raw: true
      });
      if (file && file.id) {
        file['id'] = null;
        file['uniqueid'] = uuidv1();
        file['downloaded_by_id'] = user.id;
        file['downloaded'] = false;
        let downloadFile = await db.FileDownload.create(file);
  
        res.json({status: 'success', data:{uniqueid: downloadFile.uniqueid}});
      } else {
  
        res.json({status: 'error', messages:['Invalid Access']});
  
  
      }
    } catch(err) {
      console.log(err)
      res.json({status:'error', message: err});
    }


  },

  async download(req, res) {
    try {
      let fileId = req.params.id;
      let file = await db.FileDownload.findOne({
        where: {
          uniqueid: fileId,
          downloaded: false
        }
      });
      if (!file) {
        res.writeHead(400, {"Content-Type": "text/plain"});
        res.end("Invalid Request");
      }
      file.downloaded = true;
      file.save().then({});

      fs.exists(file.base_path + file.file_name, function(exists){
        if (exists) {     
          // Content-type is very interesting part that guarantee that
          // Web browser will handle response in an appropriate manner.
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=" + file.uploaded_file_name
          });
          fs.createReadStream(file.base_path + file.file_name).pipe(res);

        } else {
          res.writeHead(400, {"Content-Type": "text/plain"});
          res.end("ERROR File does not exist");
        }
      });
    } catch(err) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("System Error");
    }
  }
  
}