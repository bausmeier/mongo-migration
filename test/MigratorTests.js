var FeedPostMigrator = require('../lib/FeedPostMigrator'),
    LikesMigrator = require('../lib/LikesMigrator'),
    TagsMigrator = require('../lib/TagsMigrator'),
    expect = require('chai-for-sinon').expect,
    Writable = require('stream').Writable,
    Migrator = require('../lib/Migrator');

var DEFAULT_DATABASE_URL = 'mongodb://localhost/test',
    DEFAULT_COLLECTION = 'feedposts',
    DATABASE_URL = 'mongodb://localhost/expected',
    COLLECTION = 'expected';

describe('FeedPostMigrator', function() {
  
  describe('Constructor', function() {
    
    it('should return a new instance', function() {
      var migrator = new FeedPostMigrator();
      expect(migrator).to.be.an.instanceOf(FeedPostMigrator);
      expect(migrator).to.be.an.instanceOf(Migrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
    
    it('should return a new instance without the new keyword', function() {
      var migrator = FeedPostMigrator();
      expect(migrator).to.be.an.instanceOf(FeedPostMigrator);
      expect(migrator).to.be.an.instanceOf(Migrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });

    it('should have default options', function() {
      var migrator = new FeedPostMigrator();
      expect(migrator.db).to.equal(DEFAULT_DATABASE_URL);
      expect(migrator.col).to.equal(DEFAULT_COLLECTION);
    });

    it('should accept options', function() {
      var options = {
        database: DATABASE_URL,
        collection: COLLECTION
      };
      var migrator = new FeedPostMigrator(options);
      expect(migrator.db).to.equal(DATABASE_URL);
      expect(migrator.col).to.equal(COLLECTION);
    });
  });
});

describe('LikesMigrator', function() {
  
  describe('Constructor', function() {
    
    it('should return a new instance', function() {
      var migrator = new LikesMigrator();
      expect(migrator).to.be.an.instanceOf(LikesMigrator);
      expect(migrator).to.be.an.instanceOf(Migrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
    
    it('should return a new instance without the new keyword', function() {
      var migrator = LikesMigrator();
      expect(migrator).to.be.an.instanceOf(LikesMigrator);
      expect(migrator).to.be.an.instanceOf(Migrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });

    it('should have default options', function() {
      var migrator = new LikesMigrator();
      expect(migrator.db).to.equal(DEFAULT_DATABASE_URL);
      expect(migrator.col).to.equal(DEFAULT_COLLECTION);
    });

    it('should accept options', function() {
      var options = {
        database: DATABASE_URL,
        collection: COLLECTION
      };
      var migrator = new LikesMigrator(options);
      expect(migrator.db).to.equal(DATABASE_URL);
      expect(migrator.col).to.equal(COLLECTION);
    });
  });
});

describe('TagsMigrator', function() {
  
  describe('Constructor', function() {
    
    it('should return a new instance', function() {
      var migrator = new TagsMigrator();
      expect(migrator).to.be.an.instanceOf(TagsMigrator);
      expect(migrator).to.be.an.instanceOf(Migrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
    
    it('should return a new instance without the new keyword', function() {
      var migrator = TagsMigrator();
      expect(migrator).to.be.an.instanceOf(TagsMigrator);
      expect(migrator).to.be.an.instanceOf(Migrator);
      expect(migrator).to.be.an.instanceOf(Writable);
    });
    
    it('should have default options', function() {
      var migrator = new TagsMigrator();
      expect(migrator.db).to.equal(DEFAULT_DATABASE_URL);
      expect(migrator.col).to.equal(DEFAULT_COLLECTION);
    });
    
    it('should accept options', function() {
      var options = {
        database: DATABASE_URL,
        collection: COLLECTION
      };
      var migrator = new TagsMigrator(options);
      expect(migrator.db).to.equal(DATABASE_URL);
      expect(migrator.col).to.equal(COLLECTION);
    });
  });
});
