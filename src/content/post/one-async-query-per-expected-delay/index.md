---
title: "Use One Async Query Per Expected Delay"
description: "Use only one `await` for each expected delay in async React Testing Library tests."
publishDate: 24 Oct 2024
updatedDate: 26 Oct 2024
tags: ["jest", "testing", "react testing library"]
---

> It's worth noting that one `await` call per test block is usually sufficient, as all async actions have been resolved by that point.
>
> [Best Practices for Writing Tests with React Testing Library](https://claritydev.net/blog/improving-react-testing-library-tests)

Say we are testing some filtering behaviour and this filtering is an expensive operation. This means the component takes longer to render. We therefore know that we will have to use async utilities to assert the appearance or disappearance of elements. But here’s the thing: we only need one async query for each expected delay. Once we've waited for an element to appear or vanish, the DOM’s in a _post-delay_ state. From there, we can make any further checks without waiting again.

In filtering, we expect some content to stay and some to disappear. We can choose to wait for either outcome—but there’s no need to wait for both.

We do this.

```javascript
it("should filter the list", async () => {
	// Apply the filter.
	user.click(await screen.findByRole("button", { name: /apply/i }));

	// Assert the outcome of filtering.
	expect(await screen.findByText(firstEntry)).toBeVisible();

	expect(screen.queryByText(secondEntry)).not.toBeInTheDocument();
});
```

Or this.

```javascript
it("should filter the list", async () => {
	// Apply the filter.
	user.click(await screen.findByRole("button", { name: /apply/i }));

	// Assert the outcome of filtering.
	await waitForElementToBeRemoved(screen.queryByText(secondEntry));

	expect(screen.getByText(firstEntry)).toBeVisible();
});
```

Not this.

```javascript
it("should filter the list", async () => {
	// Apply the filter.
	user.click(await screen.findByRole("button", { name: /apply/i }));

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
	// Apply the filter.
	user.click(await screen.findByRole("button", { name: /apply/i }));

	// Assert the outcome of filtering.
	await waitForElementToBeRemoved(screen.queryByText(secondEntry));

	expect(await screen.findByText(firstEntry)).toBeVisible();
});
```
