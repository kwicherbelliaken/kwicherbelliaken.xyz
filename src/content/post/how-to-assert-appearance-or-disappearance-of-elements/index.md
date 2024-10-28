---
title: "Assert The (Un)Presence of Elements in React Testing Library"
description: "Long renders can delay elements appearing in the DOM."
publishDate: 07 Oct 2024
updatedDate: 25 Oct 2024
tags: ["react", "jest", "testing", "react testing library"]
---

## TL;DR

1. **Check Element is Present:**

```javascript title="Greeting.test.jsx"
test("displays a greeting", async () => {
	render(<Component greeting="Hello There" />);

	expect(screen.getByText("Hello There")).toBeVisible();
});
```

2. **Check Element is Present After a Delay (asynchronous operation, includes setState re-render):**

```javascript title="Greeting.test.jsx"
test("displays a greeting", async () => {
	render(<Component />);

	await user.click(screen.getByText("Load Greeting"));

	expect(await screen.findByText("Hello There")).toBeVisible();
});
```

3. **Check Element is Not Present:**

```javascript title="Greeting.test.jsx"
test("hides user details", async () => {
	render(<Component />);

	expect(screen.queryByText("Username")).not.toBeVisible();
});
```

4. **Check Element is Not Present After a Delay (asynchronous operation, includes setState re-render):**

```javascript title="Greeting.test.jsx"
test("hides user details after collapsing section", async () => {
	render(<Component />);

	expect(screen.getByText("Username")).toBeVisible();

	await user.click(screen.getByRole("button", { name: /hide user details/i }));

	await waitFor(() => {
		expect(screen.queryByText("Username")).not.toBeVisible();
	});
});
```

5. **Check Element is Not Present After a Delay (asynchronous operation, includes setState re-render):**

```javascript title="Greeting.test.jsx"
test("hides user details after collapsing section", async () => {
	render(<Component />);

	expect(screen.getByText("Username")).toBeVisible();

	await user.click(screen.getByRole("button", { name: /hide user details/i }));

	await waitForElementToBeRemoved(screen.queryByText("Username"));
	// Followed by asserting on the presence of other elements.
});
```

### Asserting an Element is Present

Asserting the appearance of an element is dependent upon whether we expect changes to the DOM to happen immediately (synchronously) or asynchronously (delayed).

If we expect the element to be in the DOM unimpeded by a delay, we can use queries:

- **get\***

However, if we expect expect the element to be in the DOM after a delay (dependent upon some asynchronous operation **or setState triggered re-render**), we can use queries:

- **find\***
- **get\* (inside a waitFor)**

#### findBy

> `findBy` queries work when you expect an element to appear but the change to the DOM might not happen immediately.
>
> [Async Methods](https://testing-library.com/docs/dom-testing-library/api-async/#findby-queries)
>
> Advice: use `find*` any time you want to query for something that may not be available right away. `find*` looks cleaner and will output a nicer error message.
>
> [Common Mistakes With RTL](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#using-waitfor-to-wait-for-elements-that-can-be-queried-with-find)

Async methods are used to deal with asynchronous code. **These async methods aren't limited to network calls.** Remember that in React, state updates are asynchronous. This means that elements appearing or disappearing in the DOM in response to a user action are doing so asynchronously and therefore must be asserted against using asynchronous methods.

Imagine you are performing some filtering client side, and you expect one item to show and the other to be filtered out. This is how you could write your test:

```javascript
it("should filter entries", async () => {
	const user = userEvent.setup();

	user.click(await screen.findByRole("button", { name: /apply/i }));

	await waitFor(() => expect(screen.getByText(fakeIssueOneTitle)).toBeVisible(), { timeout: 1500 });
});
```

It should be noted that this code is the same as below because `findBy` methods are a [combination](https://testing-library.com/docs/dom-testing-library/api-async/#findby-queries) of `getBy` and `waitFor` utilities.

```javascript
expect(await screen.findByText(fakeIssueOneTitle)).toBeVisible(), {}, { timeout: 1500});
```

### Asserting an Element is NOT Present

To assert an element is not present in the DOM the `queryBy*` query should be used. Unlike the `getBy*` or `findBy*` queries, `queryBy*` does not throw an error if no elements match. It’s crucial to prove an element isn’t there because we’re counting on it **not** showing up in the query. Throwing an error when that happens misses the point.

> - `queryBy...`: Returns the matching node for a query, and return `null` if no elements match. This is useful for asserting an element that is not present.
> - `findBy...`: Returns a Promise which resolves when an element is found which matches the given query. The promise is rejected if no element is found [...]
>
> [Types of Queries](https://testing-library.com/docs/queries/about/#types-of-queries)

> The *only* reason the `query*` variant of the queries is exposed is for you to have a function you can call which does not throw an error if no element is found to match the query (it returns `null` if no element is found). The *only* reason this is useful is to verify that an element is not rendered to the page.
>
> [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#using-query-variants-for-anything-except-checking-for-non-existence)

## References

1. [Mastering Asynchronous Testing with React Testing Library](https://reliasoftware.com/blog/asynchronous-testing-with-react-testing-library): Clear example on testing loading states.
2. [Best Practices for Writing Tests with React Testing Library](https://claritydev.net/blog/improving-react-testing-library-tests): Great advice for writing meaningful tests with React Testing Library.
3. [Presence Check Patterns with React Testing Library/Jest](https://medium.com/@katie.radford/presence-check-patterns-with-react-testing-library-jest-993195e849c3): Good summary of assertion patterns. Pretty much copied in the TL;DR section.
4. [How to Use React Testing Library to Wait for Async Elements | Step-by-Step Guide](https://www.meticulous.ai/blog/how-to-use-react-testing-library-to-wait-for-async-elements-a-step-by-step-guide): Sort of explains the extra _waitForElementToBeRemoved_ utility.
