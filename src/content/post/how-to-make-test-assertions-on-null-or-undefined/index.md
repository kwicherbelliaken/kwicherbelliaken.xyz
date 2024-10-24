---
title: "Making Assertions on Properties That Are Null or Undefined"
description: "Use jest-extended matchers to make more accurate test assertions."
publishDate: 07 Oct 2024
updatedDate: 25 Oct 2024
tags: ["jest", "testing"]
---

The case is unique in that we don't know what the email field might resolve as. And we want to tell the assertion as such.

Say we have a User type:

```typescript
type User = {
	id: string;
	name: string;
	email: string | undefined;
};
```

Say we have a STOOPID function that retrieves a User, amongst other things:

```typescript title="getUser.test.ts"
describe('get user', () => {
  it('returns a user', () => {
    const user = getUser();

    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: <--- JEST, THIS CAN BE EITHER A STRING OR UNDEFINED?
      })
    );
  });
});
```

Jest exposes _matchers_ that allows us to make validations. In making assertions on the shape of a response we can use asymmetric matchers like `expect.any`. [They are only able to be used within a `toEqual` or `toHaveBeenCalledWith`](https://jestjs.io/docs/expect#expectanyconstructor). They are also limited in what they can assert. For instance, Jest does not expose an asymmetric matcher that can be used to assert a field as being null or undefined. So, how do extend Jest to allow for this?

We can use `jest-extended`, a [community maintained library of Jest matchers](https://github.com/jest-community/jest-extended). `jest-extended` exports a matcher `expect.toBeOneOf`:

```typescript title="getUser.test.ts" ins={9}
describe("get user", () => {
	it("returns a user", () => {
		const user = getUser();

		expect(user).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				name: expect.any(String),
				email: expect.toBeOneOf([expect.any(String), null, undefined]),
			}),
		);
	});
});
```

I discovered this utility in Chris Cooks blog post [Use expect.objectContaining With Null and Undefined](https://zirkelc.dev/posts/use-expectobjectcontaining-with-null-and-undefined). The installation process is outlined [here](https://jest-extended.jestcommunity.dev/docs/getting-started/setup).
