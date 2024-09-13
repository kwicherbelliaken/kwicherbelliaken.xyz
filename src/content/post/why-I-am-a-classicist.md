---
title: "My Preferred Approach to Testing (Mockist vs. Classicist)"
description: "Explore the differences between Mockist and Classicist testing styles, their pros and cons, and discover my preferred approach to effective testing."
publishDate: 06 Aug 2024
updatedDate: 13 Sept 2024
tags: ["testing", "jest"]
---

## A Mockist and a Classicist Walk into a Test

Unit testing involves focusing on [one element of the software at a time--hence the common term unit testing. The problem is that to make a single unit work, you often need other units](https://martinfowler.com/articles/mocksArentStubs.html#ChoosingBetweenTheDifferences "https://martinfowler.com/articles/mocksArentStubs.html#ChoosingBetweenTheDifferences").

To accommodate for these other collaborating units, tests must make use of a _Test Double_--a generic term for any kind of pretend object used in place of a real object for testing purposes. We introduce Test Double's when the real object our test depends on is awkward to work with. A mock is an example of a Test Double.

In his article [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html#ChoosingBetweenTheDifferences "https://martinfowler.com/articles/mocksArentStubs.html#ChoosingBetweenTheDifferences"), Martin Fowler explains the difference between Classicist and Mockist testing, with a key distinction being in how they use test doubles.

A Classicist uses real objects in tests, resorting to test doubles only when it is awkward to use the real thing. They verify the final state to check the systems intent, ignoring how the state was reached. In contrast, a Mockist uses mocks for objects with interesting behaviour, verifying interactions to ensure correct calls to dependencies. Mock tests focus on unit interactions and are more coupled to the method's implementation.

## Walkthrough

In this blog post I want to explain why I think a Classicist approach to testing offers more benefits than a Mockist approach. I am going to use a contrived example to convey my point, so bear that in mind.

**TL;DR:**

> A classicist approach to testing forces us to write richer more expressive test suites that better document the thing being tested. They do this by ensuring the greatest degree of real implementation is being tested at any one time.
>
> In essence classicist unit tests are not just unit tests, but also mini-integration tests. Because they push down and away the need to introduce test doubles, they mean that more of the code in deeper layers is being run at any one time.
>
> Because Mockist tests focus so much on behavioral validation and the behaviors are defined by the mocks, they become tied to implementation details. As a result, Mockist tests are more connected to the method's implementation. Changing how calls are made to collaborators often causes a Mockist test to fail.
>
> There is the risk when mocking that expectations on mockist tests can be incorrect, resulting in unit tests that run green but mask inherent errors.

We have an HTTP endpoint, `addUserEndpoint`, which we want to test.

```javascript title="addUserEndpoint.js"
import { addUser } from "../addUser";

export const addUserEndpoint = async (event) => {
	const { email } = event.body;

	const user = await addUser(email);

	return {
		statusCode: "201",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(user),
	};
};
```

### How a Mockist Would Test This

To test `addUserEndpoint` we can mock out the `addUser` method, as it is the only dependency used. We do this by telling the mock (`addUser`) what to expect during setup and asking the mock to verify itself during verification.

```javascript title="addUserEndpoint.test.js"
describe("[MOCKIST] addUser", () => {
	it("successfully adds a new user", async () => {
		jest.mocked(addUser).mockResolvedValue(user); // SET UP THE MOCK BEHAVIOUR

		const result = await rawHandler(baseEvent);

		expect(result).toEqual(
			expect.objectContaining({
				statusCode: httpStatus.OK,
				body: expect.any(String),
			}),
		);

		expect(JSON.parse(result.body)).toEqual(user);

		expect(addUser).toHaveBeenCalledWith(baseEvent.body.email); // VERIFY THE MOCK WAS CALLED
	});
});
```

Everything looks good. Now to throw a spanner in the works. What if the `addUser` method performs a validation check on the email it is passed? Like below. We would expect that if we invoked our endpoint with a bad email that it would throw an error.

```javascript title="addUser.js
export const addUser = async (email) => {
  if (!validateEmail) {
	  throw new Error('Provided email was invalid');
  }
```

Let’s see if we pick this up in our test.

```javascript
// addUserEndpoint.test.ts

it("successfully adds a new user", async () => {
	jest.mocked(addUser).mockResolvedValue(user);

	const result = await rawHandler({
		...baseEvent,
		body: {
			email: "something-that-fails-validation", // THIS SHOULD FAIL VALIDATION
		},
	});

	expect(result).toEqual(
		expect.objectContaining({
			statusCode: httpStatus.OK,
			body: expect.any(String),
		}),
	);

	expect(JSON.parse(result.body)).toEqual(user);

	expect(addUser).toHaveBeenCalledWith(baseEvent.body.email);
});
```

Nope. The test would still pass, even though it would fail outside this test environment, in a real-world scenario. This is because we've defined the behavior of the `addUser` method, altering the endpoints behavior to fit our mock. There is the risk when mocking that expectations on mockist tests can be incorrect, resulting in unit tests that run green but mask inherent errors.

Sure, we can change the mocks behaviour to support the fail case, but the issue with this is two fold. Firstly, we are spending more time and focus on the mocks behaving a certain way than the thing we meant to be testing; and, secondly, we have to tell the test how to behave, instead of the test showing us how the thing we are testing actually works.

By taking a Mockist approach, I believe we miss the opportunity to create accurate, rich, and descriptive test suites that effectively document the contract of this endpoint. However, this is an opportunity we succeed in when taking a Classicist approach.

### How a Classicist Would Test This

This isn't entirely a classicist approach. Remember:

> A Classicist writes their tests using real objects if possible and a test double if it's awkward to use the real thing.

In our example, it makes sense to mock the service layer since it is the farthest from the endpoint and offers the most easily mockable abstraction. This approach preserves the real implementation for most of the call stack. We only introduce a mock where doing otherwise would be inconvenient.

Let's start where we left off with the Mockist test. We had a false positive. Despite passing an invalid email to the handler, we were still getting a positive test.

Because we no longer mock the `addUser` method we are running its real implementation. The test `"successfully adds a new user"` now fails because `addUser` is no longer mocked and we trigger the email validation error. Fantastic. By using the real implementation of collaborators, we have fixed our false positive and described the contract of the endpoint more accurately in the process: now consumers of this endpoint know that passing an invalid email in results in an error, see the `"fails to add a new user because provided email is invalid"` test.

```javascript
// addUserEndpoint.js

describe('[CLASSICIST] addUserEndpoint', () => {
  it('successfully adds a new user', async () => {
    ...
  });

  it('fails to add a new user because provided email is invalid', async () => {
    jest.mocked(createUsers).mockResolvedValue([user]);

    const result = await rawHandler({ ...baseEvent, body: {
      email: 'something-that-fails-validation'
    }});

    expect(result).toEqual(
      expect.objectContaining({
        statusCode: httpStatus.BAD_REQUEST,
      })
    );
  });
});
```

Importantly, we have better described the contract of this endpoint. Anyone who reads these tests will understand that. Though it could have been communicated in the Mockist test, it wasn’t. Whereas for the Classicist test it is on full display. We get a richer, more expressive test suite for this endpoint that better self documents and sets expectations.
