# CouchDB OAuth example

[![Build Status](https://travis-ci.org/lupomontero/couchdb-oauth.svg?branch=master)](https://travis-ci.org/lupomontero/couchdb-oauth)
[![Dependency Status](https://david-dm.org/lupomontero/couchdb-oauth.svg?style=flat)](https://david-dm.org/lupomontero/couchdb-oauth)
[![devDependency Status](https://david-dm.org/lupomontero/couchdb-oauth/dev-status.png)](https://david-dm.org/lupomontero/couchdb-oauth#info=devDependencies)

This repo contains an example script that aims to show how to use [CouchDB](http://couchdb.apache.org/)'s OAuth authentication. CouchDB has support for 2-legged OAuth 1.0, but do note that it does not handle the creation of OAuth credentials (consumer keys, consumer secretes, tokens and token secrets).

The script does the following:

1. Spins up a CouchDB server using [MultiCouch](https://github.com/hoodiehq/node-multicouch).
2. Configures CouchDB server to store OAuth credentials in `_users` database.
3. Creates a user with OAuth credentials in its user document.
4. Sends request to CouchDB server using [OAuth](https://github.com/ciaranj/node-oauth) to prove authentication works.
5. Stops the CouchDB server and cleans up.

## Install

```
git clone https://github.com/lupomontero/couchdb-oauth.git
cd couchdb-oauth
npm install
```

## Run

```
npm test
```

This should produce output similar to:

```
> couchdb-oauth@1.0.0 test /Users/lupo/Documents/workspace/lupomontero/couchdb-oauth
> node index.js

{ ok: true,
  userCtx: { name: 'lupo', roles: [] },
  info:
   { authentication_db: '_users',
     authentication_handlers: [ 'oauth', 'cookie', 'default' ],
     authenticated: 'oauth' } }
```

## Further reading

### CouchDB Docs

* [OAuth Authentication](http://docs.couchdb.org/en/latest/api/server/authn.html#oauth-authentication)
* [HTTP OAuth Configuration](http://docs.couchdb.org/en/1.6.1/config/auth.html#http-oauth-configuration)
* [OAuth Configuration](http://docs.couchdb.org/en/1.6.1/config/auth.html#oauth-configuration)

### CouchDB Mailing List Archives

* Feb 2013: [Re: Help! 2-legged OAuth Example Anyone?](http://mail-archives.apache.org/mod_mbox/couchdb-user/201302.mbox/%3CCADR1q3BLuVwCuhvEFL0nYjM9D6PrYzUsd_wg9eBHp9VdZ0Pk=A@mail.gmail.com%3E)
* Nov 2010: [OAuth example](http://grokbase.com/t/couchdb/user/10b28b0fv4/oauth-example)
