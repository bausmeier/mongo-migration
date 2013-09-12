var Writable = require('stream').Writable,
    util = require('util');
var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

util.inherits(FeedPostMigrator, Writable);

function FeedPostMigrator() {
  if (!(this instanceof FeedPostMigrator)) {
    return new FeedPostMigrator();
  }
  Writable.call(this, {objectMode: true});
}

FeedPostMigrator.prototype._write = function(chunk, encoding, done) {
  if (!this.db) {
    MongoClient.connect('mongodb://localhost/bsg', function(err, db) {
        this.db = db;
        this.collection = db.collection('feedposts');
        this._migrate(chunk, done);
    }.bind(this));
  } else {
    this._migrate(chunk, done);
  }
}

FeedPostMigrator.prototype._migrate = function(chunk, done) {
  if (chunk.reply_to_feed_post_id) {
    this.collection.update({id: chunk.reply_to_feed_post_id}, {$push: {comments: chunk}}, function(err) {
      if (err) throw err;
      done();
    });
  } else {
    this.collection.insert(chunk, function(err) {
      if (err) throw err;
      done();
    });
  }
}

module.exports = FeedPostMigrator;
