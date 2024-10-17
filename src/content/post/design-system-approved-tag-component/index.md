---
title: "A Design System Worthy Tag Component"
description: "How to create a design system appropriate Tag component."
publishDate: 13 Oct 2024
updatedDate: 18 Oct 2024
tags: ["design system", "css"]
---

## Why Tags?

I use tags to sort my blog topics. I recognised that, as a component, they offered a good first step exercise in building a Kwicherbelliaken specific design system component.

### Introducing an Accent Colour Token

Material Design's definition for a secondary colour:

> A **secondary color** provides more ways to accent and distinguish your product. Having a secondary color is optional, and should be applied sparingly to accent select parts of your UI.
>
> If you don’t have a secondary color, your primary color can also be used to accent elements.
>
> Secondary colors are best for:
>
> - Floating action buttons
> - Selection controls, like sliders and switches
> - Highlighting selected text
> - Progress bars
> - Links and headlines
>
> [Material Design Colours](https://m2.material.io/design/color/the-color-system.html#color-theme-creation)

For me, my secondary colour is red. So, I need to introduce this into my design system as a functional colour token. I used the same approach I took in [Tasting The Rainbow of Colour Design Tokens](https://kwicherbelliaken.studio/posts/tasting-the-rainbow-of-colour-design-tokens/) to determine the base scale for this red.

```typescript title="designToken.ts"
const baseColourTokens = {
	red: {
		// bgColour utilities
		50: "hsl(var(--base-colour-red-50) / <alpha-value>)",
		100: "hsl(var(--base-colour-red-100) / <alpha-value>)",
		200: "hsl(var(--base-colour-red-200) / <alpha-value>)",
		300: "hsl(var(--base-colour-red-300) / <alpha-value>)",
		400: "hsl(var(--base-colour-red-400) / <alpha-value>)",
		// borderColour utilities
		500: "hsl(var(--base-colour-red-500) / <alpha-value>)",
		600: "hsl(var(--base-colour-red-600) / <alpha-value>)",
		700: "hsl(var(--base-colour-red-700) / <alpha-value>)",
		// fgColour utilities
		800: "hsl(var(--base-colour-red-800) / <alpha-value>)",
		900: "hsl(var(--base-colour-red-900) / <alpha-value>)",
		950: "hsl(var(--base-colour-red-950) / <alpha-value>)",
	},
};
```

I then exposed this red as a functional colour token following Primer's pattern of semantically naming the role that it is associated with. I thought it more sensible to follow Primer's approach to declaring this accent colour as a semantically named _accent_ rather than introducing it as a _secondary_ colour and having its role obscured.

```typescript title="designToken.ts"
export const functionalColourTokens = {
	["fgColour-accent"]: baseColourTokens.red["950"],
};
```

### Naming The Component

As mentioned, I wanted a component that I could use to communicate contextual metadata about the category a blog post belonged to. Per Primer's documentation, I wanted a component that:

> ... visually stylized to differentiate it as contextual metadata. It can be used to add a status, category, or other metadata to a design.
>
> [Primer - Label Component](https://primer.style/components/label)

I researched how different design systems and ready-to-use component solutions solve for this component:

- [Polaris (Shopify)](https://polaris.shopify.com/components/selection-and-input/tag?example=tag-with-link) calls it a Tag component.
- [Primer (Github)](https://primer.style/components/label/) calls it a Label component.
- [React Aria](https://react-spectrum.adobe.com/react-aria/TagGroup.html#tag) calls it a Tag component.
- [ShadCN](https://ui.shadcn.com/docs/components/badge) calls it a Badge component.

I settled on **Tag**. I think Polaris made the best case that a Tag is a precursor to a Badge. It explains that a beyond a Tag, a Badge component should:

> ... show the status of an object. It should show the tone of an object or the action that has been taken.
>
> [Polaris - Badge Component](https://polaris.shopify.com/components/feedback-indicators/badge?example=badge-with-tone-and-progress-label-override)

I had my name: **Tag**. But how was I going to write it?

### Writing The Component

I looked through different sources to find inspiration for the signature of this component. I liked the way [ShadCN handled its Badge component](https://ui.shadcn.com/docs/components/badge).

```typescript title="shadcn-badge-component.ts"
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
```

But I didn't understand what cva (Class Variance Authority) was.

#### What is Class Variance Authority?

Establishing a style API for a common component is a difficult task. Manually matching classes to props and having type support throughout can be a headache and most solutions fail to scale appropriately.

Think, if the component isn't built right, it’s hard to refactor and extend to support any new cases. No one wants their change to break what's already working. Instead of risking a refactor to suit new requirements, it’s easier to copy the component. But that leads to scattered, duplicated versions. They all need updating together to stay consistent. In copying, we’ve strayed from the single source of truth. This [headache is known as shotgun surgery](https://frontendmastery.com/posts/advanced-react-component-composition-guide/#how-does-this-scale).

This is where cva steps in:

> `cva` aims to take those pain points away, allowing you to focus on the more fun aspects of UI development.
>
> [CVA Documentation](https://cva.style/docs)

Using the ShadCN Badge example, cva (Class Variance Authority) is a utility that helps manage dynamic CSS class names, allowing you to define variant-based styling for components. It simplifies class composition by creating variants for different states (e.g., size, intent) and combining them efficiently.

```typescript title="shadcn-badge-component.ts"
const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);
```

I also found this resource from [Coding in Public](https://www.youtube.com/watch?v=kHQNK2jU_TQ&t=895s) to be really helpful:

This is my Tag component using the Class Variance Authority library. I wrote it as an Astro component because Kwicherbelliaken is an Astro site and CVA had an Astro explainer.

```javascript title="Tag.astro"
---
import type { HTMLAttributes } from "astro/types";

import { type VariantProps, cva } from "cva";

const tag = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		compoundVariants: [{ class: "uppercase", size: "medium", variant: "primary" }],
		variants: {
			size: {
				medium: ["text-base", "py-2", "px-4"],
				small: ["text-sm", "py-1", "px-2"],
			},
			variant: {
				accent: "text-fgColour-accent border-fgColour-accent shadow hover:text-fgColour-accent/60",
				primary:
					"text-fgColour-default border-fgColour-default shadow hover:text-fgColour-default/60",
				secondary: "text-fgColour-muted border-fgColour-muted shadow hover:text-fgColour-muted/60",
			},
		},
	}
);

export interface TagProps extends HTMLAttributes<"span">, VariantProps<typeof tag> {}

/**
 * For Astro components, we recommend setting your defaultVariants within
 * Astro.props (which are `undefined` by default)
 */
const { size = "medium", variant = "primary" } = Astro.props;
---

<span class={tag({ size, variant })}>
	<slot />
</span>

```

But I wasn't finished. Both the Coding in Public video and ShadCN made use of two other libraries: Tailwind Merge and CLSX.

#### What is Tailwind Merge?

[Tailwind Merge](https://www.npmjs.com/package/tailwind-merge) is a library that, amongst other things, removes conflicting classes. It loads only the classes that legitimately affect an element's style. It follows the classic CSS convention of letting classes listed lower in the stylesheet take priority. Using the example below, className would evaluate as `p-3` because `px-2` and `py-1` are ignored as styles.

```javascript
<div className={twMerge("px-2 py-1", "p-3")} />
```

Adding `twMerge` to my example:

```javascript title="Tag.astro"
<span class={twMerge(tag({ size, variant }))}>
	<slot />
</span>
```

Tailwind Merge is a powerful tool when paired with `clsx`. `clsx` handles conditional classes, and `twMerge` combines the results.

#### What is CLSX?

As mentioned, `clsx` is a utility for conditionally constructing classnames. It is very similar to the `classnames` utility which defines its primary use case as:

> ... is to make dynamic and conditional `className` props simpler to work with (especially more so than conditional string manipulation).
>
> [classnames README](https://github.com/JedWatson/classnames?tab=readme-ov-file#usage-with-reactjs)

```javascript title="Button.jsx"
import React, { useState } from "react";

export default function Button(props) {
	const [isPressed, setIsPressed] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	let btnClass = "btn";
	if (isPressed) btnClass += " btn-pressed";
	else if (isHovered) btnClass += " btn-over";

	return (
		<button
			className={btnClass}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{props.label}
		</button>
	);
}
```

These utilities, `clsx` or `classnames`, make it easier to handle and express conditional classes.

```javascript title="Button.jsx" ins={8-12}
import React, { useState } from "react";
import classNames from "classnames";

export default function Button(props) {
	const [isPressed, setIsPressed] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const btnClass = classNames({
		btn: true,
		"btn-pressed": isPressed,
		"btn-over": !isPressed && isHovered,
	});

	return (
		<button
			className={btnClass}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{props.label}
		</button>
	);
}
```

Both utilities share something with `cva`: they make styling components easier. But where `cva` handles broad, variant-based styling, these utilities shine in handling the _state_ and _interactive_ styles of a component. We can think of _state styles_ as those applied in response to a state change in the component, like a loading state triggered off some asynchronous request. While _interactive styles_ are those native to an element like whether it is pressed or disabled.

Interestingly, in the context of TailwindCSS, I don’t think either utility is as useful as advertised. This is something I explain further in [Why Conditional Class Utilities Might Not Be Necessary](/posts/why-conditional-style-utilities-might-not-be-needed).

Even with the example above, we don’t need a class to handle `isPressed` for the active state. Browsers handle this for free, as it’s part of an element’s natural interactive state.

Adding `clsx` to my Tag component:

```javascript title="Tag.astro"
<span class={twMerge(clsx(tag({ size, variant })))}>
	<slot />
</span>
```

And to recap on the evolution of this Tag component:

1. `cva` allows me handle for variant styling in a no-fuss, scalable way:

```javascript title="Tag.astro"
<span class={tag({ size, variant })>
	<slot />
</span>
```

2. `tailwind merge` takes the output of `cva`, a string, and resolves conflicts in class names:

```javascript title="Tag.astro"
<span class={twMerge('px-2 py-1 p-3')> // only p-3 is applied
	<slot />
</span>
```

3. `clsx` makes for easier conditional, prop driven styling if I ever need it:

```javascript title="Tag.astro"
<span
	class={twMerge(
		clsx("p-3 px-2 py-1", {
			"animate bg-blue-50": isLoading,
		}),
	)}
>
	<slot />
</span>
```

Though I thought this could be more readable, and I liked how [ShadCN solved this](https://github.com/shadcn-ui/ui/blob/main/apps/www/lib/utils.ts):

```javascript title="Tag.astro"
<span class={className(tag({ size, variant }))}>
	<slot />
</span>
```

Where `className` is a utility combining `twMerge` and `clsx`.

```javascript title="Tag.astro"
function className(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Summary

This is my Tag component.

```javascript title="Tag.astro"
---
import type { HTMLAttributes } from "astro/types";
import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { type VariantProps, cva } from "cva";
import { twMerge } from "tailwind-merge";

function className(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const tag = cva(
	"text-red-500 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		compoundVariants: [{ class: "uppercase", size: "medium", variant: "primary" }],
		variants: {
			size: {
				medium: ["text-base", "py-2", "px-4"],
				small: ["text-sm", "py-1", "px-2"],
			},
			variant: {
				accent: "text-fgColour-accent border-fgColour-accent shadow hover:text-fgColour-accent/60",
				primary:
					"text-fgColour-default border-fgColour-default shadow hover:text-fgColour-default/60",
				secondary: "text-fgColour-muted border-fgColour-muted shadow hover:text-fgColour-muted/60",
			},
		},
	}
);

export interface TagProps extends HTMLAttributes<"span">, VariantProps<typeof tag> {}

const { size = "medium", variant = "primary" } = Astro.props;
---

<span class={className(tag({ size, variant }))}>
	<slot />
</span>
```
