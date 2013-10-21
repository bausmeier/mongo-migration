var FeedPostMigrator = require('../migrator'),
    expect = require('chai-for-sinon').expect;

describe('FeedPostMigrator', function() {
  
  describe('Constructor', function() {
    
    it('should return a new instance', function() {
      var migrator = new FeedPostMigrator();
      expect(migrator).to.be.instanceOf(FeedPostMigrator);
    });
    
    it('should return a new instance without the new keyword', function() {
      var migrator = FeedPostMigrator();
      expect(migrator).to.be.instanceOf(FeedPostMigrator);
    });
  });
});