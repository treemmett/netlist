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
    default: false
  },
  settings: {
    headers: {
      type: [String],
      default: ['applications', 'serverName'],
      enum: {
        message: '{VALUE} is not a valid header.',
        values: [
          'applications',
          'backupDate',
          'cpu',
          'disks',
          'dnsName',
          'location',
          'maintWin',
          'maintWinTo',
          'memory',
          'monitoring',
          'os',
          'owner',
          'patchDate',
          'purpose',
          'serverName',
          'serverType',
          'retired',
          'site',
          'updatedBy',
          'url',
          'virtualization',
          'vlan'
        ]
      }
    }
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

users.patch('/headers/:header', (req, res, next) => {
  User.findOne({username: req.user.username}, {settings: 1}, (err, data) => {
    if(err) return next(err);

    // Add every current header to new object
    // This prevents default headers from erasing if the user hasn't set an option before
    const headers = [...data.settings.headers];

    // Remove header if it exists
    const index = headers.indexOf(req.params.header);
    if(index > -1){
      headers.splice(index, 1);
    }else if(req.params.header){
      // Add to headers if it doesn't
      headers.push(req.params.header);
    }

    data.settings.headers = headers;

    data.save(err => {
      if(err) return next(err);

      res.send(data.settings.headers);
    });
  });
});

users.delete('/:username', (req, res, next) => {
  User.findOneAndRemove({username: {$regex: new RegExp('^'+req.params.username+'$', 'i')}}, (err, resp) => {
    if(err){
      return next(err);
    }

    // Check if nothing was deleted
    if(!resp){
      res.status(404).send({
        error: ['User "'+req.params.username+'" not found.']
      });
      return;
    }

    res.end();
  });
});
users.put('/:username', (req, res, next) => {
  // Hash password if received
  if(req.body.password){
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if(err){
        return next(err);
      }

      save(hash);
    });
  }else{
    save();
  }

  function save(hash){
    const dataToUpdate = {
      admin: req.body.admin === true
    }

    if(hash){
      dataToUpdate.hash = hash;
    }

    User.findOneAndUpdate({username: {$regex: new RegExp('^'+req.params.username+'$', 'i')}}, dataToUpdate, {new: true}, (err, resp) => {
      if(err){
        return next(err);
      }

      // Remove hash, id, and version
      const data = {...resp}._doc;
      delete data.hash;
      delete data._id;
      delete data.__v;

      res.send(data);
    });
  }
});
users.all('/:username', (req, res, next) => res.set('Allow', 'DELETE, PUT').status(405).end());

module.exports = {
  route: users,
  schema: User
};

// Setup default user on start if none exist
User.find({}, {_id: 0, __v: 0, hash: 0}, (err, data) => {
  if(err){
    throw err;
  }

  if(!data.length){
    const hash = bcrypt.hashSync('password', 10);
    console.log(hash);

    const god = new User({
      username: 'god',
      createdBy: 'god',
      hash: hash,
      admin: true
    });
    god.save(err => {
      if(err){
        throw err;
      }
    });
  }
});