const express = require('express');
const expJwt = require('express-jwt');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const errorHandler = require('./errorHandler');
const app = express();

// Load configuration
let config;
try{
  config = require('./config.json');
}catch(e){
  config = require('./config.default.json');
}

// Configure app settings
app.use(express.json());
app.use(bodyparser.json());

// Configure default headers
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store');
  res.removeHeader('Connection');
  res.removeHeader('Date');
  res.removeHeader('X-Powered-By');
  next();
});

// Require a valid token
app.use(expJwt({
  secret: config.token.secret
}).unless({
  path: [
    /\/api\/auth\/?$/
  ]
}));

// Connect to database
const url = 'mongodb://'+config.database.host+':'+config.database.port+'/'+config.database.db;
mongoose.connect(url);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {

  // Start server once DB is connected
  app.use('/netlist/api', require('./routes'));

  // 404 catch all
  app.all('*', (req, res, next) => {
    if(res.headersSent){
      return next(err)
    }
    res.status(404).send({error: ['API endpoint not found']});
  });

  app.use(errorHandler);
  app.listen(8080, () => console.log('API server listening on port 8080'));  
});