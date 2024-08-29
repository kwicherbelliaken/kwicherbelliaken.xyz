---
title: "Do not mock synchronous dependencies"
description: "This post is purely for testing the table of content, which should not be rendered"
publishDate: "22 Feb 2023"
tags: ["test", "toc"]
---

## Why you can spend more time on the toilet on your phone and less time unnecessarily mocking synchronous dependencies and looking up how to spell "unncecesarilly"

![A good ole' toilet break leg branding.](./on-toilet.png)

We have a function, **addDate**, that we want to test.

```typescript
// addDate.ts

import { addDateMapper } from "./module-addDate-depends-on.ts";

const addDate = (arr: Array<{ id: string }>): Array<{ id: string; date: Date }> => {
	const arrWithDate = addDateMapper(arr);

	return arrWithDate;
};
```

**addDate** pulls in a mapping utility, **addDateMapper**, which is synchronous, takes an array and adds a date field for each entry.

How would you test **addDate**? Well, we know it depends on **addDateMapper** so surely we need to mock it out?

```typescript
// addDate.test.ts

jest.mock("./module-addDate-depends-on.ts");

describe("addDate", () => {
	it("adds a date field to each entry in an array", () => {
		const input = [{ id: 1 }];
		const mockAddDateMapperResponse = [{ id: 1, date: Date.now() }];

		mocked(mapperFunction).mockReturnValue(mockAddDateMapperResponse);

		const response = await addDate(input);

		expect(response).toEqual(mockAddDateMapperResponse);
	});
});
```

Success. We have a test for **addDate**. We have reached coverage nirvana. Namaste. But did we need to mock **addDateMapper**? To answer this we'll need to answer the question, "why do we mock"?

### Why do we mock?

![[Pasted image Aug 28 (2).png]]
[CAPTION, YEAH I JUST PLAYED THAT CARD]

Unit testing involves focusing on [one element of the software at a time--hence the common term unit testing. The problem is that to make a single unit work, you often need other units](https://martinfowler.com/articles/mocksArentStubs.html#ChoosingBetweenTheDifferences "https://martinfowler.com/articles/mocksArentStubs.html#ChoosingBetweenTheDifferences").
To accommodate for these other collaborating units, tests must make use of a _Test Double_--a generic term for any kind of pretend object used in place of a real object for testing purposes. We introduce Test Double's when the real object our test depends on is awkward to work with. A mock is an example of a Test Double.

We mock when using the real implementation of a dependency would overly complicate our test. Take **fetch** as an example. Many things can go wrong with an API call—servers can fail, networks can go down, strange response codes might appear, or data might get corrupted. If you used the real **fetch** in your test, you'd have to handle all these potential issues. Suddenly, you're spending more time making sure **fetch** works correctly than testing what you actually came to test.

So, back to our original question, _"Did we need to mock **addDateMapper**?"._ Well, is **addDateMapper** _"awkward to work with"_? Is it comparable to **fetch**? Nope. Not at all. We don't need to mock it.

### No cap? We don't need to mock **addDateMapper**?

Bet. We don't need to mock it at all. Sounds like you finally have some time to confirm if the rumours about the French pole vaulter are [true](https://www.nbcnewyork.com/paris-2024-summer-olympics/french-pole-vaulter-video-anthony-ammirati-whats-next/5675990/).

```typescript title="addDate.test.ts" del={1,6,9,13} ins={7,14}
jest.mock("./module-addDate-depends-on.ts");

describe("addDate", () => {
	it("adds a date field to each entry in an array", () => {
		const input = [{ id: 1 }];
		const mockAddDateMapperResponse = [{ id: 1, date: Date.now() }];
		const mockExpectedResponse = [{ id: 1, date: Date.now() }];

		mocked(mapperFunction).mockReturnValue(mockAddDateMapperResponse);

		const response = addDate(input);

		expect(response).toEqual(mockAddDateMapperResponse);
		expect(response).toEqual(mockExpectedResponse);
	});
});
```

We can depend on the real implementation of **addDateMapper**. Notice how much this simplifies our test. We aren't tied up with setting up and defining the mock behaviour of **addDateMapper**. We are honed in on testing **addDate**. All our focus sits with verifying the function of **addDate**. This is much more in line with the purpose of the test.

Imagine if we fudged up the behavior of the **addDateMapper** mock, causing it to return something incorrect. Sure, we'd probably catch the mistake with some angry red squiggles. But what if we didn’t? Then the contract of **addDate** would be wrong, and the test’s expression of **addDate** would no longer match the real one. That's a problem—especially if we think of our tests as documentation for what they’re testing.

This leads me to a good rule of thumb.

### Only mock asynchronous dependencies

What if we tweaked our **addDate** function so that it called some async function in addition to our existing workflow? Let's have this `asyncFuncion` take our mapped response and perform some asynchronous job with it and then return it as output.

Remember this is a _very_ contrived example. Save your "are you stupid?"'s for the mirror.

```typescript title="addDate.ts" ins={6-8}
import { addDateMapper, asyncFunction } from "./module-addDate-depends-on.ts";

const addDate = async (arr: Array<{ id: string }>): Promise<Array<{ id: string; date: Date }>> => {
	const arrWithDate = addDateMapper(arr);

	const response = await asyncFunction(arrWithDate);

	return response;
};
```

Given our rule around _only mocking asynchronous dependencies_, our test would become.

```typescript title="addDate.test.ts"
import { asyncFunction } from "./module-addDate-depends-on.ts";

jest.mock("./module-addDate-depends-on.ts");

describe("addDate", () => {
	it("adds a date field to each entry in an array", async () => {
		const input = [{ id: 1 }];
		const mockExpectedResponse = [{ id: 1, date: Date.now() }];

		asyncFunction.mockResolvedValueOnce(mockExpectedResponse);

		const response = await addDate(input);

		expect(response).toEqual(mockExpectedResponse);

		expect(asyncFunction).toBeCalledTimes(1);
		expect(asyncFunction).toBeCalledWith(mockExpectedResponse);
	});
});
```

And it'd pass, right?

Nope.

It'd fail. It'd fail because we've mocked the whole **module-addDate-depends-on.ts** module but haven't provided mock behaviour for **addDateMapper** dependency. But didn't I say we didn't have to mock **addDateMapper** because it is a synchronous dependency? I did. But in mocking out the asynchronous dependency we have told the test to expect mocks for all other exports from the **module-addDate-depends-on.ts** module, which includes the synchronous **addDateMapper** utility. Annoying, right? And so our test becomes.

```typescript title="addDate.test.ts" ins={1,10,18,19}
import { asyncFunction, addDateMapper } from "./module-addDate-depends-on.ts";

jest.mock("./module-addDate-depends-on.ts");

describe("addDate", () => {
	it("adds a date field to each entry in an array", async () => {
		const input = [{ id: 1 }];
		const mockExpectedResponse = [{ id: 1, date: Date.now() }];

		addDateMapper.mockReturnValue(mockExpectedResponse);

		asyncFunction.mockResolvedValueOnce(mockExpectedResponse);

		const response = await addDate(input);

		expect(response).toEqual(mockExpectedResponse);

		expect(addDateMapper).toBeCalledTimes(1);
		expect(addDateMapper).toBeCalledWith(input);

		expect(asyncFunction).toBeCalledTimes(1);
		expect(asyncFunction).toBeCalledWith(mockExpectedResponse);
	});
});
```

There are a few points of frustration with this test.

First, the test has become tangled with mock implementations. Instead of zeroing in on addDate, we’re caught up in setting up and checking the mock behaviour of its sidekicks—addDateMapper and asyncFunction.

Second, we’ve opened the door to what I’d call mocking _creep_. If addDate pulls in another dependency from **module-addDate-depends-on.ts**, we’d have to mock that too. It’s unnecessary. It clutters the test. The same goes for any constants in play. Mocking a constant? That’s a waste of time, plain and simple.

%%
// This is what I had before I got Gippity to reword it.

One is how coupled this test has become to the mock implementations. Instead of our focus being on testing **addDate**, it's on establishing and verifying the mock behaviour of its collaborators **addDateMapper** and `asyncFunction`.

Two is how we've exposed ourselves to a sort of mocking _creep_. What happens if
**addDate** consumes another synchronous dependency from **module-addDate-depends-on.ts**? Well, we'd have to write code to mock it out as well. Code that is unnecessary. Code that adds noise to the test. The same is true for any constants that might be used. Surely we can agree that mocking a constant out is a poo time exercise.
%%

Thankfully we can avoid this nonsense entirely.

### 🪖 Corporal Jest, use the real implementation

We can tell Jest to use the real implementation of our synchronous **addDateMapper** dependency. We do this by pulling in the real module with the requireActual API.

```typescript title="addDate.test.ts" ins={1-6}
const mockAsyncFunction = jest.fn();

jest.mock("./module-addDate-depends-on.ts", () => ({
	...jest.requireActual("./module-addDate-depends-on.ts"),
	asyncFunction: mockAsyncFunction,
}));

describe("addDate", () => {
	it("adds a date field to each entry in an array", async () => {
		const input = [{ id: 1 }];
		const mockExpectedResponse = [{ id: 1, date: Date.now() }];

		mockAsync.mockResolvedValueOnce({});

		const response = await addDate(input);

		expect(response).toEqual(mockExpectedResponse);

		expect(asyncFunction).toBeCalledTimes(1);
		expect(asyncFunction).toBeCalledWith(mockExpectedResponse);
	});
});
```
