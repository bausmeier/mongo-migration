'use strict';

var mysql = require('mysql'),
    FeedPostMigrator = require('./FeedPostMigrator'),
    LikesMigrator = require('./LikesMigrator'),
    Q = require('q');

// Connect to MySQL
var connection = mysql.createConnection({
  user: 'root',
  database: 'bsg'
});

// Options to pass to the migrators
var migratorOptions = {
  database: 'mongodb://localhost/bsg'
};

function migrateFeedPosts() {
  console.log('Migrating feed posts...');
  var deferred = Q.defer();

  // Create a new migrator
  var migrator = new FeedPostMigrator(migratorOptions);
  
  // Close the database connection and resolve the promise when the finish event is emitted
  migrator.on('finish', function() {
    migrator.database.close();
    deferred.resolve();
  });
  
  // Reject the promise if an error event if emitted
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
  
  var migrator = new LikesMigrator(migratorOptions);
  
  // Close the database connection and resolve the promise when the finish event is emitted
  migrator.on('finish', function() {
    migrator.database.close();
    deferred.resolve();
  });
  
  // Reject the promise if an error event if emitted
  migrator.on('error', function(err) {
    deferred.reject(err);
  });
  
  // Get the id, parent id and employee details for each like
  var query = connection.query(
    'SELECT ' +
    ' feed_post_liked_by_employee.feed_post_id AS post_id, ' +
    ' employee.id AS employee_id, employee.nme AS employee_name, employee.username AS employee_username, ' +
    ' feed_post.reply_to_feed_post_id AS parent_id ' +
    'FROM feed_post_liked_by_employee ' +
    'JOIN employee ' +
    ' ON employee.id = feed_post_liked_by_employee.employee_id ' +
    'JOIN feed_post ' +
    ' ON feed_post.id = feed_post_liked_by_employee.feed_post_id '
  );
  
  // Pipe the results of the query to the migrator
  query.stream().pipe(migrator);
  
  return deferred.promise;
}

function cleanUp() {
  console.log('Cleaning up...');
  // Close the connection to MySQL
  connection.end();
}

migrateFeedPosts().then(migrateLikes).finally(cleanUp).done();
