const purposes = require('express').Router();
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  code: {
    type: Number,
    trim: true,
    minlength: 2,
    maxlength: 2,
    required: true,
    unique: true
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

purposes.put('/:code', (req, res, next) => {
  Purpose.findOneAndUpdate({code: req.params.code}, {description: req.body.description}, {new: true}, (err, resp) => {
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
purposes.all('/:code', (req, res, next) => res.set('Allow', 'PUT').status(405).end());

module.exports = purposes;