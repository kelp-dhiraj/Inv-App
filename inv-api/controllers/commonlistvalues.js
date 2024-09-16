const db = require('../models');
const auth = require('./authorizations');

module.exports = {
  
  async list(req, res) {
    try {
      console.log('controller / commonListValues - list 1');
      //let user = await auth.user(req);
      let user = {admin: true};
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }

      let commonListValues = await db.CommonListValue.findAll({
	//where : {'enabled':true},
        attributes: ['id', 'list_code', 'lookup_code', 'lookup_value','lookup_description', 'enabled'],
        raw: true
      });
      res.json({status:'success', data: commonListValues});
    } catch(err) {
      console.log(err);
      res.json({status:'error'});
    }
  },

  async listByListCode(req, res) {
    try {
      console.log('controller / commonListValues - listByListCode 1');
      let listCodesStr = req.params.listcode;
      let listCodesArr = listCodesStr.split(',');
      console.log('listCodesStr: ', listCodesStr);
      console.log('listCodesArr: ', listCodesArr);
      //let user = await auth.user(req);
      let user = {admin: true};
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }
      let whereClause = {};
      //whereClause['list_code'] = req.params.listcode; 
      const Op = db.Sequelize.Op;
      whereClause['list_code'] = {[Op.in] : listCodesArr}; 
      if(!req.query.show || req.query.show !== 'all') whereClause['enabled'] = true; 
      console.log('req.query: ', req.query);
      console.log('whereClause: ', whereClause);

      let commonListValues = await db.CommonListValue.findAll({
	//where : {'list_code': req.params.listcode, 'enabled' : true},
        where : whereClause,
        attributes: ['id', 'list_code', 'lookup_code', 'lookup_value','lookup_description', 'enabled', 'display_order'],
        order:[['list_code'], 'display_order'],
        raw: true
      });
      res.json({status:'success', data: commonListValues});
    } catch(err) {
      console.log(err);
      res.json({status:'error in getting list by code'});
    }
  },

  async listCodes(req, res) {
    try {
      console.log('controller / commonListValues - listCodes 1');
      //let user = await auth.user(req);
      let user = {admin: true};
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }
      let whereClause = {};
      whereClause['list_code'] = 'LIST_CODES';
      if(!req.query.show || req.query.show !== 'all') whereClause['enabled'] = true; 
      console.log('req.query: ', req.query);
      console.log('whereClause: ', whereClause);

      let commonListValues = await db.CommonListValue.findAll({
        //where : {'list_code': 'LIST_CODES', 'enabled' : true},
        where : whereClause,
        attributes: ['id', 'list_code', 'lookup_code', 'lookup_value','lookup_description', 'enabled'],
        raw: true
      });
      res.json({status:'success', data: commonListValues});
    } catch(err) {
      console.log(err);
      res.json({status:'error in getting list codes'});
    }
  },

  async get(req, res) {
    try {
      console.log('controller / commonListValues - get 1');
      //let user = await auth.user(req);
      let user = {admin: true};
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }

      let commonListValue = await db.CommonListValue.findOne({
        where: { 'id' : req.params.id },
        attributes: ['id', 'list_code', 'lookup_code', 'lookup_value','lookup_description', 'enabled'],
        raw: true
      });
      res.json({status:'success', data: commonListValue});
    } catch(err) {
      console.log(err);
      res.json({status:'error',messages:['Error in getting Lookup']});
    }
  },

  async create(req, res) {
    try {
      console.log('controller / commonListValues - create 1');
      //let user = await auth.user(req);
      let user = {admin: true};
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }

      let data=req.body;
      if(!data.display_order || data.display_order=='') data.display_order=99;
      let commonListValue = await db.CommonListValue.create(data);
      res.json({status:'success', messages:['Lookup Created'], data:{id: commonListValue.id}});
    } catch(err) {
      console.log(err);
      res.json({status:'error', messages:['Error in creating Lookup']});
    }
  },

  async listCodeCreate(req, res) {
    try {
      console.log('controller / commonListValues - listCodeCreate 1');
      //let user = await auth.user(req);
      let user = {admin: true};
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }

      let data=req.body;
      data.list_code = 'LIST_CODES';
      data.enabled = true;
      let commonListValue = await db.CommonListValue.create(data);
      res.json({status:'success', messages:['List Code Created'], data:{id: commonListValue.id}});
    } catch(err) {
      console.log(err);
      res.json({status:'error', messages:['Error in creating List Code']});
    }
  },

  async update(req, res) {
    try {
      console.log('controller / commonListValues - update 1');
      //let user = await auth.user(req);
      let user = {admin: true};
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }

      let data=req.body;
      let commonListValue = await db.CommonListValue.findOne({
        where: { 'id' : req.params.id }
      });
      
      commonListValue.list_code = data.list_code;
      commonListValue.lookup_code = data.lookup_code;
      commonListValue.lookup_value = data.lookup_value;
      commonListValue.lookup_description = data.lookup_description;
      commonListValue.enabled = data.enabled;
      commonListValue.display_order=data.display_order?data.display_order:99;
      await commonListValue.save();
      res.json({status:'success', messages:['Lookup Updated']});
    } catch(err) {
      console.log(err);
      res.json({status:'error', messages:['Error in updating Lookup']});
    }
  },

  async delete(req, res) {
    try {
      let user = await auth.user(req);
      if (!user.admin) {
        res.json({ status: 'error' , messages: ['Restricted Access'] });
        return;
      }

      let count = await db.CommonListValue.destroy({
        where: { 'id' : req.params.id }
      });
      
      if (count == 1) {
        res.json({status:'success', messages:['Lookup Deleted']});
      } else {
        res.json({status:'error', messages:['Error in deleting Lookup']});
      }
    } catch(err) {
      console.log(err);
      res.json({status:'error', messages:['Error in deleting Lookup']});
    }
  }

};

