var FeedPostMigrator = require('../migrator'),
    sinon = require('sinon'),
    expect = require('chai').expect;

var aDocument = require('./helpers/DocumentBuilder'),
    aRow = require('./helpers/RowBuilder');

var NO_ERROR = null;

describe('FeedPostMigrator', function() {
  
  var migrator,
      mock;
  
  before(function() {
    migrator = new FeedPostMigrator();
    migrator.database = true;
    migrator.collection = {
      insert: function(doc, callback) {
        callback();
      },
      update: function(query, set, callback) {
        callback();
      }
    };
  });

  beforeEach(function() {
    mock = sinon.mock(migrator.collection);
  });
  
  describe('User comment', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var rowToMigrate = aRow();
      // Setup expectations
      var expected = aDocument(); 
      mock.expects('insert').once().withMatch(expected).yields(NO_ERROR);
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        mock.verify();
        done();
      });
    });
    
    it('should be added as reply when it has a parent post', function(done) {
      // Setup fixture
      var rowToMigrate = aRow().withId(2).withReplyToFeedPostId(1); 
      // Setup expectations
      var expectedQuery = {
        id: 1,
      };
      var expectedSet = {
        $push: {
          replies: aDocument().withId(2)
        }
      };
      mock.expects('update').once().withMatch(expectedQuery, expectedSet).yields(NO_ERROR);
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        mock.verify();
        done();
      });
    });
  });
  
  describe('Pips awarded', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var rowToMigrate = aRow().withMessageParameters('Brett Ausmeier|100|Delivery Focus').withPostType(11);
      // Setup expectations
      var expectedParameters = {
        awarded_by: 'Brett Ausmeier',
        amount: 100,
        category: 'Delivery Focus'
      };
      var expectedDocument = aDocument().withParameters(expectedParameters).withType(11);
      mock.expects('insert').once().withMatch(expectedDocument).yields(NO_ERROR);
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        mock.verify();
        done();
      });
    });
    
    it('should have the correct properties after being migrated with a reason', function(done) {
      // Setup fixture
      var rowToMigrate = aRow().withMessageParameters('Brett Ausmeier|100|Delivery Focus|For testing').withPostType(11);
      // Setup expectations
      var expectedParameters = {
        awarded_by: 'Brett Ausmeier',
        amount: 100,
        category: 'Delivery Focus',
        reason: 'For testing'
      };
      var expectedDocument = aDocument().withParameters(expectedParameters).withType(11);
      mock.expects('insert').once().withMatch(expectedDocument).yields(NO_ERROR);
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        mock.verify();
        done();
      });
    });
  });
});
