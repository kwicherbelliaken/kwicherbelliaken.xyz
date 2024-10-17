---
title: "Why Conditional Class Utilities Might Not Be Necessary"
description: "A case for using TailwindCSS pseudo-classes instead of conditional class utilities like clsx and classnames."
publishDate: 18 Oct 2024
updatedDate: 18 Oct 2024
tags: ["design system", "css"]
---

> A [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) **_pseudo-class_** is a keyword added to a selector that specifies a special state of the selected element(s).
>
> [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes).

Common pseudo classes include `hover`, `disabled`, `active`.

TailwindCSS has first class support for pseudo class modifiers. This means that:

> Every utility class in Tailwind can be applied *conditionally* by adding a modifier to the beginning of the class name that describes the condition you want to target.
>
> [Handling Hover, Focus, And Other States](https://tailwindcss.com/docs/hover-focus-and-other-states#pseudo-classes)

As I discuss in [[A Design System Worthy Tag Component For Kwicherbelliaken#What is CLSX?]] utilities like `clsx` and `classnames`'s job is to:

> ... make dynamic and conditional `className` props simpler to work with (especially more so than conditional string manipulation).
>
> [classnames README](https://github.com/JedWatson/classnames?tab=readme-ov-file#usage-with-reactjs)

But they can be abused to apply conditional styles that are already accommodated by TailwindCSS's support for pseudo class modifiers.

```javascript title="ImproperConditionalStylingComponent.jsx"
<Button
	isDisabled={isSaveDisabled}
	className={classNames(
	  'text-sm inline-flex justify-center ...',
	  { 'cursor-not-allowed bg-opacity-50': isSaveDisabled }
	)}
>
```

A simpler approach, and one that leverages TailwindCSS's `disabled` [pseudo class modifiers](https://tailwindcss.com/docs/hover-focus-and-other-states#pseudo-class-reference), which makes the need for the classNames utility redundant.

```javascript title="ImproperConditionalStylingComponent.jsx" ins={3,4}
<Button
	isDisabled={isSaveDisabled}
	className="... disabled:cursor-not-allowed disabled:bg-opacity-50"
>
```

But this is not to say they don't have an application and aren't useful. Say we now needed to handle a loading state for this Button, well this is where this utility becomes very helpful:

```javascript title="ImproperConditionalStylingComponent.jsx" ins={5}
<Button
	isDisabled={isSaveDisabled}
	className={classNames(
	  '... disabled:cursor-not-allowed disabled:bg-opacity-50',
	  { 'bg-blue-50 animate': isLoading }
	)}
>
```

There are of course more _real world_ examples to be found:

```javascript title="ModalExample.jsx"
<Modal
	className={({ isEntering, isExiting }) =>
		classNames(
			"tw-w-full tw-max-w-md tw-overflow-hidden tw-rounded-2xl tw-p-6 tw-text-left tw-align-middle",
			{
				"tw-animate-in tw-zoom-in-95 tw-ease-out tw-duration-300": isEntering,
				"tw-animate-out tw-zoom-out-95 tw-ease-in tw-duration-200": isExiting,
			},
		)
	}
/>
```
