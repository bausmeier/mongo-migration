var mysql = require('mysql'),
    mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var database,
    connection;

// Migrate feed posts from mysql to mongodb
var migrate = function() {
  console.log('Starting migration');
  var count = 0;
  var collection = database.collection('feedposts');
  var query = connection.query('SELECT * FROM feed_post');
  query
    .on('error', function(err) {
      console.error(err);
    })
    .on('result', function(row) {
      // Progress
      if (++count % 10000 == 0) {
        console.log(count);
      }
      // Insert the row into mongodb
      collection.insert(row, function(err) {
        if (err) {
          console.error(err);
        }
      });
    })
    .on('end', function() {
      // Clean up
      connection.end();
      database.close();
      console.log('Finished migrating');
    });
};

// Create a connection to mysql
connection = mysql.createConnection({
  user: 'root',
  database: 'bsg'
});

// Connect to mongodb
MongoClient.connect('mongodb://localhost/bsg', function(err, db) {
    if (err) {
      // End mysql connection and throw
      connection.end();
      throw err;
    } else {
      database = db;
      // Run the migration
      migrate();
    }
});
