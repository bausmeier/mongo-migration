var Writable = require('stream').Writable,
    util = require('util'),
    MongoClient = require('mongodb').MongoClient,
    Q = require('q');

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
      this.collection.ensureIndex({'replies.id': 1}, null, function(err) {
        if (err) {
        	done(err);
          return;
        }
        console.log('Index created on replies.id');
        this._migrate(chunk, done);
      }.bind(this));
    }.bind(this));
  } else {
    this._migrate(chunk, done);
  }
}

LikesMigrator.prototype._migrate = function(chunk, done) {
  var postId = chunk.post_id;
  var like = {
    id: chunk.employee_id,
    name: chunk.employee_name,
    username: chunk.employee_username
  };
  if (chunk.parent_id) {
    this.collection.update({'replies.id': postId}, {$addToSet: {'replies.$.likes': like}}, function(err) {
      done(err);
    });
  } else {
    this.collection.update({id: postId}, {$addToSet: {likes: like}}, function(err) {
      done(err);
    });
  }
}

module.exports = LikesMigrator;