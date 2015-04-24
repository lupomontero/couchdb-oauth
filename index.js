var os = require('os');
var fs = require('fs');
var path = require('path');
var util = require('util');
var assert = require('assert');
var rimraf = require('rimraf');
var MultiCouch = require('multicouch');
var request = require('request');
var OAuth = require('oauth').OAuth;


// Data dir for the CouchDB instance that we'll start with multicouch.
var dataDir = path.join(os.tmpdir(), 'couchdb-oauth-test');
rimraf.sync(dataDir); // Remove if already exists
fs.mkdirSync(dataDir); // Create data dir


// Use multicouch to spin up a CouchDB instance.
var couchUrl = 'http://127.0.0.1:55984';
var couch = new MultiCouch({
  port: 55984,
  prefix: dataDir
});


// A dummy user to test OAuth authentication.
var userDocUrl = couchUrl + '/_users/org.couchdb.user:lupo';
var userDoc = {
  name: 'lupo',
  password: 'supersecret',
  roles: [],
  type: 'user',
  oauth: {
    consumer_keys: {
      consumerKey1: 'consumerKeySecret1'
    },
    tokens: {
      token1: 'tokenSecret1'
    }
  }
};


// Start CouchDB and wait for it to be accepting connections.
function startCouch() {
  var retries = 10;
  function wait() {
    request(couchUrl, function (err) {
      if (err) {
        if (!retries--) { return done(err); }
        return setTimeout(wait, 1000);
      }
      configureCouch();
    });
  }
  couch.on('start', wait);
  couch.start();
}


// Configure CouchDB to use _users database to store OAuth credentials.
function configureCouch() {
  request.put(couchUrl + '/_config/couch_httpd_oauth/use_users_db', {
    json: true,
    body: 'true'
  }, function (err, resp) {
    if (err) { return done(err); }
    createUser();
  });
}


// Create dummy user.
function createUser() {
  request.put(userDocUrl, {
    json: true,
    body: userDoc
  }, function (err, resp) {
    if (err) { return done(err); }
    userDoc._rev = resp.body.rev;
    checkOAuth();
  });
}


// Test that we can authenticate the dummy user using OAuth 1.0.
function checkOAuth() {
  var oauth = new OAuth(
    couchUrl + '/_oauth/request_token',
    couchUrl + '/_oauth/access_token',
    'consumerKey1',
    'consumerKeySecret1',
    '1.0',
    null,
    'HMAC-SHA1'
  );
  oauth.get(
    couchUrl + '/_session',
    'token1',
    'tokenSecret1',
    function (err, data) {
      if (err) { return done(err); }
      var parsed = JSON.parse(data);
      assert.deepEqual(parsed, {
        ok: true,
        userCtx: { name: 'lupo', roles: [] },
        info: {
          authentication_db: '_users',
          authentication_handlers: [ 'oauth', 'cookie', 'default' ],
          authenticated: 'oauth'
        }
      });
      console.log(util.inspect(parsed, { colors: true }));
      removeUser();      
    });
}


// Remove dummy user.
function removeUser() {
  request.del(userDocUrl, {
    json: true,
    qs: { rev: userDoc._rev },
    auth: { user: userDoc.name, pass: userDoc.password }
  }, stopCouch);
}


function stopCouch() {
  couch.stop(done);
}


function done(err) {
  rimraf.sync(dataDir);
  if (err) {
    console.error(util.inspect(err));
    process.exit(1);
  }
  process.exit(0);
}


startCouch(); // Start the action...

