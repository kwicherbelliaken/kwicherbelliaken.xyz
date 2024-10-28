---
title: "Using Async Utilities Whenever a Components State Updates"
description: "Long renders can delay elements appearing in the DOM."
publishDate: 24 Oct 2024
updatedDate: 26 Oct 2024
tags: ["react", "jest", "testing", "react testing library"]
---

## TL;DR

State updates are asynchronous operations and so their outcomes must be asserted against using asynchronous utilities provided by React Testing Library.

## When to Use Asynchronous Queries

I thought that the outcome of state updates could be asserted synchronously.

```javascript title="Component.jsx"
const Component = () => {
	const [isRendered, setIsRendered] = useState(false);

	const handleClick = () => {
		setIsRendered(true);
	};

	return (
		<button onClick={handleClick}>
			{isRendered ? <div>I am rendered</div> : <div>I am not rendered, click me</div>}
		</button>
	);
};
```

Testing that the text content of the button changes on click.

```javascript title="Component.test.jsx"
test("shows new text when button is clicked", async () => {
	render(<Component />);

	const buttonToClick = screen.getByRole("button", { name: /Not rendered, click me/i });

	expect(buttonToClick).toBeVisible();

	user.click(buttonToClick);

	expect(screen.getByRole("button", { name: /I am rendered/i })).toBeVisible();
});
```

I would expect this test to be successful. But it fails.

```cli
TestingLibraryElementError: Unable to find an element with the text: I am rendered.
```

It fails because we are not waiting for the Component to process its state change and update. Updating the test to use an asynchronous query solves this.

```javascript title="Component.test.jsx"
expect(await screen.findByRole("button", { name: /I am rendered/i })).toBeVisible();
```

For a long time I thought that async queries were only for obvious asynchronous operations--network calls or timeouts, things like that. I thought that state updates were handled differently, that you could assert on their outcome as though they were synchronous. I thought this because of two reasons.

First, time and again, example [tests](https://www.freecodecamp.org/news/react-testing-library-tutorial-javascript-example-code/) don't use the async queries when checking a state update.

```javascript title="UserEventTestWithoutAsyncQueries.test.jsx"
test("test theme button toggle", () => {
	render(<App />);

	const buttonEl = screen.getByText(/Current theme/i);
	userEvent.click(buttonEl);

	expect(buttonEl).toHaveTextContent(/dark/i);
});
```

Secondly, every use case I’ve seen for these async queries involves a network call. The focus is always on testing asynchronous network calls, and this focus shows on the supported example page [here](https://react-testing-examples.netlify.app/) where [explicit attention](https://react-testing-examples.netlify.app/jest-rtl/fetch/) is drawn to the fact that the server request does not resolve immediately, necessitating the use of async utilities to verify the _state_ of the component. The same emphasis is [notably absent](https://react-testing-examples.netlify.app/jest-rtl/local-state/) from the _local state update_ example.

I didn’t think async queries were necessary when checking the DOM after a local state update. But it makes sense—and it’s clearly stated in the official documentation.

> Several utilities are provided for dealing with asynchronous code. These can be useful to wait for an element to appear or disappear in **response to an event, user action, timeout, or Promise**.
>
> [Example](https://testing-library.com/docs/react-testing-library/example-intro/#act)

I suppose we need to remember that `setState` is asynchronous and that a render can delay elements from showing in the DOM. Most of the time, the time taken for a component to (re)render is negligible. However an expensive (re)render takes time and affects the appearance/disappearance of elements just the same as any other asynchronous operation.

I explain a rule to only need a single async check per expected delay in [[Use One Async Query Per Expected Delay]].
