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
const Purpose = mongoose.model('Purposes', schema);

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

module.exports = purposes;