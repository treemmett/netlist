const express = require('express');
const bodyparser = require('body-parser');
const app = express();

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

app.use('/netlist/api', require('./routes'))

app.listen(8080, () => console.log('API server listening on port 8080'));
