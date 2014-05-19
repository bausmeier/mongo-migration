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
  if (row.posted_by_id) {
    doc.postedBy = {
      id: row.posted_by_id,
      name: row.posted_by_name,
      username: row.posted_by_username
    }
  }
  // Embed the posted for employee
  if (row.posted_for_id) {
    doc.postedFor = {
      id: row.posted_for_id,
      name: row.posted_for_name,
      username: row.posted_for_username
    }
  }
  // Set the mugshot URL
  doc.mugshot = 'document/download?type=employee_mugshot&id=' + (doc.postedBy || doc.postedFor).id;
  // Set parent if there is one
  if (row.reply_to_feed_post_id) {
    doc.parent = row.reply_to_feed_post_id;
  }
  // Split message parameters to a map
  if (row.message_parameters) {
    doc.parameters = convertParameters(doc.type, row.message_parameters.split('|'), row);
  }
  return doc;
};

var convertParameters = function(type, values, row) {
  var parameters = {};
  // Handle type specific fields
  switch (type) {
    // Upcoming leave
    case 'UPCOMING_LEAVE':
    // Leave updated
    case 'LEAVE_UPDATED':
      parameters.halfday = values[0] === 'true';
      parameters.start = new Date(parseInt(values[1], 10));
      if (values[2]) {
        parameters.end = new Date(parseInt(values[2], 10));
      }
      break;
    // Happy birthday
    case 'HAPPY_BIRTHDAY':
      parameters.name = values[0];
      parameters.date = new Date(parseInt(values[1], 10));
      break;
    // Spirit level updated
    case 'EMPLOYEE_SPIRIT_LEVEL_UPDATED':
      parameters.level = parseInt(values[0], 10);
      break;
    // Web form response received
    case 'WEB_FORM_RESPONSE_RECEIVED':
      parameters.responses = parseInt(values[0], 10);
      parameters.link = values[1];
      break;
    // Anniversary
    case 'ANNIVERSARY':
      parameters.name = values[0];
      parameters.date = new Date(parseInt(values[1], 10));
      parameters.years = parseInt(values[2]);
      parameters.gender = values[3] ? parseInt(values[3], 10) : 0;
      break;
    // Upcoming training
    case 'UPCOMING_TRAINING':
      parameters.name = values[0];
      parameters.date = new Date(parseInt(values[1], 10));
      break;
    // Pips awarded
    case 'PIPS_AWARDED':
      parameters.awardedTo = row.posted_for_name;
      parameters.awardedBy = values[0];
      parameters.amount = parseInt(values[1], 10);
      parameters.category = values[2];
      parameters.reason = values[3];
      break;
    // Added to group
    case 'ADDED_TO_GROUP':
    // Group created
    case 'GROUP_CREATED':
      // Cater for groups with a link parameter
      var startIndex = values.length - 2;
      parameters.name = values[startIndex];
      parameters.description = values[startIndex + 1];
      parameters.createdBy = row.posted_for_name;
      break;
    // Thought updated
    case 'THOUGHT_UPDATED':
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
