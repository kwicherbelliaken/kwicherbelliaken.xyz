---
title: "Using Async Utilities in The Context of Expensive Re-renders"
description: "Long renders can delay elements appearing in the DOM."
publishDate: 24 Oct 2024
updatedDate: 26 Oct 2024
tags: ["react", "jest", "testing", "react testing library"]
---

We need to remember that `setState` is asynchronous and that an expensive render can delay elements from showing in the DOM. This means that the asynchronous utilities that React Testing Library exposes for asserting the appearance or disappearance of elements is not limited to doing so in response to more obvious asynchronous operations like making a network call.

Most of the time, the time taken for a component to (re)render is negligible. However an expensive (re)render takes time and affects the appearance/disappearance of elements just the same as any other asynchronous operation.

We can simulate this.

We have a Component.

```javascript title="Component.jsx"
const Component = () => {
	return <div>{<p>Component has rendered!<p></div>;
}
```

And we have a test for this Component.

```javascript title="Component.test.jsx"
test("renders the component", async () => {
	render(<Component />);

	expect(screen.getByText("Component has rendered!")).toBeVisible();
});
```

And suddenly the time taken to render the Component has increased.

```javascript title="Component.jsx"
const Component = () => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
	const timer = setTimeout(() => {
	  setIsRendered(true);
	}, 1000);

	return () => clearTimeout(timer);
  }, []);

	return (
		<div>
		{isRendered ? <p>Component has rendered!</p> : <p>Loading...</p>}
		</div>;
	)
}
```

Which means our test will no longer pass and we would get the error.

```cli
TestingLibraryElementError: Unable to find an element with the text: Component has rendered.
```

The timeout mimics a slight delay before the content changes. To check if the expected updates show up or vanish in the DOM, we need to use an async query utility like `findByText`.

```javascript title="Component.test.jsx"
test("renders the component", async () => {
	render(<Component />);

	expect(await screen.findByText("Component has rendered!")).toBeVisible();
});
```

In general, `findBy` is unnecessary unless you are explicitly waiting for an async operation.

**What is perhaps most frustrating about this is that we can't predict whether a particular components (re)render will be long running enough that testing it requires using async utilities. And, as a consequence, we open the door to flaky tests.** One way to tackle this is by keeping our test payloads small. For instance, with a TableComponent, we can render just a few entries instead of loading a full, real set.​
