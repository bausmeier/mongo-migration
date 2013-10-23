var Writable = require('stream').Writable,
    util = require('util'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

util.inherits(Migrator, Writable);

function Migrator(options) {
  assert.ok(this._migrate);
  Writable.call(this, {objectMode: true});
  options = options || {};
  this.db = options.database || 'mongodb://localhost/test';
  this.col = options.collection || 'feedposts';
}

Migrator.prototype._write = function(chunk, encoding, done) {
  // Connect to the database if we haven't already
  if (!this.database) {
    MongoClient.connect(this.db, function(err, database) {
      if (err) {
        return done(err);
      }
      this.database = database;
      this.collection = this.database.collection(this.col);
      this._migrate(chunk, done);
    }.bind(this));
  } else {
    this._migrate(chunk, done);
  }
  return true;
}

module.exports = Migrator;