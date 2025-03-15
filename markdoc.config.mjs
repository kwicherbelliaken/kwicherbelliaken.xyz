import { component, defineMarkdocConfig, nodes } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
	nodes: {
		fence: {
			attributes: {
				...nodes.fence.attributes,
				collapse: {
					required: false,
					type: String,
				},
				content: { required: true, type: String },
				frame: { matches: ["auto", "none", "code", "terminal"], type: String },
				language: { type: String },
				meta: {
					required: false,
					type: String,
				},
				showLineNumbers: {
					required: false,
					type: Boolean,
				},
				startLineNumber: {
					required: false,
					type: Number,
				},
				title: { type: String },
			},
			render: component("./src/components/CodeBlock.astro"),
		},
	},
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
