const servers = require('express').Router();
const mongoose = require('mongoose');

const serverSchema = mongoose.Schema({
  applications: [{type: String}],
  backupDate: String,
  cpu: String,
  disks: String,
  dnsName: String,
  maintWin: String,
  memory: String,
  monitoring: Boolean,
  os: String,
  owner: String,
  patchDate: String,
  serverName: {type: String, required: true, unique: true},
  updatedBy: String,
  virtualization: {
    type: String,
    enum: ['physical', 'virtual', 'cloud']
  },
  vlan: String
});

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

    res.send(newServer);
  });
});
servers.all('/', (req, res, next) => res.set('Allow', 'GET').status(405).end());

module.exports = servers;