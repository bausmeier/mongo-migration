var TagsMigrator = require('../lib/TagsMigrator'),
    sinon = require('sinon');

describe('Tags', function() {
  
  var migrator,
      collection;
  
  before(function() {
    migrator = new TagsMigrator();
    migrator.database = true;
    migrator.collection = sinon.stub();
  });
  
  describe('A feed post tag', function() {
    
    it('should be migrated with the correct properties', function(done) {
      var tagToMigrate = {};
      migrator.write(tagToMigrate, function(err) {
        done();
      });
    });
  });
});