const auth = require('express').Router();
const User = require('./users').schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load configuration
let config;
try{
  config = require('../config.json');
}catch(e){
  config = require('../config.default.json');
}

auth.post('/', (req, res, next) => {
  // Get hash from database
  User.findOne({username: req.body.username}, {hash: 1}, (err, data) => {
    if(err){
      return next(err);
    }

    // Throw if user doesn't exist
    if(!data || !req.body.password){
      res.status(401).send({error: ['Username or password is incorrect']});
      return;
    }

    // Compare hash against password
    bcrypt.compare(req.body.password, data.hash, (err, match) => {
      if(err){
        return next(err);
      }

      // Throw if password is incorrect
      if(!match){
        res.status(401).send({error: ['Username or password is incorrect']});
        return;
      }

      // Update database with login date
      const epoch = Math.floor(Date.now() / 1000);
      User.findOneAndUpdate({username: req.body.username}, {lastLogin: epoch}, (err, data) => {
        if(err){
          return next(err);
        }

        // Create a signed token
        jwt.sign({
          username: data.username,
          admin: data.admin
        }, config.token.secret, {
          expiresIn: config.token.expiresIn
        }, (err, token) => {
          if(err){
            return next(err);
          }

          res.set('X-Auth-Token', token).end();
        });
      });
    });
  });
});
auth.all('/', (req, res, next) => res.set('Allow', 'POST').status(405).end());

module.exports = auth;