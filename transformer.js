var stream = require('stream');
var transformer = new stream.Transform({objectMode: true});

var transform = function(row) {
  var doc = {};
  doc.id = row.id;
  doc.message = row.message;
  if (row.username) {
    doc.posted_by = {
      username: row.username,
      name: row.nme
    };
  };
  doc.type = row.post_type;
  return doc;
};

transformer._transform = function(chunk, encoding, done) {
  this.push(transform(chunk));
  done();
};

module.exports = transformer;
