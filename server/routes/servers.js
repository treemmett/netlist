const servers = require('express').Router();
const mongoose = require('mongoose');
const convertToCSV = require('../formatter/csv');

const headers = {
  applications: 'Applications',
  backupDate: 'Last Backup Date',
  cpu: 'CPU',
  disks: 'Disks',
  dnsName: 'DNS Name',
  location: 'Location Code',
  maintWin: 'Maintenance Window From',
  maintWinTo: 'Maintenance Window To',
  memory: 'Memory',
  monitoring: 'Monitoring Enabled',
  notes: 'Notes',
  os: 'OS',
  owner: 'Owner',
  patchDate: 'Last Patch Date',
  purpose: 'Purpose Code',
  serverName: 'Server Name',
  serverType: 'Server Type',
  retired: 'Retired',
  site: 'Site',
  updatedBy: 'Last Updated By',
  url: 'URL',
  virtualization: 'Virtualization',
  vlan: 'VLAN'
}

const serverSchema = mongoose.Schema({
  applications: [{type: String}],
  backupDate: {type: String, trim: true},
  cpu: {type: String, trim: true},
  disks: {type: String, trim: true},
  dnsName: {type: String, trim: true},
  location: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 3,
    required: true,
    uppercase: true,
    validate: {
      validator: function(v){
        return /^[a-zA-Z]{3}$/.test(v);
      },
      message: 'Only A-Z characters are allowed for location'
    }
  },
  maintWin: {type: String, trim: true},
  maintWinTo: {type: String, trim: true},
  memory: {type: String, trim: true},
  monitoring: Boolean,
  notes: {type: String, trim: true},
  os: {type: String, trim: true},
  owner: {type: String, trim: true},
  patchDate: {type: String, trim: true},
  purpose: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 2,
    validate: {
      validator: v => {
        return /^\d{2}$/.test(v)
      },
      message: 'Purpose is not a number'
    }
  },
  serverName: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    uppercase: true,
  },
  serverType: {
    type: String,
    enum: ['appliance', 'server'],
    trim: true
  },
  retired: {type: Boolean},
  site: {type: String, trim: true},
  updatedBy: {type: String, trim: true},
  url: {type: String, trim: true},
  virtualization: {
    type: String,
    enum: ['physical', 'virtual', 'cloud'],
    trim: true
  },
  vlan: {type: String, trim: true}
});
serverSchema.pre('findOneAndUpdate', function(next){
  this.options.runValidators = true;
  next();
});
const Server = mongoose.model('Server', serverSchema);

servers.get('/', (req, res, next) => {
  // Get servers from database
  Server.find({}, {_id: 0, __v: 0}, (err, data) => {
    if(err){
      next(err);
      return;
    }

    if(/text\/csv/i.test(req.headers.accept)){
      res.set('Content-Type', 'text/csv').send(convertToCSV(data, 'serverName', headers));
      return;
    }

    res.send(data);
  });
});
servers.post('/', (req, res, next) => {
  const newServer = new Server(req.body);
  newServer.save(err => {
    if(err){
      next(err);
      return;
    }

    // Duplicate response from Mongo
    const data = {...newServer}._doc;

    // Remove database specific keys from duplication
    delete data.__v;
    delete data._id;

    res.send(data);
  });
});
servers.all('/', (req, res, next) => res.set('Allow', 'GET, POST').status(405).end());

servers.get('/keys', (req, res, next) => {
  res.send(headers);
});

servers.delete('/:serverName', (req, res,next) => {
  // Remove document from collection
  Server.findOneAndRemove({serverName: {$regex: new RegExp('^'+req.params.serverName+'$', 'i')}}, (err, resp) => {
    if(err){
      return next(err);
    }

    // Check if nothing was deleted
    if(!resp){
      res.status(404).send({
        error: ['Server "'+req.params.serverName+'" not found.']
      });
      return;
    }

    res.end();
  });
});
servers.put('/:serverName', (req, res, next) => {
  // Update server details
  Server.findOneAndUpdate({serverName: {$regex: new RegExp('^'+req.params.serverName+'$', 'i')}}, req.body, {new: true}, (err, resp) => {
    if(err){
      next(err);
      return;
    }

    // Check if no data was updated
    if(!resp){
      res.status(404).send({
        error: ['Server "'+req.params.serverName+'" not found.']
      });
      return;
    }

    // Duplicate response from db
    const data = {...resp}._doc;

    // Remove database specific keys from duplication
    delete data.__v;
    delete data._id;

    res.send(data);
  });
});
servers.all('/:serverName', (req, res, next) => res.set('Allow', 'DELETE, PUT').status(405).end());

module.exports = {
  keys: headers,
  route: servers,
  schema: Server
}