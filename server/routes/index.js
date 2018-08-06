const routes = require('express').Router();

routes.use('/auth', require('./auth'));
routes.use('/locations', require('./locations'));
routes.use('/purposes', require('./purposes'));
routes.use('/servers', require('./servers'));
routes.use('/settings', require('./settings'));

module.exports = routes;
