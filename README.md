### Usage

Install dependencies, run the tests, and run the migration:
```bash
$ npm install
$ npm test
$ npm start
```

Generate coverage reports:
```bash
$ npm install -g istanbul
$ make cover
```

### Indexes

There need to be some temporary indexes for handling replies during the migration:

```javascript
db.feedposts.ensureIndex({'id': 1});
db.feedposts.ensureIndex({'replies.id': 1});
```

After the migration some indexes will need to be added. So far the indexes that make sense to me are:

```javascript
db.feedposts.ensureIndex({'feed': 1});
db.feedposts.ensureIndex({'postedBy.id': 1});
db.feedposts.ensureIndex({'postedFor.id': 1});
db.feedposts.ensureIndex({'replies.postedBy.id': 1});
```

Test query to find feed posts posted by, posted for, or commented by me:

```javascript
db.feedposts.find({
  $or: [
    {'replies.postedBy.id': 363},
    {'postedFor.id': 363},
    {'postedBy.id': 363}
  ]
}).explain();
```
### Migrator options

The options that you can pass into the migrator are:

- *database* - The URL for the MongoDB database to migrate into. The default is `mongodb://localhost/test`.
- *collection* - The name of the collection to migrate into. The default is `feedposts`.