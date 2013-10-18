function RowBuilder() {
  if (!(this instanceof RowBuilder)) {
    return new RowBuilder();
  }
  this.row = {
    id: 1,
    tenant_id: 1,
    posted_by_name: 'Brett Ausmeier',
    posted_by_username: 'brett.ausmeier'
  }
};

RowBuilder.prototype.withId = function(id) {
  this.row.id = id;
  return this;
};

RowBuilder.prototype.withPostType = function(type) {
  this.row.post_type = type;
  return this;
};

RowBuilder.prototype.withMessage = function(message) {
  this.row.message = message;
  return this;
};

RowBuilder.prototype.withReplyToFeedPostId = function(id) {
  this.row.reply_to_feed_post_id = id;
  return this;
};

RowBuilder.prototype.withMessageParameters = function() {
  this.row.message_parameters = Array.prototype.slice.call(arguments).join('|');
  return this;
};

RowBuilder.prototype.withPostedForId = function(id) {
  this.row.posted_for_id = id;
  return this;
};

RowBuilder.prototype.withPostedForName = function(name) {
  this.row.posted_for_name = name;
  return this;
};

RowBuilder.prototype.withPostedForUsername = function(username) {
  this.row.posted_for_username = username;
  return this;
};

RowBuilder.prototype.withDateCreated = function(date) {
  this.row.date_created = date;
  return this;
};

RowBuilder.prototype.build = function() {
  return this.row;
};

module.exports = RowBuilder;