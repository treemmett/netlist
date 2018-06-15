const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Load configuration
let config;
try{
  config = require('./config.json');
}catch(e){
  config = require('./config.default.json');
}
module.exports.config = config;

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

// Connect to database
const url = 'mongodb://'+config.database.host+':'+config.database.port+'/'+config.database.db;
mongoose.connect(url);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {

  // Start server once DB is connected
  app.use('/netlist/api', require('./routes'));
  app.listen(8080, () => console.log('API server listening on port 8080'));  
});