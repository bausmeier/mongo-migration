var LikesMigrator = require('../LikesMigrator'),
    sinon = require('sinon'),
    expect = require('chai-for-sinon').expect;

var NO_ERROR = null,
    POST_ID = 1,
    PARENT_ID = 2,
    LIKED_BY_ID = 363,
    LIKED_BY_NAME = 'Brett Ausmeier',
    LIKED_BY_USERNAME = 'brett.ausmeier';

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
        post_id: POST_ID,
        reply_id: null,
        employee_id: LIKED_BY_ID,
        employee_name: LIKED_BY_NAME,
        employee_username: LIKED_BY_USERNAME
      };
      // Setup expectations
      var expectedQueryClause = {
        id: POST_ID
      };
      var expectedSetClause = {
        $addToSet: {
          likes: {
            id: LIKED_BY_ID,
            name: LIKED_BY_NAME,
            username: LIKED_BY_USERNAME
          }
        }
      };
      // Exercise SUT
      migrator.write(likeToMigrate, function(err) {
        // Verify behaviour
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expectedQueryClause, expectedSetClause);
        done(err);
      });
    });
  });
  
  describe('A like on a feed post reply', function() {
    it('should be migrated to the reply with the correct properties', function(done) {
      // Setup fixture
      var likeToMigrate = {
        post_id: POST_ID,
        parent_id: PARENT_ID,
        employee_id: LIKED_BY_ID,
        employee_name: LIKED_BY_NAME,
        employee_username: LIKED_BY_USERNAME
      };
      // Setup expectations
      var expectedQueryClause = {
        'replies.id': POST_ID
      };
      var expectedSetClause = {
        $addToSet: {
          'replies.$.likes': {
            id: LIKED_BY_ID,
            name: LIKED_BY_NAME,
            username: LIKED_BY_USERNAME
          }
        }
      };
      // Exercise SUT
      migrator.write(likeToMigrate, function(err) {
        // Verify behaviour
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expectedQueryClause, expectedSetClause);
        done(err);
      });
    });
  });

});