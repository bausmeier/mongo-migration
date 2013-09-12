var mysql = require('mysql'),
    FeedPostMigrator = require('./migrator');

var connection = mysql.createConnection({
  user: 'root',
  database: 'bsg'
});

var migrator = new FeedPostMigrator();
migrator.on('finish', function() {
  migrator.db.close();
  connection.end();
});

var query = connection.query(
  'SELECT posted_by.nme, posted_by.username, feed_post.* ' +
  'FROM feed_post ' +
  'LEFT OUTER JOIN employee AS posted_by ' +
  'ON feed_post.posted_by_employee_id = posted_by.id '
);

query.stream().pipe(migrator);
