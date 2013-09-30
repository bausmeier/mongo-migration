var Writable = require('stream').Writable,
    util = require('util');
var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var convert = function(row) {
  var doc = {};
  // Copy fields
  doc.id = row.id;
  doc.tenant = row.tenant_id;
  doc.message = row.message;
  doc.created = row.date_created;
  doc.updated = row.date_updated;
  doc.type = row.post_type;
  doc.feed = row.feed_id;
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
    doc.parent = row.reply_to_feed_post_id;
  }
  // Split message parameters to a map
  if (row.message_parameters) {
    doc.parameters = convertParameters(doc.type, row.message_parameters.split('|'));
  }
  return doc;
};

var convertParameters = function(type, values) {
  var parameters = {};
  // Handle type specific fields
  switch (type) {
    // User comment
    case 1:
      console.log('User comment shouldn\'t have a parameters ' + values);
      break;
    // Upcoming leave
    case 2:
    // Leave updated
    case 3:
      parameters.halfday = values[0] === 'true';
      parameters.start = new Date(parseInt(values[1]));
      if (values[2]) {
        parameters.end = new Date(parseInt(values[2]));
      }
      break;
    // Learning and development
    case 4:
      // TODO: WTF is this?
      break;
    // Happy birthday
    case 5:
      parameters.name = values[0];
      parameters.date = new Date(parseInt(values[1]));
      break;
    // Spirit level updated
    case 6:
      parameters.level = parseInt(values[0]);
      break;
    // Stage spirit level updated
    case 7:
      // TODO: WTF is this?
      break;
    // Web form response received
    case 8:
      parameters.responses = parseInt(values[0]);
      parameters.link = values[1];
      break;
    // Pips awarded
    case 11:
      parameters.awarded_by = values[0];
      parameters.amount = parseInt(values[1]);
      parameters.category = values[2];
      parameters.reason = values[3];
      break;
    default:
      parameters = values;
      break;
  }
  return parameters;
};

util.inherits(FeedPostMigrator, Writable);

function FeedPostMigrator(options) {
  if (!(this instanceof FeedPostMigrator)) {
    return new FeedPostMigrator(options);
  }
  this.db = options.database || 'mongodb://localhost/test';
  this.col = options.collection || 'feedposts';
  Writable.call(this, {objectMode: true});
}

FeedPostMigrator.prototype._write = function(chunk, encoding, done) {
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

FeedPostMigrator.prototype._migrate = function(chunk, done) {
  var doc = convert(chunk);
  if (doc.parent) {
    this.collection.update({id: doc.parent}, {$push: {replies: doc}}, function(err) {
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
