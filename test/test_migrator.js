var FeedPostMigrator = require('../migrator');

describe('FeedPostMigrator', function() {
  
  var migrator;
  
  before(function() {
    migrator = new FeedPostMigrator({
      collection: 'test'
    });
    migrator.on('finish', function() {
      migrator.database.close();
    });
  });
  
  it('should migrate user comments', function(done) {
    var row = {
      id: 1,
      post_type: 1,
      message: 'Test'
    };
    migrator.write(row, null, function() {
      // TODO: Do some assertions
      done();
    });
  });
  
  after(function() {
    migrator.end();
  });
});