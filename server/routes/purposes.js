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

purposes.delete('/:id', (req, res, next) => {
  // Check if ID is valid
  if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
    res.status(400).send({error: ['ID is invalid']});
    return;
  }

  // Delete purpose
  Purpose.findOneAndRemove({_id: req.params.id}, (err, resp) => {
    if(err){
      return next(err);
    }

    // Check if nothing was deleted
    if(!resp){
      res.status(404).send({
        error: ['Purpose ID not found.']
      });
      return;
    }

    res.end();
  });
});
purposes.put('/:id', (req, res, next) => {
  // Check if ID is valid
  if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
    res.status(400).send({error: ['ID is invalid']});
    return;
  }

  // Update purpose
  Purpose.findOneAndUpdate({_id: req.params.id}, {description: req.body.description, code: req.body.code}, {new: true}, (err, resp) => {
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
purposes.all('/:id', (req, res, next) => res.set('Allow', 'DELETE, PUT').status(405).end());

module.exports = purposes;