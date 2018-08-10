const purposes = require('express').Router();
const Purpose = require('../schemas/Purposes');
const Server = require('../schemas/Servers').schema;

purposes.get('/', (req, res, next) => {
  // Database call
  Purpose.find({}, {__v: 0}, (err, data) => {
    if(err){
      next(err);
      return;
    }

    res.send(data);
  });
});
purposes.post('/', (req, res, next) => {
  // Add purpose to database
  const purpose = new Purpose(req.body);
  purpose.save(err => {
    if(err){
      next(err);
      return;
    }

    // Duplicate response from Mongo
    const data = {...purpose}._doc;

    // Remove database specific keys from duplication
    delete data.__v;
   
    // Rename _id to id
    data.id = data._id;
    delete data._id;

    res.send(data);
  });
});
purposes.all('/', (req, res, next) => res.set('Allow', 'GET, POST').status(405).end());

purposes.delete('/:code', (req, res, next) => {
  // Check if any servers exist with the received code
  Server.find({purpose: {$regex: new RegExp('^'+req.params.code+'$', 'i')}}, (err, data) => {
    if(err){
      return next(err);
    }

    // Throw if any servers are using the recieved code
    if(data.length > 0){
      res.status(409).send({error: ['Unable to delete a purpose while it\'s in use']});
      return;
    }

    // Attempt to delete key
    Purpose.findOneAndRemove({code: {$regex: new RegExp('^'+req.params.code+'$', 'i')}}, (err, resp) => {
      if(err){
        return next(err);
      }

      // Check if nothing was deleted
      if(!resp){
        res.status(404).send({
          error: ['Purpose code "'+req.params.code+'" not found.']
        });
        return;
      }

      res.end();
    });
  });
});
purposes.put('/:code', (req, res, next) => {
  Purpose.findOneAndUpdate({code: {$regex: new RegExp('^'+req.params.code+'$', 'i')}}, {description: req.body.description}, {new: true}, (err, resp) => {
    if(err){
      next(err);
      return;
    }

    // Check if no data was updated
    if(!resp){
      res.status(404).send({
        error: ['Purpose code "'+req.params.code+'" not found.']
      });
      return;
    }

    // Duplicate response from db
    const data = {...resp}._doc;

    // Remove database specific keys from response
    delete data.__v;

    // Rename _id to id
    data.id = data._id;
    delete data._id;

    res.send(data);
  });
});
purposes.all('/:code', (req, res, next) => res.set('Allow', 'DELETE, PUT').status(405).end());

module.exports = purposes;