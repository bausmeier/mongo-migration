function DocumentBuilder() {
  if (!(this instanceof DocumentBuilder)) {
    return new DocumentBuilder();
  }
  this.id = 1;
  this.tenant = 1;
  this.message = 'Test';
  this.type = 1;
  this.feed = 1;
  this.posted_by = {
    name: 'Brett Ausmeier',
    username: 'brett.ausmeier'
  };
  this.posted_for = {
    name: 'Clinton Bosch',
    username: 'clinton.bosch'
  };
};

DocumentBuilder.prototype.withId = function(id) {
  this.id = id;
  return this;
};

DocumentBuilder.prototype.withMessage = function(message) {
  this.message = message;
  return this;
};

DocumentBuilder.prototype.withType = function(type) {
  this.type = type;
  return this;
};

DocumentBuilder.prototype.withParameters = function(parameters) {
  this.parameters = parameters;
  return this;
};

module.exports = DocumentBuilder;
