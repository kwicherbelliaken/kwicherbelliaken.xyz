import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineConfig } from "astro/config";
import expressiveCode, {
	type AstroExpressiveCodeOptions,
	type ExpressiveCodePlugin,
} from "astro-expressive-code";
import icon from "astro-icon";
import aws from "astro-sst";
import fs from "fs";
import rehypeExternalLinks from "rehype-external-links";
import remarkUnwrapImages from "remark-unwrap-images";

import { remarkReadingTime } from "./src/utils/remark-reading-time";

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "0.5rem",
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		uiLineHeight: "inherit",
	},
	themeCssSelector(theme, { styleVariants }) {
		// If one dark and one light theme are available
		// generate theme CSS selectors compatible with cactus-theme dark mode switch
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		// return default selector
		return `[data-theme="${theme.name}"]`;
	},
	// One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
	themes: ["dracula", "catppuccin-mocha"],
	useThemedScrollbars: false,
};

// https://astro.build/config
export default defineConfig({
	adapter: aws(),
	image: {
		domains: ["webmention.io"],
	},
	integrations: [
		expressiveCode({
			plugins: [pluginLineNumbers() as ExpressiveCodePlugin],
			...expressiveCodeOptions,
		}),
		icon(),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
		mdx(),
	],
	markdown: {
		rehypePlugins: [
			[
				rehypeExternalLinks,
				{
					rel: ["nofollow, noopener, noreferrer"],
					target: "_blank",
				},
			],
		],
		remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
		remarkRehype: {
			footnoteLabelProperties: {
				className: [""],
			},
		},
	},
	output: "hybrid",
	// https://docs.astro.build/en/guides/prefetch/
	prefetch: true,
	// ! Please remember to replace the following site property with your own domain
	site: "https://kwicherbelliaken.studio/",
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		plugins: [rawFonts([".ttf", ".woff"])],
		ssr: {
			external: ["@resvg/resvg-js"],
		},
	},
});
function rawFonts(ext: string[]) {
	return {
		name: "vite-plugin-raw-fonts",
		// @ts-expect-error:next-line
		transform(_, id) {
			// eslint-disable-next-line
			if (ext.some((e) => id.endsWith(e))) {
				// eslint-disable-next-line
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}
