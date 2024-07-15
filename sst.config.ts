/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { SSTConfig } from "sst";

import { AstroSite } from "sst/constructs";

export default {
	config(_input) {
		return {
			name: "kwicherbelliaken-xyz",
			region: "ap-southeast-2",
		};
	},
	stacks(app) {
		app.stack(function Site({ stack }) {
			const site = new AstroSite(stack, "site", {
				customDomain: {
					domainAlias: "www.kwicherbelliaken.studio",
					domainName: app.stage === "production" ? "kwicherbelliaken.studio" : "",
				},
			});

			stack.addOutputs({
				url: site.customDomainUrl || site.url,
			});
		});
	},
} satisfies SSTConfig;
