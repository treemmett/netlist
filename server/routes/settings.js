const settings = require('express').Router();
const User = require('./users').schema;

settings.get('/', (req, res, next) => {
  User.findOne({username: req.user.username}, {settings: 1}, (err, data) => {
    if(err) return next(err);

    res.send(data.settings);
  });
});
settings.delete('/dns', (req, res, next) => {
  User.findOne({username: req.user.username}, {settings: 1}, (err, data) => {
    if(err) return next(err);

    const settings = {...data.settings, dns: ''}

    data.settings = settings;
    data.save(err => {
      if(err) return next(err);

      res.send(data.settings);
    });
  });
});
settings.patch('/dns/:dns', (req, res, next) => {
  User.findOne({username: req.user.username}, {settings: 1}, (err, data) => {
    if(err) return next(err);

    const settings = {...data.settings, dns: req.params.dns}

    data.settings = settings;
    data.save(err => {
      if(err) return next(err);

      res.send(data.settings);
    });
  });
});
settings.patch('/headers/:header', (req, res, next) => {
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
settings.all('/', (req, res, next) => res.set('Allow', 'GET').status(405).end());
settings.post('/*', (req, res, next) => res.set('Allow', 'DELETE, PATCH').status(405).end());

module.exports = settings;