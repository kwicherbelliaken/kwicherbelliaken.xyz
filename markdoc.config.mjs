import { component, defineMarkdocConfig, nodes } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
	tags: {
		image: {
			attributes: {
				alt: { type: String },
				caption: { type: String },
				src: { type: String },
				...nodes.image.attributes,
			},
			render: component("./src/components/MarkdocFigure.astro"),
		},
	},
});
