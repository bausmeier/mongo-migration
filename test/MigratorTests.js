var FeedPostMigrator = require('../migrator'),
    sinon = require('sinon'),
    expect = require('chai').expect;

var aDocument = require('../helpers/DocumentBuilder'),
    aRow = require('../helpers/RowBuilder');

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
    mock = sinon.mock(migrator.collection);
  });
  
  it('should migrate user comments', function(done) {
    // Setup fixture
    var rowToMigrate = aRow();
    // Setup expectations
    var expected = aDocument(); 
    mock.expects('insert').once().withArgs(sinon.match(expected)).yields(NO_ERROR);
    // Exercise SUT
    migrator.write(rowToMigrate, null, function() {
      // Verify results
      mock.verify();
      done();
    });
  });
  
  it('should add replies to feed posts', function(done) {
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
    mock.expects('update').once().withArgs(sinon.match(expectedQuery), sinon.match(expectedSet)).yields(NO_ERROR);
    // Exercise SUT
    migrator.write(rowToMigrate, null, function() {
      // Verify results
      mock.verify();
      done();
    });
  });
});