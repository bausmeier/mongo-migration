'use strict';

var Migrator = require('./Migrator'),
    util = require('util');

var convert = function(row) {
  var doc = {};
  // Copy fields
  doc.id = row.id;
  doc.tenant = row.tenant_id;
  doc.message = row.message;
  doc.created = new Date(row.date_created);
  if (row.date_updated) {
    doc.updated = new Date(row.date_updated);
  }
  doc.type = row.post_type;
  doc.feed = row.feed_id;
  // Embed the posted by employee
  if (row.posted_by_name) {
    doc.postedBy = {
      id: row.posted_by_id,
      name: row.posted_by_name,
      username: row.posted_by_username
    }
  }
  // Embed the posted for employee
  if (row.posted_for_name) {
    doc.postedFor = {
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
    // Upcoming leave
    case 2:
    // Leave updated
    case 3:
      parameters.halfday = values[0] === 'true';
      parameters.start = new Date(parseInt(values[1], 10));
      if (values[2]) {
        parameters.end = new Date(parseInt(values[2], 10));
      }
      break;
    // Happy birthday
    case 5:
      parameters.name = values[0];
      parameters.date = new Date(parseInt(values[1], 10));
      break;
    // Spirit level updated
    case 6:
      parameters.level = parseInt(values[0], 10);
      break;
    // Web form response received
    case 8:
      parameters.responses = parseInt(values[0], 10);
      parameters.link = values[1];
      break;
    // Anniversary
    case 9:
      parameters.name = values[0];
      parameters.date = new Date(parseInt(values[1], 10));
      parameters.years = parseInt(values[2]);
      parameters.gender = values[3] ? parseInt(values[3], 10) : 0;
      break;
    // Upcoming training
    case 10:
      parameters.name = values[0];
      parameters.date = new Date(parseInt(values[1], 10));
      break;
    // Pips awarded
    case 11:
      parameters.awardedBy = values[0];
      parameters.amount = parseInt(values[1], 10);
      parameters.category = values[2];
      parameters.reason = values[3];
      break;
    // Added to group
    case 12:
    // Group created
    case 13:
      // Cater for groups with a link parameter
      var startIndex = values.length - 2;
      parameters.name = values[startIndex];
      parameters.description = values[startIndex + 1];
      break;
    // Thought updated
    case 16:
      parameters.date = new Date(parseInt(values[0], 10));
      break;
    default:
      console.error('Feed post type not handled: ' + type);
      parameters = values;
      break;
  }
  return parameters;
};

util.inherits(FeedPostMigrator, Migrator);

function FeedPostMigrator(options) {
  if (!(this instanceof FeedPostMigrator)) {
    return new FeedPostMigrator(options);
  }
  Migrator.call(this, options);
}

FeedPostMigrator.prototype._migrate = function(row, done) {
  var doc = convert(row);
  // If the doc has a parent add it as a reply, otherwise insert it
  if (doc.parent) {
    var parent = doc.parent;
    // Remove the properties that don't matter for replies
    delete doc.parent;
    delete doc.tenant;
    delete doc.feed;
    delete doc.type;
    this.collection.update({id: parent}, {$push: {replies: doc}}, function(err) {
      done(err);
    });
  } else {
    this.collection.insert(doc, function(err) {
      done(err);
    });
  }
}

module.exports = FeedPostMigrator;
