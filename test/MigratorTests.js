var FeedPostMigrator = require('../FeedPostMigrator'),
    LikesMigrator = require('../LikesMigrator'),
    expect = require('chai-for-sinon').expect,
    Writable = require('stream').Writable;

describe('FeedPostMigrator', function() {
  
  describe('Constructor', function() {
    
    it('should return a new instance', function() {
      var migrator = new FeedPostMigrator();
      expect(migrator).to.be.an.instanceOf(FeedPostMigrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
    
    it('should return a new instance without the new keyword', function() {
      var migrator = FeedPostMigrator();
      expect(migrator).to.be.an.instanceOf(FeedPostMigrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
  });
});

describe('LikesMigrator', function() {
  
  describe('Constructor', function() {
    
    it('should return a new instance', function() {
      var migrator = new LikesMigrator();
      expect(migrator).to.be.an.instanceOf(LikesMigrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
    
    it('should return a new instance without the new keyword', function() {
      var migrator = LikesMigrator();
      expect(migrator).to.be.an.instanceOf(LikesMigrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
  });
});