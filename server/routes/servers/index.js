const servers = require('express').Router();
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const serverSchema = mongoose.Schema({
  applications: [{type: String}],
  backupDate: {type: String, trim: true},
  cpu: {type: String, trim: true},
  disks: {type: String, trim: true},
  dnsName: {type: String, trim: true},
  location: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    maxlength: 3
  },
  maintWin: {type: String, trim: true},
  memory: {type: String, trim: true},
  monitoring: Boolean,
  os: {type: String, trim: true},
  owner: {type: String, trim: true},
  patchDate: {type: String, trim: true},
  purpose: {
    type: Number,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 2
  },
  serverName: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    index: true,
    trim: true
  },
  serverType: {
    type: String,
    enum: ['appliance', 'server'],
    trim: true
  },
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
serverSchema.plugin(uniqueValidator);
const Server = mongoose.model('Server', serverSchema);

servers.get('/', (req, res, next) => {
  // Get servers from database
  Server.find({}, {_id: 0, __v: 0}, (err, data) => {
    if(err){
      next(err);
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

servers.put('/:serverName', (req, res, next) => {
  // Update server details
  Server.findOneAndUpdate({serverName: {$regex: new RegExp(req.params.serverName, "i")}}, req.body, {new: true}, (err, resp) => {
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
servers.all('/:serverName', (req, res, next) => res.set('Allow', 'PUT').status(405).end());

module.exports = servers;