const locations = require('express').Router();
const Location = require('../schemas/Locations');
const Server = require('../schemas/Servers').schema;

locations.get('/', (req, res, next) => {
  // Database call
  Location.find({}, {_id: 0, __v: 0}, (err, data) => {
    if(err){
      next(err);
      return;
    }

    res.send(data);
  });
});
locations.post('/', (req, res, next) => {
  // Add location to database
  const location = new Location(req.body);
  location.save(err => {
    if(err){
      next(err);
      return;
    }

    // Duplicate response from Mongo
    const data = {...location}._doc;

    // Remove database specific keys from duplication
    delete data.__v;
    delete data._id;

    res.send(data);
  });
});
locations.all('/', (req, res, next) => res.set('Allow', 'GET, POST').status(405).end());

locations.delete('/:code', (req, res, next) => {
  // Check if any servers exist with the received code
  Server.find({location: {$regex: new RegExp('^'+req.params.code+'$', 'i')}}, (err, data) => {
    if(err){
      return next(err);
    }

    // Throw if any servers are using the recieved code
    if(data.length > 0){
      res.status(409).send({error: ['Unable to delete a location while it\'s in use']});
      return;
    }

    // Attempt to delete key
    Location.findOneAndRemove({code: {$regex: new RegExp('^'+req.params.code+'$', 'i')}}, (err, resp) => {
      if(err){
        return next(err);
      }

      // Check if nothing was deleted
      if(!resp){
        res.status(404).send({
          error: ['Location code "'+req.params.code+'" not found.']
        });
        return;
      }

      res.end();
    });
  });
});
locations.put('/:code', (req, res, next) => {
  Location.findOneAndUpdate({code: {$regex: new RegExp('^'+req.params.code+'$', 'i')}}, {description: req.body.description}, {new: true}, (err, resp) => {
    if(err){
      next(err);
      return;
    }

    // Check if no data was updated
    if(!resp){
      res.status(404).send({
        error: ['Location code "'+req.params.code+'" not found.']
      });
      return;
    }

    // Duplicate response from db
    const data = {...resp}._doc;

    // Remove database specific keys from response
    delete data.__v;
    delete data._id;

    res.send(data);
  });
});
locations.all('/:code', (req, res, next) => res.set('Allow', 'DELETE, PUT').status(405).end());


module.exports = locations;