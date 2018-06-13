const routes = require('express').Router();

routes.get('*', (req, res) => res.send({success: true}));
routes.all('*', (req, res) => res.send(req.body));

module.exports = routes;
