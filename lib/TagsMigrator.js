var Migrator = require('./Migrator'),
    util = require('util');

util.inherits(TagsMigrator, Migrator);

function TagsMigrator(options) {
  if (!(this instanceof TagsMigrator)) {
    return new TagsMigrator(options);
  }
  options = options || {};
  this.db = options.database || 'mongodb://localhost/test';
  this.col = options.collection || 'feedposts';
};

module.exports = TagsMigrator;