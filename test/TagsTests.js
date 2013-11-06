'use strict';

var TagsMigrator = require('../lib/TagsMigrator'),
    sinon = require('sinon'),
    expect = require('chai-for-sinon').expect;

var NO_ERROR = null,
    POST_ID = 1,
    TAG_ID = 1,
    TAG_NAME = 'test',
    TAGGED_BY_ID = 363,
    TAGGED_BY_NAME = 'Brett Ausmeier';

describe('Tags', function() {
  
  var migrator,
      collection;
  
  before(function() {
    migrator = new TagsMigrator();
    migrator.database = true;
    migrator.collection = collection = {
      update: sinon.stub().yields(NO_ERROR)
    };
  });
  
  describe('A feed post tag', function() {
    
    it('should be migrated with the correct properties', function(done) {
      var tagToMigrate = {
      	feed_post_id: POST_ID,
        tag_id: TAG_ID,
        tag_name: TAG_NAME,
        tagged_by_id: TAGGED_BY_ID,
        tagged_by_name: TAGGED_BY_NAME
      };
      var expectedQueryClause = {
        id: POST_ID
      };
      var expectedSetClause = {
        $addToSet: {
          tags: {
            id: TAG_ID,
            name: TAG_NAME,
            taggedBy: {
              id: TAGGED_BY_ID,
              name: TAGGED_BY_NAME
            }
          }
        }
      };
      migrator.write(tagToMigrate, function(err) {
        expect(collection.update).to.be.calledOnce();
        expect(collection.update).to.be.calledWithMatch(expectedQueryClause, expectedSetClause,
                                                        sinon.match.func);
        done(err);
      });
    });
  });
});