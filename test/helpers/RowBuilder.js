function RowBuilder() {
  if (!(this instanceof RowBuilder)) {
    return new RowBuilder();
  }
  this.id = 1;
  this.tenant_id = 1;
  this.posted_by_name = 'Brett Ausmeier';
  this.posted_by_username = 'brett.ausmeier';
};

RowBuilder.prototype.withId = function(id) {
  this.id = id;
  return this;
};

RowBuilder.prototype.withPostType = function(type) {
  this.post_type = type;
  return this;
};

RowBuilder.prototype.withMessage = function(message) {
  this.message = message;
  return this;
};

RowBuilder.prototype.withReplyToFeedPostId = function(id) {
  this.reply_to_feed_post_id = id;
  return this;
};

RowBuilder.prototype.withMessageParameters = function(parameters) {
  this.message_parameters = parameters;
  return this;
};

RowBuilder.prototype.withPostedForName = function(name) {
  this.posted_for_name = name;
  return this;
};

RowBuilder.prototype.withPostedForUsername = function(username) {
  this.posted_for_username = username;
  return this;
};

RowBuilder.prototype.withDateCreated = function(date) {
  this.date_created = date;
  return this;
};

module.exports = RowBuilder;