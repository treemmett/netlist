const servers = require('express').Router();
const convertToCSV = require('../formatter/csv');
const headers = require('../schemas/Servers').keys;
const Server = require('../schemas/Servers').schema;

servers.get('/', (req, res, next) => {
  // Get servers from database
  Server.find({}, {__v: 0}, (err, data) => {
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

    // Rename _id to id
    data.id = data._id;
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

    // Rename _id to id
    data.id = data._id;
    delete data._id;

    res.send(data);
  });
});
servers.all('/:serverName', (req, res, next) => res.set('Allow', 'DELETE, PUT').status(405).end());

module.exports = servers;