const baseColourTokens = {
	blue: {
		// bgColour utilities
		50: "hsl(var(--base-colour-blue-50) / <alpha-value>)",
		100: "hsl(var(--base-colour-blue-100) / <alpha-value>)",
		200: "hsl(var(--base-colour-blue-200) / <alpha-value>)",
		300: "hsl(var(--base-colour-blue-300) / <alpha-value>)",
		400: "hsl(var(--base-colour-blue-400) / <alpha-value>)",
		// borderColour utilities
		500: "hsl(var(--base-colour-blue-500) / <alpha-value>)",
		600: "hsl(var(--base-colour-blue-600) / <alpha-value>)",
		700: "hsl(var(--base-colour-blue-700) / <alpha-value>)",
		// fgColour utilities
		800: "hsl(var(--base-colour-blue-800) / <alpha-value>)",
		900: "hsl(var(--base-colour-blue-900) / <alpha-value>)",
		950: "hsl(var(--base-colour-blue-950) / <alpha-value>)",
	},
	neutral: {
		// bgColour utilities
		50: "hsl(var(--base-colour-neutral-50) / <alpha-value>)",
		100: "hsl(var(--base-colour-neutral-100) / <alpha-value>)",
		200: "hsl(var(--base-colour-neutral-200) / <alpha-value>)",
		300: "hsl(var(--base-colour-neutral-300) / <alpha-value>)",
		400: "hsl(var(--base-colour-neutral-400) / <alpha-value>)",
		// borderColour utilities
		500: "hsl(var(--base-colour-neutral-500) / <alpha-value>)",
		600: "hsl(var(--base-colour-neutral-600) / <alpha-value>)",
		700: "hsl(var(--base-colour-neutral-700) / <alpha-value>)",
		// fgColour utilities
		800: "hsl(var(--base-colour-neutral-800) / <alpha-value>)",
		900: "hsl(var(--base-colour-neutral-900) / <alpha-value>)",
		950: "hsl(var(--base-colour-neutral-950) / <alpha-value>)",
	},
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

export const functionalColourTokens = {
	["bgColour-default"]: baseColourTokens.neutral["50"],
	["bgColour-muted"]: baseColourTokens.neutral["100"],
	["fgColour-accent"]: baseColourTokens.red["950"],
	["fgColour-default"]: baseColourTokens.neutral["950"],
	["fgColour-muted"]: baseColourTokens.neutral["800"],
};
