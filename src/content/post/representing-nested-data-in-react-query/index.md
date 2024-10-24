---
title: "Representing Hierarchical, Nested Data In React Query"
description: "Structure query keys from most generic to most specific to gain the best leverage over your query cache."
publishDate: 23 Oct 2024
updatedDate: 25 Oct 2024
tags: ["react", "react query"]
---

> Internally, the Query Cache is just a JavaScript object, where the keys are serialized Query Keys and the values are your Query Data plus meta information.
>
> [Effective Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)

Say we have a component that shows a list of `users` for an `account`. We fetch and populate a table view with `users`. The query key looks like this:

```javascript
// query key
[:accountId, 'account-users']

// cached data
{
	userIdA: {
		...userAAttributes
	},
	userIdB: {
		...userABttributes
	},
}
```

And we also have a component that shows a `users` profile in isolation. We have a need to retrieve a `user`.

```javascript
// query key
[:accountId, 'account-users', :userIdA]

// cached data
{
userIdA,
...userAAttributes
},
```

It feels odd to set another entry in the query cache when we already have `userA` in the account users cache. Now, with the same user in two places, we have to synchronise the entries.

Is there a way that we can set data into the cache such that I express this _nestedness_ of the data and make it easier to perform mutations/queries against a single expression of this data?

Nope.

Each entry in the query cache is its own slice. It may look like you're representing hierarchical or nested resources, but you're not. The query key's structure may suggest it, but the data in the cache stands alone as its own slice.

- `[:accountId, 'account-users']` maps to a list of account users.
- `[:accountId, 'account-users', :userId]` maps to an individual user on the account.

So, if you have populated the `account-users` cache but not the `:userId` cache and you try to access a particular user, you will return nothing because nothing has been set for this entry in the cache, for this specific user.

**A helpful way to conceptualise this is to think: one view for all users, another for a single user. Different views generally have different data requirements. For instance, the table view might only require a summary of the users' information, while the user profile requires more detail. Keeping them as separate entries in the cache makes sense.**

However, there is benefit to be found in [structuring your query keys from *most generic* to *most specific*](https://tkdodo.eu/blog/effective-react-query-keys#structure). It allows you to invalidate everything in the cache that contains the invalidate key in its query key. We can therefore invalidate everything _account users_ related with `['account-users']` which means all the users in the table as well as the individual user entries will be refetched.
