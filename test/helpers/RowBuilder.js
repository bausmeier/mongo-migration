function RowBuilder() {
  if (!(this instanceof RowBuilder)) {
    return new RowBuilder();
  }
  this.id = 1;
  this.tenant_id = 1;
  this.post_type = 1;
  this.feed_id = 1;
  this.message = 'Test';
  var now = new Date().getTime();
  this.date_created = now;
  this.date_updated = now;
  this.posted_by_name = 'Brett Ausmeier';
  this.posted_by_username = 'brett.ausmeier';
  this.posted_for_name = 'Clinton Bosch';
  this.posted_for_username = 'clinton.bosch';
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

module.exports = RowBuilder;