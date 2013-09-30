### Indexes

There needs to be a temporary index for adding comments to a post during the migration:

```javascript
db.feedposts.ensureIndex({'id': 1});
```

After the migration some indexes will need to be added. So far the indexes that make sense to me are:

```javascript
db.feedposts.ensureIndex({'feed': 1});
db.feedposts.ensureIndex({'posted_by.id': 1});
db.feedposts.ensureIndex({'posted_for.id': 1});
db.feedposts.ensureIndex({'replies.posted_by.id': 1});
```

Test query to find feed posts posted by, posted for, or commented by me:

```javascript
db.feedposts.find({$or: [
  {'replies': {$elemMatch: {'posted_by.id': 363}}},
  {'posted_for.id': 363},
  {'posted_by.id': 363}
]}).explain();
```
### Migrator options

The options that you can pass into the migrator are:

- *database* - The URL for the MongoDB database to migrate into. The default is `mongodb://localhost/test`.
- *collection* - The name of the collection to migrate into. The default is `feedposts`.