const express = require('express');
const expJwt = require('express-jwt');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const errorHandler = require('./errorHandler');
const app = express();

// Load configuration
require('dotenv').config();

// Configure app settings
app.use(express.json());
app.use(bodyparser.json());

// Don't crash on unhandled exceptions
app.on('uncaughtException', console.error);
app.on('uncaughtRejection', console.error);

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
  secret: process.env.JWT_SECRET
}).unless({
  path: [
    /\/api\/auth\/?$/
  ]
}));

app.use((req, res, next) => {
  // Check if a non admin is trying to make a modification
  if(req.user){
    if(!req.user.admin && (req.method !== 'GET' && !/^\/api\/settings/.test(req.path))){
      res.status(403).send({error: ['You do not have permission to modify the requested resource']});
      return;
    }
  }
  next();
});

// Connect to database
const url = 'mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT+'/'+process.env.DB_NAME;
mongoose.connect(url, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {

  // Start server once DB is connected
  app.use('/api', require('./routes'));

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