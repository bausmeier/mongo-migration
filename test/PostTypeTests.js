var FeedPostMigrator = require('../migrator'),
    sinon = require('sinon'),
    moment = require('moment'),
    chai = require('chai-for-sinon'),
    expect = chai.expect;

var aDocument = require('./helpers/DocumentBuilder'),
    aRow = require('./helpers/RowBuilder');

var NO_ERROR = null,
    USER_COMMENT = 1,
    UPCOMING_LEAVE = 2,
    LEAVE_UPDATED = 3,
    HAPPY_BIRTHDAY = 5,
    SPIRIT_LEVEL_UPDATED = 6,
    WEB_FORM_RESPONSE = 8,
    ANNIVERSARY = 9,
    UPCOMING_TRAINING = 10,
    PIPS_AWARDED = 11,
    GROUP_CREATED = 12,
    GROUP_UPDATED = 13,
    THOUGHT_UPDATED = 16;

var IRRELEVANT_MESSAGE = 'Test message',
    IRRELEVANT_POSTED_BY_ID = 363,
    IRRELEVANT_POSTED_BY_NAME = 'Brett Ausmeier',
    IRRELEVANT_POSTED_BY_USERNAME = 'brett.ausmeier',
    IRRELEVANT_POSTED_FOR_ID = 181,
    IRRELEVANT_POSTED_FOR_NAME = 'Clinton Bosch',
    IRRELEVANT_POSTED_FOR_USERNAME = 'clinton.bosch';

describe('Post type', function() {
  
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
      var createdDate = moment();
      var updatedDate = moment();
      var postedForFeed = 180;
      var rowToMigrate = aRow().withPostType(USER_COMMENT)
                               .withMessage(IRRELEVANT_MESSAGE)
                               .withPostedById(IRRELEVANT_POSTED_BY_ID)
                               .withPostedByName(IRRELEVANT_POSTED_BY_NAME)
                               .withPostedByUsername(IRRELEVANT_POSTED_BY_USERNAME)
                               .withFeedId(postedForFeed)
                               .withPostedForId(IRRELEVANT_POSTED_FOR_ID)
                               .withPostedForName(IRRELEVANT_POSTED_FOR_NAME)
                               .withPostedForUsername(IRRELEVANT_POSTED_FOR_USERNAME)
                               .withDateCreated(createdDate.valueOf())
                               .withDateUpdated(updatedDate.valueOf())
                               .build();
      // Setup expectations
      var expectedPostedBy = {
        id: IRRELEVANT_POSTED_BY_ID,
        name: IRRELEVANT_POSTED_BY_NAME,
        username: IRRELEVANT_POSTED_BY_USERNAME
      };
      var expectedPostedFor = {
        id: IRRELEVANT_POSTED_FOR_ID,
        name: IRRELEVANT_POSTED_FOR_NAME,
        username: IRRELEVANT_POSTED_FOR_USERNAME
      };
      var expectedDocument = aDocument().withType(USER_COMMENT)
                                        .withMessage(IRRELEVANT_MESSAGE)
                                        .withPostedBy(expectedPostedBy)
                                        .withFeed(postedForFeed)
                                        .withPostedFor(expectedPostedFor)
                                        .withCreated(createdDate.toDate())
                                        .withUpdated(updatedDate.toDate())
                                        .build(); 
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
      var postId = 2;
      var parentId = 1;
      var rowToMigrate = aRow().withPostType(USER_COMMENT)
                               .withId(postId)
                               .withMessage(IRRELEVANT_MESSAGE)
                               .withReplyToFeedPostId(parentId)
                               .withPostedById(IRRELEVANT_POSTED_BY_ID)
                               .withPostedByName(IRRELEVANT_POSTED_BY_NAME)
                               .withPostedByUsername(IRRELEVANT_POSTED_BY_USERNAME)
                               .build(); 
      // Setup expectations
      var expectedQueryClause = {
        id: parentId,
      };
      var expectedPostedBy = {
        id: IRRELEVANT_POSTED_BY_ID,
        name: IRRELEVANT_POSTED_BY_NAME,
        username: IRRELEVANT_POSTED_BY_USERNAME
      };
      var expectedSetClause = {
        $push: {
          replies: aDocument().withType(USER_COMMENT)
                              .withId(postId)
                              .withMessage(IRRELEVANT_MESSAGE)
                              .withPostedBy(expectedPostedBy)
                              .build()
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
    var awardedBy = 'Brett Ausmeier',
        awardedAmount = 100,
        awardedCategory = 'Delivery Focus';
    
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var rowToMigrate = aRow().withPostType(PIPS_AWARDED)
                               .withMessageParameters(awardedBy, awardedAmount, awardedCategory)
                               .withPostedForId(IRRELEVANT_POSTED_FOR_ID)
                               .withPostedForName(IRRELEVANT_POSTED_FOR_NAME)
                               .withPostedForUsername(IRRELEVANT_POSTED_FOR_USERNAME)
                               .build();
      // Setup expectations
      var expectedParameters = {
        awardedBy: awardedBy,
        amount: awardedAmount,
        category: awardedCategory
      };
      var expectedPostedFor = {
        id: IRRELEVANT_POSTED_FOR_ID,
        name: IRRELEVANT_POSTED_FOR_NAME,
        username: IRRELEVANT_POSTED_FOR_USERNAME
      };
      var expectedDocument = aDocument().withType(PIPS_AWARDED)
                                        .withParameters(expectedParameters)
                                        .withPostedFor(expectedPostedFor)
                                        .build();
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
      var awardedReason = 'For testing';
      var rowToMigrate = aRow().withPostType(PIPS_AWARDED)
                               .withMessageParameters(awardedBy, awardedAmount, awardedCategory,
                                                     awardedReason)
                               .withPostedForId(IRRELEVANT_POSTED_FOR_ID)
                               .withPostedForName(IRRELEVANT_POSTED_FOR_NAME)
                               .withPostedForUsername(IRRELEVANT_POSTED_FOR_USERNAME)
                               .build();
      // Setup expectations
      var expectedParameters = {
        awardedBy: awardedBy,
        amount: awardedAmount,
        category: awardedCategory,
        reason: awardedReason
      };
      var expectedPostedFor = {
        id: IRRELEVANT_POSTED_FOR_ID,
        name: IRRELEVANT_POSTED_FOR_NAME,
        username: IRRELEVANT_POSTED_FOR_USERNAME
      };
      var expectedDocument = aDocument().withType(PIPS_AWARDED)
                                        .withParameters(expectedParameters)
                                        .withPostedFor(expectedPostedFor)
                                        .build();
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
      var rowToMigrate = aRow().withPostType(UPCOMING_LEAVE)
                               .withMessageParameters('true', today.valueOf(), tomorrow.valueOf())
                               .build();
      // Setup expectations
      var expectedParameters = {
        halfday: true,
        start: today.toDate(),
        end: tomorrow.toDate()
      };
      var expectedDocument = aDocument().withType(UPCOMING_LEAVE)
                                        .withParameters(expectedParameters)
                                        .build();
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
      var postId = 2;
      var parentId = 1;
      var today = moment();
      var rowToMigrate = aRow().withId(postId)
                               .withPostType(LEAVE_UPDATED)
                               .withMessageParameters('false', today.valueOf())
                               .withReplyToFeedPostId(parentId)
                               .build();
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
          replies: aDocument().withId(postId)
                              .withType(LEAVE_UPDATED)
                              .withParameters(expectedParameters)
                              .build()
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
  
  describe('Spirit level updated', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var irrelevantLevel = 1;
      var rowToMigrate = aRow().withPostType(SPIRIT_LEVEL_UPDATED)
                               .withMessageParameters(irrelevantLevel)
                               .build();
      // Setup expectations
      var expectedParameters = {
        level: irrelevantLevel
      };
      var expectedDocument = aDocument().withType(SPIRIT_LEVEL_UPDATED)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Happy birthday', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var name = 'Brett Ausmeier';
      var birthdayDate = moment();
      var rowToMigrate = aRow().withPostType(HAPPY_BIRTHDAY)
                               .withMessageParameters(name, birthdayDate.valueOf())
                               .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: birthdayDate.toDate()
      };
      var expectedDocument = aDocument().withType(HAPPY_BIRTHDAY)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Web form response', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var numberOfResponses = 1,
          responseLink = '<a href=\'#response_list\'>Test</a>';
      var rowToMigrate = aRow().withPostType(WEB_FORM_RESPONSE)
                               .withMessageParameters(numberOfResponses, responseLink)
                               .build();
      // Setup expectations
      var expectedParameters = {
        responses: numberOfResponses,
        link: responseLink
      };
      var expectedDocument = aDocument().withType(WEB_FORM_RESPONSE)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Anniversary', function() {
    var name = 'Brett Ausmeier';
    var anniversaryDate = moment();
    var anniversaryYears = 1;
    
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var male = 1;
      var rowToMigrate = aRow().withPostType(ANNIVERSARY)
                               .withMessageParameters(name, anniversaryDate.valueOf(), anniversaryYears,
                                                      male)
                               .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: anniversaryDate.toDate(),
        years: anniversaryYears,
        gender: male
      };
      var expectedDocument = aDocument().withType(ANNIVERSARY)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
    
    it('should have the correct properties after being migrated with no gender', function(done) {
      // Setup fixture
      var rowToMigrate = aRow().withPostType(ANNIVERSARY)
                               .withMessageParameters(name, anniversaryDate.valueOf(), anniversaryYears)
                               .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: anniversaryDate.toDate(),
        years: anniversaryYears,
        gender: 0 // Unknown
      };
      var expectedDocument = aDocument().withType(ANNIVERSARY)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Upcoming training', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var name = 'Brett Ausmeier';
      var trainingDate = moment();
      var rowToMigrate = aRow().withPostType(UPCOMING_TRAINING)
                               .withMessageParameters(name, trainingDate.valueOf())
                               .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: trainingDate.toDate()
      };
      var expectedDocument = aDocument().withType(UPCOMING_TRAINING)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exericse SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Group created', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var groupName = 'Group';
      var groupDescription = 'A group';
      var rowToMigrate = aRow().withPostType(GROUP_CREATED)
                               .withMessageParameters(groupName, groupDescription)
                               .build();
      // Setup expectations
      var expectedParameters = {
        name: groupName,
        description: groupDescription
      };
      var expectedDocument = aDocument()
                             .withType(GROUP_CREATED)
                             .withParameters(expectedParameters)
                             .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
    
  describe('Group updated', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var groupLink = 'group?group_id=1';
      var groupName = 'Group';
      var groupDescription = 'A group';
      var rowToMigrate = aRow().withPostType(GROUP_UPDATED)
                               .withMessageParameters(groupLink, groupName, groupDescription)
                               .build();
      // Setup expectations
      var expectedParameters = {
        name: groupName,
        description: groupDescription
      };
      var expectedDocument = aDocument()
                             .withType(GROUP_UPDATED)
                             .withParameters(expectedParameters)
                             .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Thought updated', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var dateUpdated = moment();
      var rowToMigrate = aRow().withPostType(THOUGHT_UPDATED)
                               .withMessageParameters(dateUpdated.valueOf())
                               .build();
      // Setup expectations
      var expectedParameters = {
        date: dateUpdated.toDate()
      };
      var expectedDocument = aDocument().withType(THOUGHT_UPDATED)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done();
      });
    });
  });
  
  describe('Unhandled type', function() {
    it('should have an array of parameters after being migrated and log an error', function(done) {
      // Setup fixture
      var unknownType = 0;
      var rowToMigrate = aRow().withPostType(unknownType)
                               .withMessageParameters('Test', 'parameters')
                               .build();
      var error = sinon.stub(console, 'error');
      // Setup expectations
      var expectedParameters = [
        'Test',
        'parameters'
      ];
      var expectedDocument = aDocument().withType(unknownType)
                                        .withParameters(expectedParameters)
                                        .build();
      // Exercise SUT
      migrator.write(rowToMigrate, null, function() {
        error.restore();
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        expect(error).to.be.calledOnce();
        expect(error).to.be.calledWith('Feed post type not handled: 0');
        done();
      });
    });
  });
});
