var Migrator = require('./Migrator'),
    util = require('util');

util.inherits(TagsMigrator, Migrator);

function TagsMigrator(options) {
  if (!(this instanceof TagsMigrator)) {
    return new TagsMigrator(options);
  }
  Migrator.call(this, options);
};

TagsMigrator.prototype._migrate = function(row, done) {
  done();
};

module.exports = TagsMigrator;