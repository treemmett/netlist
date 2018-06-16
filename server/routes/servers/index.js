const servers = require('express').Router();
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const serverSchema = mongoose.Schema({
  applications: [{type: String}],
  backupDate: {type: String, trim: true},
  cpu: {type: String, trim: true},
  disks: {type: String, trim: true},
  dnsName: {type: String, trim: true},
  maintWin: {type: String, trim: true},
  memory: {type: String, trim: true},
  monitoring: Boolean,
  os: {type: String, trim: true},
  owner: {type: String, trim: true},
  patchDate: {type: String, trim: true},
  serverName: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    index: true,
    trim: true
  },
  updatedBy: {type: String, trim: true},
  virtualization: {
    type: String,
    enum: ['physical', 'virtual', 'cloud']
  },
  vlan: {type: String, trim: true}
});
serverSchema.plugin(uniqueValidator);
const Server = mongoose.model('Server', serverSchema);

servers.get('/', (req, res, next) => {
  // Get servers from database
  Server.find({}, (err, data) => {
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

module.exports = servers;