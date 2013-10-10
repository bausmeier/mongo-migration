var FeedPostMigrator = require('../migrator'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    moment = require('moment');

var aDocument = require('./helpers/DocumentBuilder'),
    aRow = require('./helpers/RowBuilder');

var NO_ERROR = null,
    USER_COMMENT = 1,
    UPCOMING_LEAVE = 2,
    LEAVE_UPDATED = 3,
    PIPS_AWARDED = 11;

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
      var now = moment();
      var rowToMigrate = aRow().withPostedForName('Clinton Bosch').withPostedForUsername('clinton.bosch').withDateCreated(now.valueOf());
      // Setup expectations
      var expectedPostedFor = {
        name: 'Clinton Bosch',
        username: 'clinton.bosch'
      };
      var expected = aDocument().withPostedFor(expectedPostedFor).withCreated(now.toDate()); 
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
      var parentId = 1;
      var rowToMigrate = aRow().withId(2).withReplyToFeedPostId(parentId); 
      // Setup expectations
      var expectedQueryClause = {
        id: parentId,
      };
      var expectedSetClause = {
        $push: {
          replies: aDocument().withId(2)
        }
      };
      mock.expects('update').once().withMatch(expectedQueryClause, expectedSetClause).yields(NO_ERROR);
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
      var rowToMigrate = aRow().withPostType(PIPS_AWARDED).withMessageParameters('Brett Ausmeier|100|Delivery Focus');
      // Setup expectations
      var expectedParameters = {
        awarded_by: 'Brett Ausmeier',
        amount: 100,
        category: 'Delivery Focus'
      };
      var expectedDocument = aDocument().withType(PIPS_AWARDED).withParameters(expectedParameters);
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
      var rowToMigrate = aRow().withPostType(PIPS_AWARDED).withMessageParameters('Brett Ausmeier|100|Delivery Focus|For testing');
      // Setup expectations
      var expectedParameters = {
        awarded_by: 'Brett Ausmeier',
        amount: 100,
        category: 'Delivery Focus',
        reason: 'For testing'
      };
      var expectedDocument = aDocument().withType(PIPS_AWARDED).withParameters(expectedParameters);
      mock.expects('insert').once().withMatch(expectedDocument).yields(NO_ERROR);
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        mock.verify();
        done();
      });
    });
  });
  
  describe('Upcoming leave', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var today = moment();
      var tomorrow = moment().add('days', 1);
      var rowToMigrate = aRow().withPostType(UPCOMING_LEAVE).withMessageParameters('true|' + today.valueOf() + '|' + tomorrow.valueOf());
      // Setup expectations
      var expectedParameters = {
        halfday: true,
        start: today.toDate(),
        end: tomorrow.toDate()
      };
      var expectedDocument = aDocument().withType(UPCOMING_LEAVE).withParameters(expectedParameters);
      mock.expects('insert').once().withMatch(expectedDocument).yields(NO_ERROR);
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        mock.verify();
        done();
      });
    });
  });
  
  describe('Leave updated', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var parentId = 1;
      var today = moment();
      var rowToMigrate = aRow().withId(2).withPostType(LEAVE_UPDATED).withMessageParameters('false|' + today.valueOf()).withReplyToFeedPostId(parentId);
      // Setup expectations
      var expectedQueryClause = {
        id: parentId
      };
      var expectedParameters = {
        halfday: false,
        start: today.toDate()
      };
      var expectedSetClause = {
        $push: {
          replies: aDocument().withId(2).withType(LEAVE_UPDATED).withParameters(expectedParameters)
        }
      };
      mock.expects('update').once().withMatch(expectedQueryClause, expectedSetClause).yields(NO_ERROR);
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        mock.verify();
        done();
      });
    });
  });
});
