---
title: "Use One Async Query Per Expected Delay"
description: "Use only one `await` for each expected delay in async React Testing Library tests."
publishDate: 24 Oct 2024
updatedDate: 26 Oct 2024
tags: ["jest", "testing", "react testing library"]
---

## Remember, One Await Per Delay

> It's worth noting that one `await` call per test block is usually sufficient, as all async actions have been resolved by that point.
>
> [Best Practices for Writing Tests with React Testing Library](https://claritydev.net/blog/improving-react-testing-library-tests)

Say we are testing some client side filtering behaviour. We expect delays while the component updates in response to the filtering operation. We therefore know that we will have to use async utilities to assert the appearance or disappearance of elements.

But here’s the _rub_: we only need one async query for each expected delay. Once we've waited for an element to appear or vanish, the DOM’s in a _post-delay_ state. From there, we can make any further checks without waiting again.

We do this.

```javascript
it("should filter the list", async () => {
	// Assert the outcome of filtering.
	expect(await screen.findByText(firstEntry)).toBeVisible();
	expect(screen.queryByText(secondEntry)).not.toBeInTheDocument();
});
```

Or this.

```javascript
it("should filter the list", async () => {
	// Assert the outcome of filtering.
	await waitForElementToBeRemoved(screen.queryByText(secondEntry));
	expect(screen.getByText(firstEntry)).toBeVisible();
});
```

Not this.

```javascript
it("should filter the list", async () => {
	// Assert the outcome of filtering.
	expect(await screen.findByText(firstEntry)).toBeVisible();
	await waitFor(() => {
		expect(screen.queryByText(secondEntry)).not.toBeInTheDocument();
	});
});
```

And not this.

```javascript
it("should filter the list", async () => {
	// Assert the outcome of filtering.
	await waitForElementToBeRemoved(screen.queryByText(secondEntry));
	expect(await screen.findByText(firstEntry)).toBeVisible();
});
```

### A More Real World Example

Here is a real world example of misusing the async queries.

```javascript title="FilterComponent.test.jsx"
it("should filter the list", async () => {
	const firstEntry = "Sam";
	const secondEntry = "Mary";

	render(<Component />);

	await waitForSpinnerToDisappear();

	// Assert pre-filter state
	expect(screen.getByText(firstEntry)).toBeVisible();
	expect(screen.getByText(secondEntry)).toBeVisible();

	// Open the filter dialog
	user.click(await screen.findByRole("button", { name: /filter/i }));
	expect(await screen.findByRole("heading", { name: /filter/i })).toBeInTheDocument();

	// Select a filter
	user.click(await screen.findByRole("button", { name: /responsible user/i }));
	user.click(await screen.findByRole("menuitem", { name: firstEntry }));
	expect(
		await within(screen.getByLabelText(/responsible user/i)).findByText(firstEntry),
	).toBeInTheDocument();

	// Apply the filter
	user.click(await screen.findByRole("button", { name: /apply/i }));

	// Check that only the first entry is displayed
	expect(await screen.findByText(firstEntry)).toBeInTheDocument();
	await waitFor(() => expect(screen.queryByText(secondEntry)).not.toBeInTheDocument());
});
```

And this is how I would refactor this test.

```javascript title="FilterComponent.test.jsx" {"1. No expected delay. Button renders on page load. We do have to await the dialog opening off the button click.":14-15} {"2. We do have to await the dialog opening off the button click.":16-17} {"3. The dialog is open. A delay has already been processed. No expected delay to find this button.":20-21} {"4. Both these elements appear after a user event and therefore require a delay.":22-26} {"5. The dialog is open. The submit button is already present.":29-30} {"6. Wait for the dialog to be torn down before asserting on outcome of filtering.":31-32} {"7. Note the abscence of async queries. This is post filtering, post delay. The DOM is stable.":33-35}
it("should filter the list", async () => {
	const firstEntry = "Sam";
	const secondEntry = "Mary";

	render(<Component />);

	await waitForSpinnerToDisappear();

	// Assert pre-filter state
	expect(screen.getByText(firstEntry)).toBeVisible();
	expect(screen.getByText(secondEntry)).toBeVisible();

	// Open the filter dialog

	user.click(screen.getByRole("button", { name: /filter/i }));

	expect(await screen.findByRole("heading", { name: /filter/i })).toBeInTheDocument();

	// Set a filter

	user.click(screen.getByRole("button", { name: /responsible user/i }));

	user.click(await screen.findByRole("menuitem", { name: firstEntry }));
	expect(
		await within(screen.getByLabelText(/responsible user/i)).findByText(firstEntry),
	).toBeInTheDocument();

	// Apply the filter

	user.click(screen.getByRole("button", { name: /apply/i }));

	await waitForElementToBeRemoved(screen.getByRole("heading", { name: /filter/i }));

	expect(screen.getByText(firstEntry)).toBeVisible();
	expect(screen.queryByText(secondEntry)).not.toBeInTheDocument();
});
```

### An Important Consideration

**NOT SURE IF THIS IS TRUE.**

It is worth noting that **if you're relying on an async query to hold up the test so you can use regular queries, it doesn’t work that way**. Async queries in an expectation won’t wait for the DOM to reach a specific, post delayed state.

This won't work:

```javascript title="FilterComponent.test.jsx"
expect(await screen.findByText(firstEntry)).toBeVisible();
expect(screen.queryByText(secondEntry)).not.toBeInTheDocument();
```

But this will:

```javascript title="FilterComponent.test.jsx"
const firstEntryPostFilter = await screen.findByText(firstEntry);

expect(firstEntryPostFilter).toBeVisible();
expect(screen.queryByText(secondEntry)).not.toBeInTheDocument();
```

And this will:

```javascript title="FilterComponent.test.jsx"
await waitForElementToBeRemoved(screen.queryByText(secondEntry));

expect(firstEntry).toBeVisible();
expect(screen.queryByText(secondEntry)).not.toBeInTheDocument();
```

Because the async queries work this way, this is why you'll often see seemingly redundant, but essential, doubled up async queries.

```javascript title="FilterComponent.test.jsx"
expect(await screen.findByText(firstEntry)).toBeVisible();
await waitFor(() => expect(screen.queryByText(secondEntry)).not.toBeInTheDocument());
```
