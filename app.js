var mysql = require('mysql'),
    FeedPostMigrator = require('./migrator'),
    Q = require('q');

// Connect to MySQL
var connection = mysql.createConnection({
  user: 'root',
  database: 'bsg'
});

function migrateFeedPosts() {
  console.log('Migrating feed posts...');
  var deferred = Q.defer();

  // Create a new migrator
  var migrator = new FeedPostMigrator({
    database: 'mongodb://localhost/bsg'
  });
  
  // Close the database connections when the finish event is fired
  migrator.on('finish', function() {
    migrator.database.close();
    deferred.resolve();
  });
  
  migrator.on('error', function(err) {
    deferred.reject(err);
  });
  
  // Get all of the feed post info including the employees
  var query = connection.query(
    'SELECT ' +
    ' posted_by.id AS posted_by_id, posted_by.nme AS posted_by_name, posted_by.username AS posted_by_username, ' +
    ' posted_for.id AS posted_for_id, posted_for.nme AS posted_for_name, posted_for.username AS posted_for_username, ' +
    ' feed_post.* ' +
    'FROM feed_post ' +
    'LEFT OUTER JOIN employee AS posted_by ' +
    ' ON feed_post.posted_by_employee_id = posted_by.id ' +
    'LEFT OUTER JOIN employee AS posted_for ' +
    ' ON feed_post.posted_for_employee_id = posted_for.id '
  );
  
  // Pipe the results of the query to the migrator
  query.stream().pipe(migrator);

  return deferred.promise;
}

function migrateLikes() {
  console.log('Migrating likes...');
  var deferred = Q.defer();
  // TODO: Migrate likes
  setTimeout(function() {
    deferred.resolve();
  }, 2000);
  return deferred.promise;
}

function cleanUp() {
  console.log('Cleaning up...');
  connection.end();
}

migrateFeedPosts().then(migrateLikes).finally(cleanUp).done();
