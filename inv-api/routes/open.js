const Router = require('restify-router').Router;  
const router = new Router();
const allControllers = require('../controllers');

const authCtrl = allControllers.authorizations;
router.get('/authorization', authCtrl.getAuth);
//router.get('/employees', authCtrl.getUsers);

//router.post('/authorization', authCtrl.createUser);
//router.post('/createpassword', authCtrl.createPassword);
//router.put('/users/:id', authCtrl.updateUser);
//router.get('/users/:id', authCtrl.getUserData);
//router.get('/users', authCtrl.listUsers);
//router.get('/resetpassword/:id', authCtrl.adminResetPwd);
//router.get('/resetpassword', authCtrl.selfResetPwd);


//fileupload
const fileUploadCtrl = allControllers.fileUpload;
router.post('/fileupload', fileUploadCtrl.upload);
router.get('/filetempid/:id', fileUploadCtrl.getTemporaryId);
router.get('/downloadcsv/:id', fileUploadCtrl.downloadCSV);
router.get('/filedownload/:id', fileUploadCtrl.download);

// commonListValues
const commonListValuesCtrl = allControllers.commonListValues;
router.get('/commonlistvalues', commonListValuesCtrl.list);
router.get('/commonlistvalues/:id', commonListValuesCtrl.get);
router.post('/commonlistvalues', commonListValuesCtrl.create);
router.put('/commonlistvalues/:id', commonListValuesCtrl.update);
router.get('/listbycode/:listcode', commonListValuesCtrl.listByListCode);
router.get('/listcodes', commonListValuesCtrl.listCodes);
router.post('/listcodes', commonListValuesCtrl.listCodeCreate);

const empCtrl = allControllers.employees;
router.get('/employees/:id', empCtrl.getSingleEmployee);
router.get('/employees', empCtrl.getEmployees);
router.put('/employees/:id', empCtrl.updateEmployee);
router.put('/employees/:id/picture', empCtrl.updateEmpProfilePic);

const prospectCtrl = allControllers.prospects;
router.get('/prospects', prospectCtrl.getProspects);
router.get('/prospectnames', prospectCtrl.getProspectNames);
router.get('/prospects/:id', prospectCtrl.getProspectById);
router.post('/prospects', prospectCtrl.createProspect);
router.put('/prospects/:id', prospectCtrl.updateProspect);
router.get('/prospectsreport', prospectCtrl.prospectReport);
router.get('/prospectsdashboard', prospectCtrl.getAllProspectsDashboard);
router.get('/testgetprospects', prospectCtrl.testGetAllProspects);
router.get('/testgetprospectswithor', prospectCtrl.testGetAllProspectsForOrCond);
router.post('/prospectfile', prospectCtrl.readFileData);

const prospect2Ctrl = allControllers.prospects2;
router.get('/getprospectsiwthandor', prospect2Ctrl.testGetAllProspectsForOrCond);

const existingInvCtrl = allControllers.existingInvestors;
router.get('/existinginvestornames', existingInvCtrl.getExistingInvestorNames);
router.get('/existinginvestors/:id', existingInvCtrl.getExistingInvestorById);
router.post('/existinginvestors', existingInvCtrl.createExistingInvestor);
router.put('/existinginvestors/:id', existingInvCtrl.updateExistingInvestor);
router.get('/existinginvestorsreport', existingInvCtrl.existingInvestorsReport);
router.get('/existinginvestorsdashboard', existingInvCtrl.getAllExistingInvestorsDashboard);
router.post('/existinginvestorfile', existingInvCtrl.readFileData);

const interactionCtrl = allControllers.interactions;
router.post('/prospects/:id/interactions', interactionCtrl.createInteractionForProspect);
router.get('/interactions/:id', interactionCtrl.getInteractionById);
router.post('/existinginvestors/:id/interactions', interactionCtrl.createInteractionForExistingInvestor);

module.exports = router;
