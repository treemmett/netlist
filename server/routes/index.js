const routes = require('express').Router();

routes.use('/servers', require('./servers'));

module.exports = routes;
