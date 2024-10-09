---
title: "Themeing This Bih'"
description: "How me themes this site by using CSS variables, Tailwind, and user OS preferences for consistency."
publishDate: 04 Oct 2024
updatedDate: 10 Oct 2024
tags: ["css", "tailwindcss"]
---

## How I Theme Kwicherbelliaken

I let the user set the theme of the site. I start by checking the user's OS preference and use it to set the theme as an attribute (`data-theme`) on the document root. This way, I can refer to it in my stylesheets. I do this in a ThemeProvider, which I declare at the project’s entry point.

I use CSS variables from my global stylesheet to create base and functional design tokens in my Tailwind config. In [Tasting The Rainbow of Colour Design Tokens](/posts/tasting-the-rainbow-of-colour-design-tokens/), I explain the difference between these two types of tokens. The CSS variables adapt based on the theme attribute. For instance, I declare `--base-colour-neutral-50` for both light and dark modes, but its value changes depending on the theme.

```css title="global.css"
// global.css
@layer base {
	:root,
	:root[data-theme="light"] {
		color-scheme: light;
		--base-colour-neutral-50: 0deg 0% 81%;
	}

	:root[data-theme="dark"] {
		color-scheme: dark;
		--base-colour-neutral-50: 218deg 80% 2%;
	}
}
```

```typescript title="designTokens.ts"
// designTokens.ts
const baseColourTokens = {
	...,
	neutral: {
		// bgColour utilities
		50: "hsl(var(--base-colour-neutral-50) / <alpha-value>)",
	},
};

export const functionalColourTokens = {
	["bgColour-default"]: baseColourTokens.neutral["50"],
	...,
};
```

What matters is that I set the raw value for a variable in one place—my root stylesheet. I don't follow [Tailwind's approach](https://tailwindcss.com/docs/dark-mode), which would force me to add a dark variant at the component level. That would mean changes across the whole codebase, instead of in one file.

```html
<html>
	<body>
		<div class="bg-white dark:bg-black">
			<!-- ... -->
		</div>
	</body>
</html>
```

### How I Theme Expressive Code

> **Theme switcher support**: If your site has a theme switcher that allows users to pick a theme, Expressive Code can generate CSS code to support it. By default, you can use the `data-theme` attribute to select a theme by name, both on the `html` element and individual code blocks. You can configure this with the `themeCssRoot` and `themeCssSelector` options.
> [Expressive Code](https://expressive-code.com/guides/themes/)

The documentation is hard to grok. What it's really saying is that if you're using your own theming system, you need to tell Expressive Code which selector to look for to identify your theme. In my case, I use `data-theme="light"` and `data-theme="dark"`, and I map those to one of the preset themes offered by Expressive Code.

It's important that I align the Expressive Code theme with my site's theming approach. Otherwise, I'd be using one method to theme the site and a different one for the code snippets, creating inconsistency.
