// @ts-check
import path from "node:path";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: cloudflare(),

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve("./src"),
			},
		},
	},

	integrations: [react()],
});
