### Indexes

So far the indexes that make sense to me are:

```javascript
db.feedposts.ensureIndex({'feed': 1});
db.feedposts.ensureIndex({'posted_by.id': 1});
db.feedposts.ensureIndex({'posted_for.id': 1});
db.feedposts.ensureIndex({'replies.posted_by.id': 1});
```

And a temporary index for adding comments to a post during the migration:

```javascript
db.feedposts.ensureIndex({'id': 1});
```

Test query to find feed posts posted by, posted for, or commented by me:

```javascript
db.feedposts.find({$or: [
  {'replies': {$elemMatch: {'posted_by.id': 363}}},
  {'posted_for.id': 363},
  {'posted_by.id': 363}
]}).explain();
```
