'use strict';

var Migrator = require('./Migrator'),
    util = require('util');

util.inherits(LikesMigrator, Migrator);

function LikesMigrator(options) {
  if (!(this instanceof LikesMigrator)) {
    return new LikesMigrator(options);
  }
  Migrator.call(this, options);
}

LikesMigrator.prototype._migrate = function(row, done) {
  var postId = row.post_id;
  // Transform the like
  var like = {
    id: row.employee_id,
    name: row.employee_name,
    username: row.employee_username
  };
  if (row.parent_id) {
    // Add the like to the reply
    this.collection.update({'replies.id': postId}, {$addToSet: {'replies.$.likes': like}}, function(err) {
      done(err);
    });
  } else {
    // Add the like to the parent post
    this.collection.update({id: postId}, {$addToSet: {likes: like}}, function(err) {
      done(err);
    });
  }
}

module.exports = LikesMigrator;