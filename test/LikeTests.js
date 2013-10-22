var LikesMigrator = require('../LikesMigrator'),
    sinon = require('sinon'),
    expect = require('chai-for-sinon').expect;

var NO_ERROR = null;

describe('Likes', function() {
  
  var migrator,
      collection;
  
  before(function() {
    migrator = new LikesMigrator();
    migrator.database = true;
    migrator.collection = collection = {
      update: sinon.stub().yields(NO_ERROR)
    }
  });
  
  after(function() {
    migrator.end();
  });
  
  afterEach(function() {
    collection.update.reset();
  });
  
  describe('A like on a feed post', function() {
    it('should be migrated to the feed post with the correct properties', function(done) {
      // Setup fixture
      var likeToMigrate = {
        post_id: 1,
        employee_id: 363,
        employee_name: 'Brett Ausmeier',
        employee_username: 'brett.ausmeier'
      };
      // Setup expectations
      var expecetdQueryClause = {
        id: 1
      };
      var expectedSetClause = {
        $addToSet: {
          likes: {
            id: 363,
            name: 'Brett Ausmeier',
            username: 'brett.ausmeier'
          }
        }
      };
      // Exercise SUT
      migrator.write(likeToMigrate, function(err) {
        // Verify behaviour
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expecetdQueryClause, expectedSetClause);
        done(err);
      });
    });
  });
  
  describe('A like on a feed post reply', function() {
    it.skip('should be migrated to the reply with the correct properties', function(done) {
      done();
    });
  });

});