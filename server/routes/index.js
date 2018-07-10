const routes = require('express').Router();

routes.use('/auth', require('./auth'));
routes.use('/locations', require('./locations'));
routes.use('/purposes', require('./purposes'));
routes.use('/servers', require('./servers').route);
routes.use('/settings', require('./settings'));
routes.use('/users', require('./users').route);

module.exports = routes;
