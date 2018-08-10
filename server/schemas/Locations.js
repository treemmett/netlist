const mongoose = require('mongoose');

const schema = mongoose.Schema({
  code: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 3,
    required: true,
    uppercase: true,
    unique: true,
    validate: {
      validator: function(v){
        return /^[a-zA-Z]{3}$/.test(v);
      },
      message: 'Only A-Z characters are allowed for prefix'
    }
  },
  description: {
    type: String,
    trim: true,
    required: true
  }
}, {
  toObject: {
    transform: function(doc, ret){
      // Rname _id to id
      ret.id = ret._id;
      delete ret._id;
    }
  },
  toJSON: {
    transform: function(doc, ret){
      // Rname _id to id
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

schema.pre('findOneAndUpdate', function(next){
  this.options.runValidators = true;
  next();
});
const Location = module.exports = mongoose.model('Locations', schema);