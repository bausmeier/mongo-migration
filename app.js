var mysql = require('mysql'),
    FeedPostMigrator = require('./migrator');

var connection = mysql.createConnection({
  user: 'root',
  database: 'bsg'
});

var migrator = new FeedPostMigrator({
  database: 'mongodb://localhost/bsg',
  collection: 'feed_posts'
});
migrator.on('finish', function() {
  migrator.database.close();
  connection.end();
});

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
  //+ 'LIMIT 1 '
);

query.stream().pipe(migrator);
