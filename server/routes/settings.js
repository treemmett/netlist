const settings = require('express').Router();
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  dns: {type: String, trim: true}
});
const Setting = mongoose.model('Settings', schema);

settings.get('/', (req, res, next) => {
  Setting.findOne({}, (err, data) => {
    if(err) return next(err);

    // Create settings object if null
    if(!data){
      data = {_doc: {}}
    }

    data = {...data}._doc;
    delete data._id;
    delete data.__v;

    res.send(data);
  });
});
settings.post('/', (req, res, next) => {
  Setting.findOneAndUpdate({}, req.body, {upsert: true, new: true}, (err, data) => {
    if(err) return next(err);

    data = {...data}._doc;
    delete data._id;
    delete data.__v;

    res.send(data);
  });
});
settings.all('/:username', (req, res, next) => res.set('Allow', 'GET, POST').status(405).end());

module.exports = settings;