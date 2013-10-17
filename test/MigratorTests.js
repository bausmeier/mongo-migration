var FeedPostMigrator = require('../migrator'),
    sinon = require('sinon'),
    moment = require('moment');

var chai = require('chai-for-sinon'),
    expect = chai.expect;

var aDocument = require('./helpers/DocumentBuilder'),
    aRow = require('./helpers/RowBuilder');

var NO_ERROR = null,
    USER_COMMENT = 1,
    UPCOMING_LEAVE = 2,
    LEAVE_UPDATED = 3,
    PIPS_AWARDED = 11;

describe('FeedPostMigrator', function() {
  
  var migrator,
      collection;
  
  before(function() {
    migrator = new FeedPostMigrator();
    migrator.database = true;
    migrator.collection = collection = {
      insert: sinon.stub().yields(NO_ERROR),
      update: sinon.stub().yields(NO_ERROR)
    };
  });
  
  after(function() {
    migrator.end();
  });
  
  afterEach(function() {
    collection.insert.reset();
    collection.update.reset();
  });
  
  describe('User comment', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var now = moment();
      var rowToMigrate = aRow().withMessage('Test message').withPostedForId(181).withPostedForName('Clinton Bosch').withPostedForUsername('clinton.bosch').withDateCreated(now.valueOf()).build();
      // Setup expectations
      var expectedPostedFor = {
        id: 181,
        name: 'Clinton Bosch',
        username: 'clinton.bosch'
      };
      var expectedDocument = aDocument().withMessage('Test message').withPostedFor(expectedPostedFor).withCreated(now.toDate()).build(); 
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
    
    it('should be added as reply when it has a parent post', function(done) {
      // Setup fixture
      var parentId = 1;
      var rowToMigrate = aRow().withId(2).withReplyToFeedPostId(parentId).build(); 
      // Setup expectations
      var expectedQueryClause = {
        id: parentId,
      };
      var expectedSetClause = {
        $push: {
          replies: aDocument().withId(2).build()
        }
      };
      // Exercise SUT
      migrator.write(rowToMigrate, null, function(err) {
        // Verify results
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expectedQueryClause, expectedSetClause);
        done();
      });
    });
  });
  
  describe('Pips awarded', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var rowToMigrate = aRow().withPostType(PIPS_AWARDED).withMessageParameters('Brett Ausmeier|100|Delivery Focus').build();
      // Setup expectations
      var expectedParameters = {
        awarded_by: 'Brett Ausmeier',
        amount: 100,
        category: 'Delivery Focus'
      };
      var expectedDocument = aDocument().withType(PIPS_AWARDED).withParameters(expectedParameters).build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
    
    it('should have the correct properties after being migrated with a reason', function(done) {
      // Setup fixture
      var rowToMigrate = aRow().withPostType(PIPS_AWARDED).withMessageParameters('Brett Ausmeier|100|Delivery Focus|For testing').build();
      // Setup expectations
      var expectedParameters = {
        awarded_by: 'Brett Ausmeier',
        amount: 100,
        category: 'Delivery Focus',
        reason: 'For testing'
      };
      var expectedDocument = aDocument().withType(PIPS_AWARDED).withParameters(expectedParameters).build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Upcoming leave', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var today = moment();
      var tomorrow = moment().add('days', 1);
      var rowToMigrate = aRow().withPostType(UPCOMING_LEAVE).withMessageParameters('true|' + today.valueOf() + '|' + tomorrow.valueOf()).build();
      // Setup expectations
      var expectedParameters = {
        halfday: true,
        start: today.toDate(),
        end: tomorrow.toDate()
      };
      var expectedDocument = aDocument().withType(UPCOMING_LEAVE).withParameters(expectedParameters).build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Leave updated', function() {
    it('should be added to parent post with correct parameters', function(done) {
      // Setup fixture
      var parentId = 1;
      var today = moment();
      var rowToMigrate = aRow().withId(2).withPostType(LEAVE_UPDATED).withMessageParameters('false|' + today.valueOf()).withReplyToFeedPostId(parentId).build();
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
          replies: aDocument().withId(2).withType(LEAVE_UPDATED).withParameters(expectedParameters).build()
        }
      };
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expectedQueryClause, expectedSetClause);
        done();
      });
    });
  });
});
