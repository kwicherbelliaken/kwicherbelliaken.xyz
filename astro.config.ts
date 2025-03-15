import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import aws from "astro-sst";
import fs from "fs";
import rehypeExternalLinks from "rehype-external-links";
import remarkUnwrapImages from "remark-unwrap-images";
import { expressiveCodeOptions } from "./src/site.config";
import { remarkReadingTime } from "./src/utils/remark-reading-time";

import markdoc from "@astrojs/markdoc";

// https://astro.build/config
export default defineConfig({
  adapter: aws(),
  image: {
    domains: ["webmention.io"]
  },
  integrations: [expressiveCode(expressiveCodeOptions), icon(), tailwind({
    applyBaseStyles: false
  }), sitemap(), mdx(), markdoc()],
  markdown: {
    rehypePlugins: [[rehypeExternalLinks, {
      rel: ["nofollow, noopener, noreferrer"],
      target: "_blank"
    }]],
    remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
    remarkRehype: {
      footnoteLabelProperties: {
        className: [""]
      }
    }
  },
  output: "hybrid",
  // https://docs.astro.build/en/guides/prefetch/
  prefetch: true,
  // ! Please remember to replace the following site property with your own domain
  site: "https://kwicherbelliaken.studio/",
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"]
    },
    plugins: [rawFonts([".ttf", ".woff"])],
    ssr: {
      external: ["@resvg/resvg-js"]
    }
  }
});
function rawFonts(ext: string[]) {
  return {
    name: "vite-plugin-raw-fonts",
    // @ts-expect-error:next-line
    transform(_, id) {
      // eslint-disable-next-line
      if (ext.some(e => id.endsWith(e))) {
        // eslint-disable-next-line
        const buffer = fs.readFileSync(id);
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null
        };
      }
    }
  };
}