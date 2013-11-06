function ReplyBuilder() {
  if (!(this instanceof ReplyBuilder)) {
    return new ReplyBuilder();
  }
  this.reply = {};
}

ReplyBuilder.prototype.withId = function(id) {
  this.reply.id = id;
  return this;
};

ReplyBuilder.prototype.withMessage = function(message) {
  this.reply.message = message;
  return this;
};

ReplyBuilder.prototype.withParameters = function(parameters) {
  this.reply.parameters = parameters;
  return this;
};

ReplyBuilder.prototype.withPostedBy = function(postedBy) {
  this.reply.postedBy = postedBy;
  return this;
};

ReplyBuilder.prototype.build = function() {
  return this.reply;
};


module.exports = ReplyBuilder;