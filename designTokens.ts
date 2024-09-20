const baseColourTokens = {
	neutral: {
		50: "hsl(var(--base-colour-neutral-50) / <alpha-value>)",
		100: "hsl(var(--base-colour-neutral-100) / <alpha-value>)",
		200: "hsl(var(--base-colour-neutral-200) / <alpha-value>)",
		300: "hsl(var(--base-colour-neutral-300) / <alpha-value>)",
		400: "hsl(var(--base-colour-neutral-400) / <alpha-value>)",
		500: "hsl(var(--base-colour-neutral-500) / <alpha-value>)",
		600: "hsl(var(--base-colour-neutral-600) / <alpha-value>)",
		700: "hsl(var(--base-colour-neutral-700) / <alpha-value>)",
		800: "hsl(var(--base-colour-neutral-800) / <alpha-value>)",
		900: "hsl(var(--base-colour-neutral-900) / <alpha-value>)",
		950: "hsl(var(--base-colour-neutral-950) / <alpha-value>)",
	},
};

export const functionalColourTokens = {
	["bgColour-default"]: baseColourTokens.neutral["50"],
	["bgColour-muted"]: baseColourTokens.neutral["100"],
};
