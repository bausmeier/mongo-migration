function DocumentBuilder() {
  if (!(this instanceof DocumentBuilder)) {
    return new DocumentBuilder();
  }
  this.document = {
    id: 1,
    tenant: 1,
    posted_by: {
      name: 'Brett Ausmeier',
      username: 'brett.ausmeier'
    }
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

DocumentBuilder.prototype.withPostedFor = function(posted_for) {
  this.document.posted_for = posted_for;
  return this;
};

DocumentBuilder.prototype.withCreated = function(created) {
  this.document.created = created;
  return this;
};

DocumentBuilder.prototype.build = function() {
  return this.document;
};

module.exports = DocumentBuilder;
