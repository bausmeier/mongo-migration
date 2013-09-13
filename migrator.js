var Writable = require('stream').Writable,
    util = require('util');
var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var convert = function(row) {
  var doc = {};
  // Copy fields
  doc.id = row.id;
  doc.tenant_id = row.tenant_id;
  doc.message = row.message;
  doc.date_created = row.date_created;
  doc.date_updated = row.date_updated;
  doc.type = row.post_type;
  doc.feed_id = row.feed_id;
  // Embed the posted by employee
  if (row.posted_by_name || row.posted_by_username) {
    doc.posted_by = {
      id: row.posted_by_id,
      name: row.posted_by_name,
      username: row.posted_by_username
    }
  }
  // Embed the posted for employee
  if (row.posted_for_name || row.posted_for_username) {
    doc.posted_for = {
      id: row.posted_for_id,
      name: row.posted_for_name,
      username: row.posted_for_username
    }
  }
  // Set parent if there is one
  if (row.reply_to_feed_post_id) {
    doc.parent_id = row.reply_to_feed_post_id;
  }
  // Handle type specific fields
  switch (doc.type) {
    case 1:
      break;
    default:
      if (row.message_parameters) {
        doc.parameters = row.message_parameters.split('|');
      }
      break;
  }
  return doc;
};

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
  var doc = convert(chunk);
  if (doc.parent_id) {
    this.collection.update({id: doc.parent_id}, {$push: {comments: doc}}, function(err) {
      if (err) throw err;
      done();
    });
  } else {
    this.collection.insert(doc, function(err) {
      if (err) throw err;
      done();
    });
  }
}

module.exports = FeedPostMigrator;
