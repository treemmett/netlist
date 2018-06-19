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

module.exports = locations;