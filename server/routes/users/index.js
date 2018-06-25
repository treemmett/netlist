const users = require('express').Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    unique: true
  },
  hash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    required: true
  },
  lastLogin: {
    type: Number
  }
});
schema.pre('findOneAndUpdate', function(next){
  this.options.runValidators = true;
  next();
});
const User = mongoose.model('Users', schema);

users.get('/', (req, res, next) => {
  // Get users from database
  User.find({}, {_id: 0, __v: 0, hash: 0}, (err, data) => {
    if(err){
      next(err);
      return;
    }

    res.send(data);
  });
});
users.post('/', (req, res, next) => {
  // Check if data exists before sending it to bcrypt
  const errors = [];
  if(!req.body.password){
    errors.push('Path \'password\' is required');
  }
  if(!req.body.username){
    errors.push('Path \'username\' is required');
  }
  if(errors.length){
    res.status(422).send({error: errors});
    return;
  }

  // Hash password
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if(err){
      return next(err);
    }

    // Calculate epoch
    const epoch = Math.floor(Date.now() / 1000);

    // Save user to database
    const user = new User({
      username: req.body.username,
      hash: hash,
      createdAt: epoch
    });
    user.save(err => {
      if(err){
        return next(err);
      }

      res.end();
    })
  });
});
users.all('/', (req, res, next) => res.set('Allow', 'GET, POST').status(405).end());

module.exports = users;