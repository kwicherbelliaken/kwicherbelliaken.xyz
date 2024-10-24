---
title: "Effects Run on Component Render, Not on User Action"
description: "Effects allow you to synchronise components with an external system when that component renders."
publishDate: 30 Aug 2024
updatedDate: 25 Oct 2024
tags: ["react"]
---

## What Are _Effects_?

There is a definition that [Effects allow you to synchronise components with an external system](https://react.dev/learn/you-might-not-need-an-effect), such as a third party API. I think this is too broad and slightly misleading. As I explain later on, I think this definition should be narrowed to _"Effects allow you to synchronise components with an external system **when that component renders**"_. This is a qualification that we see further down in the official documentation:

> Effects run at the end of a [commit](https://react.dev/learn/render-and-commit) **after the screen updates**. This is a good time to synchronise the React components with some external system (like network or a third-party library).
>
> [What Are Effects?](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events)

### What Code Should Effects Run?

A good rule-of-thumb for Effects is that they should only run code in response to the component being displayed to the user. They should not be used for code that is responding to an interaction performed by the user.

> **_Effects_ let you specify side effects that are caused by rendering itself, rather than by a particular event.**
>
> [What are Effects and how are they different from events?](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events)
>
> [...] whether to put some logic into an event handler or an Effect, the main question you need to answer is _what kind of logic_ it is from the user’s perspective. If this logic is caused by a particular interaction, keep it in the event handler. If it’s caused by the user _seeing_ the component on the screen, keep it in the Effect.
>
> For instance, a notification should appear because a user _pressed the button_, not because the page was displayed. You only want to show the notification in response to a specific event, a particular interaction.
>
> [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect#sharing-logic-between-event-handlers)

The distinction is best explained using an [example](https://www.epicreact.dev/myths-about-useeffect):

```javascript title="DogInfo.jsx"
function DogInfo({ dogId }) {
	const [dog, setDog] = React.useState(null);

	React.useEffect(() => {
		const controller = new AbortController();
		getDog(dogId, { signal: controller.signal }).then(
			(d) => setDog(d),
			(error) => {
				// handle the error
			},
		);
		return () => controller.abort();
	}, [dogId]);

	return <div>{/* render dog's info */}</div>;
}
```

- `DogInto` mounts, a call is made to fetch data about the dog (`dogId`) in question. **The component is being displayed to the user for the first time.**
- `DogInfo` re-renders because `dogId` changed. The component must _display_ something new, and part of that is fetching fresh data that corresponds to the new `dogId`. **The component has updated and must display something new.**

Does this mean Effects should only run code when the component mounts? No. Effects **aren’t meant** to replace class lifecycle methods like `constructor`, `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. Sometimes they overlap—like when you fetch data as a component mounts—but that’s not their main purpose. Their purpose is to manage code that runs when a component displays to a user.

What if the `dogId` wasn't passed as a prop and was instead kept as local state. Well, handling the fetching of the dog inside the effect would be improper. Remember:

> [...] the main question you need to answer is _what kind of logic_ it is from the user’s perspective. If this logic is caused by a particular interaction, keep it in the event handler, otherwise put it in an Effect.

In our example, the logic for fetching a dog is triggered by a users' interaction. It therefore makes sense to move the logic in the Effect into an event handler.

```javascript title="DogInfo.jsx" ins={5-13, 17}
function DogInfo() {
	const [dog, setDog] = React.useState(null);
	const [dogId, setDogId] = React.useState(null);

	async function handleChange(dogId) {
		const controller = new AbortController();
		getDog(dogId, { signal: controller.signal }).then(
			(d) => setDog(d),
			(error) => {
				// handle the error
			},
		);
	}

	return (
		<div>
			<Combobox onChange={handleChange} />
		</div>
	);
}
```

The _weirdness_ comes when we consider the two pieces of advice we've been recommended and it feels like they are in conflict:

- You don’t need Effects to handle user events.
- You do need Effects to synchronise with external systems.

Well, in fetching the dog, aren't we synchronising with an external system? So, shouldn't this code then be in an Effect and not an event handler? This is where that distinction we made earlier becomes so important—whether the code runs because the component renders or because of something the user does.​

> **_Effects_ let you specify side effects that are caused by rendering itself, rather than by a particular event.**

The fetching of the dog is driven off a user event. It therefore stands that this logic be run in an event handler.

### Running the Same Logic in Effects and Event Handlers

It is entirely possible that you have the same logic in both an Effect and an event handler. Take the example of a ChatRoom component that must synchronise with a feed when:

- It's first made visible on the screen.
- A user has sent a message.

The first time the ChatRoom connects to the feed, it’s because it rendered and showed up on the screen. So, it makes sense to run that logic in an Effect. The second time, it connects because the user sent a message. That’s why the logic belongs in an event handler. Per the React documentation:

> Sending a message in the chat is an _event_ because it is directly caused by the user clicking a specific button. However, setting up a server connection is an _Effect_ because it should happen no matter which interaction caused the component to appear. Effects run at the end of a [commit](https://react.dev/learn/render-and-commit) after the screen updates. This is a good time to synchronise the React components with some external system (like network or a third-party library).
>
> [What Are Effects?](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events)

## References

1. [What are Effects and how are they different from events?](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events): Super clear distinction between code that should run in event handlers and code that should run in Effects.
2. [Goodbye useEffect](https://www.youtube.com/watch?v=bGzanfKVFeU).
