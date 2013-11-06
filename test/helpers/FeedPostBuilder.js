var now = require('./DateHelper').now;

function DocumentBuilder() {
  if (!(this instanceof DocumentBuilder)) {
    return new DocumentBuilder();
  }
  this.document = {
    id: 1,
    tenant: 1,
    type: 0,
    created: now,
    feed: 0,
    message: null
  }
};

DocumentBuilder.prototype.withId = function(id) {
  this.document.id = id;
  return this;
};

DocumentBuilder.prototype.withMessage = function(message) {
  this.document.message = message;
  return this;
};

DocumentBuilder.prototype.withType = function(type) {
  this.document.type = type;
  return this;
};

DocumentBuilder.prototype.withParameters = function(parameters) {
  this.document.parameters = parameters;
  return this;
};

DocumentBuilder.prototype.withPostedBy = function(postedBy) {
  this.document.postedBy = postedBy;
  return this;
};

DocumentBuilder.prototype.withPostedFor = function(postedFor) {
  this.document.postedFor = postedFor;
  return this;
};

DocumentBuilder.prototype.withCreated = function(created) {
  this.document.created = created;
  return this;
};

DocumentBuilder.prototype.withUpdated = function(updated) {
  this.document.updated = updated;
  return this;
};

DocumentBuilder.prototype.withFeed = function(feed) {
  this.document.feed = feed;
  return this;
};

DocumentBuilder.prototype.build = function() {
  return this.document;
};

module.exports = DocumentBuilder;
