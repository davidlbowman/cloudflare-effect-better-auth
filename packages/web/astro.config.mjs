// @ts-check
import path from "node:path";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve("./src"),
				...(process.env.NODE_ENV === "production" && {
					"react-dom/server": "react-dom/server.edge",
				}),
			},
		},
	},

	integrations: [react()],
});
