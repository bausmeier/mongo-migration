var mysql = require('mysql'),
    transformer = require('./transformer'),
    streamToMongo = require('stream-to-mongo');

var mongoStream = streamToMongo({
  db: 'mongodb://localhost/bsg',
  collection: 'feedposts'
});

var connection = mysql.createConnection({
  user: 'root',
  database: 'bsg'
});

var query = connection.query('SELECT posted_by.nme, posted_by.username, feed_post.* FROM feed_post LEFT OUTER JOIN employee AS posted_by ON feed_post.posted_by_employee_id = posted_by.id');

query.stream().pipe(transformer);
transformer.pipe(mongoStream);
mongoStream.on('finish', function() {
  // Clean up
  mongoStream.db.close();
  connection.end();
});
