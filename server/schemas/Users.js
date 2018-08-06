const mongoose = require('mongoose');
const serverHeaders = require('./Servers').keys;

const schema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    unique: true
  },
  lastLogin: {
    type: Date
  },
  settings: {
    dns: {type: String, trim: true},
    headers: {
      type: [String],
      default: ['applications', 'serverName'],
      enum: {
        message: '{VALUE} is not a valid header.',
        values: Object.keys(serverHeaders)
      }
    }
  }
});

schema.pre('findOneAndUpdate', function(next){
  this.options.runValidators = true;
  next();
});

const User = module.exports = mongoose.model('Users', schema);