const mongoose = require('mongoose');

const schema = mongoose.Schema({
  code: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 2,
    unique: true,
    validate: {
      validator: v => {
        return /^\d{2}$/.test(v)
      },
      message: 'Purpose is not a number'
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

const Purpose = module.exports = mongoose.model('Purposes', schema);