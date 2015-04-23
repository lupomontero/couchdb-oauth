var os = require('os');
var fs = require('fs');
var path = require('path');
var util = require('util');
var rimraf = require('rimraf');
var MultiCouch = require('multicouch');
var request = require('request');
var OAuth = require('oauth').OAuth;


var dataDir = path.join(os.tmpdir(), 'couchdb-oauth-test');
rimraf.sync(dataDir);
fs.mkdirSync(dataDir);

var couchUrl = 'http://127.0.0.1:55984';
var couch = new MultiCouch({
  port: 55984,
  prefix: dataDir
});


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


function startCouch() {
  var retries = 10;
  function wait() {
    request(couchUrl, function (err) {
      if (err) {
        if (!retries--) { return done(err); }
        setTimeout(wait, 1000);
      }
      configureCouch();
    });
  }
  couch.on('start', wait);
  couch.start();
}


function configureCouch() {
  request.put(couchUrl + '/_config/couch_httpd_oauth/use_users_db', {
    json: true,
    body: 'true'
  }, function (err, resp) {
    if (err) { return done(err); }
    createUser();
  });
}


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
    function (err, data, res) {
      if (err) { return done(err); }
      console.log(util.inspect(JSON.parse(data)));
      removeUser();      
    });
}


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


startCouch();

