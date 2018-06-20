const locations = require('express').Router();
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  code: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 3,
    required: true,
    uppercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    required: true
  }
});
const Location = mongoose.model('Locations', schema);

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


module.exports = locations;