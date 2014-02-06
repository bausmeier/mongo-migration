var FeedPostMigrator = require('../lib/FeedPostMigrator'),
    sinon = require('sinon'),
    moment = require('moment'),
    expect = require('chai-for-sinon').expect;

var aFeedPost = require('./helpers/FeedPostBuilder'),
    aRow = require('./helpers/RowBuilder'),
    aReply = require('./helpers/ReplyBuilder'),
    now = require('./helpers/DateHelper').now;

var NO_ERROR = null,
    USER_COMMENT = 'USER_COMMENT',
    UPCOMING_LEAVE = 'UPCOMING_LEAVE',
    LEAVE_UPDATED = 'LEAVE_UPDATED',
    HAPPY_BIRTHDAY = 'HAPPY_BIRTHDAY',
    SPIRIT_LEVEL_UPDATED = 'EMPLOYEE_SPIRIT_LEVEL_UPDATED',
    WEB_FORM_RESPONSE = 'WEB_FORM_RESPONSE_RECEIVED',
    ANNIVERSARY = 'ANNIVERSARY',
    UPCOMING_TRAINING = 'UPCOMING_TRAINING',
    PIPS_AWARDED = 'PIPS_AWARDED',
    ADDED_TO_GROUP = 'ADDED_TO_GROUP',
    GROUP_CREATED = 'GROUP_CREATED',
    THOUGHT_UPDATED = 'THOUGHT_UPDATED';

var MESSAGE = 'Test message',
    POSTED_BY_ID = 363,
    POSTED_BY_NAME = 'Brett Ausmeier',
    POSTED_BY_USERNAME = 'brett.ausmeier',
    POSTED_FOR_ID = 181,
    POSTED_FOR_NAME = 'Clinton Bosch',
    POSTED_FOR_USERNAME = 'clinton.bosch';

describe('Feed posts', function() {

  var migrator,
      collection;

  before(function() {
    migrator = new FeedPostMigrator();
    migrator.database = true;
    migrator.collection = collection = {
      insert: sinon.stub().yields(NO_ERROR),
      update: sinon.stub().yields(NO_ERROR)
    };
    migrator.on('error', function() {
      // Squash to prevent double test failure
    });
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
      var createdDate = now;
      var updatedDate = now;
      var postedForFeed = 180;
      var rowToMigrate = aRow()
                           .withPostType(USER_COMMENT)
                           .withMessage(MESSAGE)
                           .withPostedById(POSTED_BY_ID)
                           .withPostedByName(POSTED_BY_NAME)
                           .withPostedByUsername(POSTED_BY_USERNAME)
                           .withFeedId(postedForFeed)
                           .withPostedForId(POSTED_FOR_ID)
                           .withPostedForName(POSTED_FOR_NAME)
                           .withPostedForUsername(POSTED_FOR_USERNAME)
                           .withDateCreated(createdDate.toString())
                           .withDateUpdated(updatedDate.toString())
                           .build();
      // Setup expectations
      var expectedPostedBy = {
        id: POSTED_BY_ID,
        name: POSTED_BY_NAME,
        username: POSTED_BY_USERNAME
      };
      var expectedPostedFor = {
        id: POSTED_FOR_ID,
        name: POSTED_FOR_NAME,
        username: POSTED_FOR_USERNAME
      };
      var expectedDocument = aFeedPost()
                               .withType(USER_COMMENT)
                               .withMessage(MESSAGE)
                               .withPostedBy(expectedPostedBy)
                               .withFeed(postedForFeed)
                               .withPostedFor(expectedPostedFor)
                               .withCreated(createdDate)
                               .withUpdated(updatedDate)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });

    it('should be added as reply when it has a parent post', function(done) {
      // Setup fixture
      var postId = 2;
      var parentId = 1;
      var rowToMigrate = aRow()
                           .withPostType(USER_COMMENT)
                           .withId(postId)
                           .withMessage(MESSAGE)
                           .withReplyToFeedPostId(parentId)
                           .withPostedById(POSTED_BY_ID)
                           .withPostedByName(POSTED_BY_NAME)
                           .withPostedByUsername(POSTED_BY_USERNAME)
                           .build();
      // Setup expectations
      var expectedQueryClause = {
        id: parentId,
      };
      var expectedPostedBy = {
        id: POSTED_BY_ID,
        name: POSTED_BY_NAME,
        username: POSTED_BY_USERNAME
      };
      var expectedSetClause = {
        $push: {
          replies: aReply()
                     .withId(postId)
                     .withMessage(MESSAGE)
                     .withPostedBy(expectedPostedBy)
                     .build()
        }
      };
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expectedQueryClause, expectedSetClause);
        done(err);
      });
    });
  });

  describe('Pips awarded', function() {
    var awardedBy = 'Brett Ausmeier',
        awardedAmount = 100,
        awardedCategory = 'Delivery Focus';

    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var rowToMigrate = aRow()
                           .withPostType(PIPS_AWARDED)
                           .withMessageParameters(awardedBy, awardedAmount, awardedCategory)
                           .withPostedForId(POSTED_FOR_ID)
                           .withPostedForName(POSTED_FOR_NAME)
                           .withPostedForUsername(POSTED_FOR_USERNAME)
                           .build();
      // Setup expectations
      var expectedParameters = {
        awardedBy: awardedBy,
        amount: awardedAmount,
        category: awardedCategory
      };
      var expectedPostedFor = {
        id: POSTED_FOR_ID,
        name: POSTED_FOR_NAME,
        username: POSTED_FOR_USERNAME
      };
      var expectedDocument = aFeedPost()
                               .withType(PIPS_AWARDED)
                               .withParameters(expectedParameters)
                               .withPostedFor(expectedPostedFor)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });

    it('should have the correct properties after being migrated with a reason', function(done) {
      // Setup fixture
      var awardedReason = 'For testing';
      var rowToMigrate = aRow()
                           .withPostType(PIPS_AWARDED)
                           .withMessageParameters(awardedBy, awardedAmount, awardedCategory, awardedReason)
                           .withPostedForId(POSTED_FOR_ID)
                           .withPostedForName(POSTED_FOR_NAME)
                           .withPostedForUsername(POSTED_FOR_USERNAME)
                           .build();
      // Setup expectations
      var expectedParameters = {
        awardedBy: awardedBy,
        amount: awardedAmount,
        category: awardedCategory,
        reason: awardedReason
      };
      var expectedPostedFor = {
        id: POSTED_FOR_ID,
        name: POSTED_FOR_NAME,
        username: POSTED_FOR_USERNAME
      };
      var expectedDocument = aFeedPost()
                               .withType(PIPS_AWARDED)
                               .withParameters(expectedParameters)
                               .withPostedFor(expectedPostedFor)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Upcoming leave', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var today = moment();
      var tomorrow = moment().add('days', 1);
      var rowToMigrate = aRow()
                           .withPostType(UPCOMING_LEAVE)
                           .withMessageParameters('true', today.valueOf(), tomorrow.valueOf())
                           .build();
      // Setup expectations
      var expectedParameters = {
        halfday: true,
        start: today.toDate(),
        end: tomorrow.toDate()
      };
      var expectedDocument = aFeedPost().withType(UPCOMING_LEAVE).withParameters(expectedParameters).build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Leave updated', function() {
    it('should be added to parent post with correct parameters', function(done) {
      // Setup fixture
      var postId = 2;
      var parentId = 1;
      var today = moment();
      var rowToMigrate = aRow()
                           .withId(postId)
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
          replies: aReply().withId(postId).withParameters(expectedParameters).build()
        }
      };
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expectedQueryClause, expectedSetClause);
        done(err);
      });
    });
  });

  describe('Spirit level updated', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var irrelevantLevel = 1;
      var rowToMigrate = aRow()
                           .withPostType(SPIRIT_LEVEL_UPDATED)
                           .withMessageParameters(irrelevantLevel)
                           .build();
      // Setup expectations
      var expectedParameters = {
        level: irrelevantLevel
      };
      var expectedDocument = aFeedPost()
                               .withType(SPIRIT_LEVEL_UPDATED)
                               .withParameters(expectedParameters)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Happy birthday', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var name = 'Brett Ausmeier';
      var birthdayDate = moment();
      var rowToMigrate = aRow()
                           .withPostType(HAPPY_BIRTHDAY)
                           .withMessageParameters(name, birthdayDate.valueOf())
                           .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: birthdayDate.toDate()
      };
      var expectedDocument = aFeedPost()
                               .withType(HAPPY_BIRTHDAY)
                               .withParameters(expectedParameters)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify results
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Web form response', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var numberOfResponses = 1,
          responseLink = '<a href=\'#response_list\'>Test</a>';
      var rowToMigrate = aRow()
                           .withPostType(WEB_FORM_RESPONSE)
                           .withMessageParameters(numberOfResponses, responseLink)
                           .build();
      // Setup expectations
      var expectedParameters = {
        responses: numberOfResponses,
        link: responseLink
      };
      var expectedDocument = aFeedPost().withType(WEB_FORM_RESPONSE).withParameters(expectedParameters).build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
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
      var rowToMigrate = aRow()
                           .withPostType(ANNIVERSARY)
                           .withMessageParameters(name, anniversaryDate.valueOf(), anniversaryYears, male)
                           .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: anniversaryDate.toDate(),
        years: anniversaryYears,
        gender: male
      };
      var expectedDocument = aFeedPost().withType(ANNIVERSARY).withParameters(expectedParameters).build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });

    it('should have the correct properties after being migrated with no gender', function(done) {
      // Setup fixture
      var rowToMigrate = aRow()
                           .withPostType(ANNIVERSARY)
                           .withMessageParameters(name, anniversaryDate.valueOf(), anniversaryYears)
                           .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: anniversaryDate.toDate(),
        years: anniversaryYears,
        gender: 0 // Unknown
      };
      var expectedDocument = aFeedPost().withType(ANNIVERSARY).withParameters(expectedParameters).build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Upcoming training', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var name = 'Brett Ausmeier';
      var trainingDate = moment();
      var rowToMigrate = aRow()
                           .withPostType(UPCOMING_TRAINING)
                           .withMessageParameters(name, trainingDate.valueOf())
                           .build();
      // Setup expectations
      var expectedParameters = {
        name: name,
        date: trainingDate.toDate()
      };
      var expectedDocument = aFeedPost().withType(UPCOMING_TRAINING).withParameters(expectedParameters).build();
      // Exericse SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Added to group', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var groupName = 'Group';
      var groupDescription = 'A group';
      var rowToMigrate = aRow()
                           .withPostType(ADDED_TO_GROUP)
                           .withMessageParameters(groupName, groupDescription)
                           .build();
      // Setup expectations
      var expectedParameters = {
        name: groupName,
        description: groupDescription
      };
      var expectedDocument = aFeedPost()
                               .withType(ADDED_TO_GROUP)
                               .withParameters(expectedParameters)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Group created', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var groupLink = 'group?group_id=1';
      var groupName = 'Group';
      var groupDescription = 'A group';
      var rowToMigrate = aRow()
                           .withPostType(GROUP_CREATED)
                           .withMessageParameters(groupLink, groupName, groupDescription)
                           .build();
      // Setup expectations
      var expectedParameters = {
        name: groupName,
        description: groupDescription
      };
      var expectedDocument = aFeedPost()
                               .withType(GROUP_CREATED)
                               .withParameters(expectedParameters)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Thought updated', function() {
    it('should have the correct properties after being migrated', function(done) {
      // Setup fixture
      var dateUpdated = moment();
      var rowToMigrate = aRow()
                           .withPostType(THOUGHT_UPDATED)
                           .withMessageParameters(dateUpdated.valueOf())
                           .build();
      // Setup expectations
      var expectedParameters = {
        date: dateUpdated.toDate()
      };
      var expectedDocument = aFeedPost()
                               .withType(THOUGHT_UPDATED)
                               .withParameters(expectedParameters)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        done(err);
      });
    });
  });

  describe('Unhandled type', function() {
    it('should have an array of parameters after being migrated and log an error', function(done) {
      // Setup fixture
      var unknownType = 0;
      var rowToMigrate = aRow()
                           .withPostType(unknownType)
                           .withMessageParameters('Test', 'parameters')
                           .build();
      var error = sinon.stub(console, 'error');
      // Setup expectations
      var expectedParameters = [
        'Test',
        'parameters'
      ];
      var expectedDocument = aFeedPost()
                               .withType(unknownType)
                               .withParameters(expectedParameters)
                               .build();
      // Exercise SUT
      migrator.write(rowToMigrate, function(err) {
        error.restore();
        // Verify behaviour
        expect(collection.insert).to.be.calledOnce();
        expect(collection.insert).to.be.calledWithMatch(expectedDocument);
        expect(error).to.be.calledOnce();
        expect(error).to.be.calledWith('Feed post type not handled: 0');
        done(err);
      });
    });
  });
});
