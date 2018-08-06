const auth = require('express').Router();
const User = require('./users').schema;
const jwt = require('jsonwebtoken');
const ldap = require('ldapjs');

// Load configuration
let config;
try{
  config = require('../config.json');
}catch(e){
  config = require('../config.default.json');
}

auth.post('/', (req, res, next) => {
  // Throw if username or password wasn't sent
  if(!req.body.username || !req.body.password){
    res.status(401).send({error: ['Username or password is incorrect']});
    return;
  }

  const opts = {
    filter: `(&(objectclass=user)(samaccountname=${req.body.username}))`,
    scope: 'sub',
    attributes: ['dn', 'memberOf', 'sAMAccountName']
  }

  // Connect to LDAP
  const client = ldap.createClient({
    url: config.ldap.url,
    timeout: 5000,
    connectTimeout: 10000
  });

  client.bind(config.ldap.username, config.ldap.password, err => {
    if(err){
      client.unbind();

      return next(err);
    }

    client.search(config.ldap.cn, opts, (err, search) => {
      let foundObject = null;

      search.on('searchEntry', entry => {
        // Stop searching if we found a valid object
        if(entry.object){
          foundObject = entry.object;
          client.unbind();
        }
      });

      search.on('error', error => {
        client.unbind();
        return next(error);
      });

      search.on('end', result => {
        client.unbind();
        
        // End if no results were found
        if(!foundObject){
          res.status(401).send({error: ['Username or password is incorrect']});
          return;
        }

        // Create a new connection for user credentials
        const userClient = ldap.createClient({
          url: config.ldap.url,
          timeout: 5000,
          connectTimeout: 10000
        });

        userClient.bind(foundObject.dn, req.body.password, err => {
          if(err){
            // Check if error happened due to password error
            if(err.name === 'InvalidCredentialsError'){
              res.status(401).send({error: ['Username or password is incorrect']});
              return;
            }

            return next(err);
          }

          // Add fake members array if it doesn't exist
          if(typeof foundObject.memberOf !== 'object' && !(foundObject.memberOf instanceof Array)){
            foundObject.memberOf = [];
          }
        
          // User authentication succeeded. Now check if user has the necessary groups
          const regRO = new RegExp('^cn='+config.ldap.groups.ro, 'i');
          const regRW = new RegExp('^cn='+config.ldap.groups.rw, 'i');

          const accessGroups = foundObject.memberOf.filter(group => regRO.test(group) || regRW.test(group));

          if(!accessGroups.length){
            // User authentication suceeded, but doesn't have permissions
            res.status(403).send({error: ['You do not have permission to access this page.']});
            return;
          }

          // Create user in database if it doesn't exist
          User.findOneAndUpdate({username: foundObject.sAMAccountName}, {lastLogin: Date.now()}, {upsert: true, new: true, setDefaultsOnInsert: true}, (err, model) => {
            if(err) return next(err);

            // Create signed token
            jwt.sign({
              username: foundObject.sAMAccountName,
              admin: accessGroups.findIndex(group => regRW.test(group)) > -1
            },
            config.token.secret,
            {
              expiresIn: config.token.expiresIn
            },
            (err, token) => {
              if(err) return next(err);

              res.set('X-Auth-Token', token).end();
            });
          });
        });
      });
    });
  });
});
auth.all('/', (req, res, next) => res.set('Allow', 'POST').status(405).end());

module.exports = auth;