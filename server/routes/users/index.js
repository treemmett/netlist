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
    required: true,
    default: Math.floor(Date.now() / 1000)
  },
  createdBy: {
    type: String,
    trim: true
  },
  lastLogin: {
    type: Number,
    required: true,
    default: 0
  },
  admin: {
    type: Boolean,
    required: true,
    default: false
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

    // Save user to database
    const user = new User({
      username: req.body.username,
      hash: hash,
      admin: req.body.admin,
      createdBy: req.user.username
    });
    user.save(err => {
      if(err){
        return next(err);
      }

      // Duplicate document, remove db keys
      const data = {...user}._doc;
      delete data._id;
      delete data.__v;
      delete data.changePassword;

      // Remove hash
      delete data.hash;

      res.status(200).send(data);
    })
  });
});
users.all('/', (req, res, next) => res.set('Allow', 'GET, POST').status(405).end());

module.exports = {
  route: users,
  schema: User
};