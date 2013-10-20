var FeedPostMigrator = require('../migrator'),
    chai = require('chai-for-sinon'),
    expect = chai.expect;

describe('FeedPostMigrator', function() {
  it('should return a new instance', function() {
    var migrator = FeedPostMigrator();
    expect(migrator).to.be.instanceOf(FeedPostMigrator);
  });
});