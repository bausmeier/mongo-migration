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
  var doc = {
    id: row.tag_id,
    name: row.tag_name,
    taggedBy: {
      id: row.tagged_by_id,
      name: row.tagged_by_name
    },
    created: new Date(row.date_created)
  };
  this.collection.update({id: row.feed_post_id}, {$addToSet: {tags: doc}}, function(err) {
    done(err);
  });
};

module.exports = TagsMigrator;