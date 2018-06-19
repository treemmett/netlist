const routes = require('express').Router();

routes.use('/locations', require('./locations'));
routes.use('/purposes', require('./purposes'));
routes.use('/servers', require('./servers'));

module.exports = routes;
