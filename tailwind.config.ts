import type { Config } from "tailwindcss";

import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

import { functionalColourTokens } from "./designTokens";

export default {
	content: [
		"./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}",
		"!./src/pages/og-image/[slug].png.ts",
	],
	corePlugins: {
		// disable aspect ratio as per docs -> @tailwindcss/aspect-ratio
		aspectRatio: false,
		borderOpacity: false,
		fontVariantNumeric: false,
		ringOffsetColor: false,
		ringOffsetWidth: false,
		scrollSnapType: false,
		textOpacity: false,
		// disable some core plugins as they are included in the css, even when unused
		touchAction: false,
	},
	darkMode: ["class", '[data-theme="dark"]'],
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/aspect-ratio"),
		plugin(function ({ addComponents }) {
			addComponents({
				".kwicherbelliaken-link": {
					"&:hover": {
						"@apply decoration-2 decoration-fgColour-accent text-fgColour-accent": {},
					},
					"@apply underline underline-offset-2 text-link": {},
				},
			});
		}),
	],
	theme: {
		extend: {
			colors: {
				link: "hsl(var(--theme-link) / <alpha-value>)",
				quote: "hsl(var(--theme-quote) / <alpha-value>)",
				...functionalColourTokens,
			},
			fontFamily: {
				afterAllRegular: ["After-All-Regular"],
				charterRegular: ["Charter-Regular"],
				maisonNeueMono: ["Maison-Neue-Mono"],
				// Add any custom fonts here
				sans: [...fontFamily.sans],
				serif: [...fontFamily.serif],
			},
			fontSize: {
				"3xs": "0.50rem",
			},
			transitionProperty: {
				height: "height",
			},
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			// Remove above once tailwindcss exposes theme type
			typography: (theme) => ({
				DEFAULT: {
					css: {
						a: {
							"@apply kwicherbelliaken-link": "",
						},
						blockquote: {
							borderLeftWidth: "0",
						},
						code: {
							border: "1px dotted #666",
							borderRadius: "2px",
						},
						h2: {
							fontSize: "clamp(1.15rem,2vw,1.25rem)",
							fontWeight: "700",
							lineHeight: "1.1em",
						},
						hr: {
							borderTopStyle: "dashed",
						},
						p: {
							"@apply font-charterRegular": "",
							lineHeight: "1.6",
						},
						strong: {
							fontWeight: "700",
						},
						sup: {
							"@apply ms-0.5": "",
							a: {
								"&:after": {
									content: "']'",
								},
								"&:before": {
									content: "'['",
								},
								"&:hover": {
									"@apply text-link no-underline bg-none": "",
								},
								"@apply bg-none": "",
							},
						},
						"tbody tr": {
							borderBottomWidth: "none",
						},
						tfoot: {
							borderTop: "1px dashed #666",
						},
						thead: {
							borderBottomWidth: "none",
						},
						"thead th": {
							borderBottom: "1px dashed #666",
							fontWeight: "700",
						},
					},
				},
				kwicherbelliaken: {
					css: {
						"--tw-prose-body": theme("colors.fgColour-default / 1"),
						"--tw-prose-bold": theme("colors.fgColour-default / 1"),
						"--tw-prose-bullets": theme("colors.fgColour-default / 1"),
						"--tw-prose-code": theme("colors.fgColour-default / 1"),
						"--tw-prose-headings": theme("colors.accent-2 / 1"),
						"--tw-prose-hr": "0.5px dashed #666",
						"--tw-prose-links": theme("colors.fgColour-default / 1"),
						"--tw-prose-quotes": theme("colors.quote / 1"),
						"--tw-prose-th-borders": "#666",

						h2: {
							"@apply mb-0 text-2xl": "",
						},
					},
				},
				sm: {
					css: {
						code: {
							fontSize: theme("fontSize.sm")[0],
							fontWeight: "400",
						},
					},
				},
			}),
		},
	},
} satisfies Config;
