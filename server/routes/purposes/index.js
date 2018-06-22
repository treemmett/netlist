const purposes = require('express').Router();
const mongoose = require('mongoose');
const Server = require('../servers').schema;

const schema = mongoose.Schema({
  code: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 2,
    unique: true,
    validate: {
      validator: v => {
        return /^\d{2}$/.test(v)
      },
      message: 'Purpose is not a number'
    }
  },
  description: {
    type: String,
    trim: true,
    required: true
  }
});
schema.pre('findOneAndUpdate', function(next){
  this.options.runValidators = true;
  next();
});
const Purpose = mongoose.model('Purposes', schema);

purposes.get('/', (req, res, next) => {
  // Database call
  Purpose.find({}, {_id: 0, __v: 0}, (err, data) => {
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
    delete data._id;

    res.send(data);
  });
});
purposes.all('/:code', (req, res, next) => res.set('Allow', 'DELETE, PUT').status(405).end());

module.exports = purposes;