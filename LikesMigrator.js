var Writable = require('stream').Writable,
    util = require('util'),
    MongoClient = require('mongodb').MongoClient;

util.inherits(LikesMigrator, Writable);

function LikesMigrator(options) {
  if (!(this instanceof LikesMigrator)) {
    return new LikesMigrator(options);
  }
  Writable.call(this, {objectMode: true});
  options = options || {}
  this.db = options.database || 'mongodb://localhost/test';
  this.col = options.collection || 'feedposts';
}

LikesMigrator.prototype._write = function(chunk, encoding, done) {
  if (!this.database) {
    MongoClient.connect(this.db, function(err, database) {
      this.database = database;
      this.collection = this.database.collection(this.col);
      this._migrate(chunk, done);
    }.bind(this));
  } else {
    this._migrate(chunk, done);
  }
}

LikesMigrator.prototype._migrate = function(chunk, done) {
  var like = {
    id: chunk.employee_id,
    name: chunk.employee_name,
    username: chunk.employee_username
  };
  this.collection.update({id: chunk.post_id}, {$addToSet: {likes: like}}, function(err) {
    done(err);
  });
}

module.exports = LikesMigrator;