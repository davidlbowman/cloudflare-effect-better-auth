/**
 * Cloudflare Workers entry point for the Better Auth API.
 *
 * Configures and exports the fetch handler that processes all incoming requests.
 *
 * @module
 */
/// <reference types="@cloudflare/workers-types" />

import type { D1Database } from "@cloudflare/workers-types";
import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { Layer } from "effect";
import { buildApiLive } from "./services/ApiService";

/**
 * Cloudflare Workers environment bindings.
 */
type Env = {
	DB: D1Database;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
};

export default {
	/**
	 * Handles incoming HTTP requests.
	 *
	 * Sets up the Effect layer stack with:
	 * - API handlers and services
	 * - CORS middleware for frontend communication
	 * - HTTP server context
	 *
	 * @param request - The incoming HTTP request
	 * @param env - Cloudflare Workers environment bindings
	 * @returns Promise resolving to the HTTP response
	 */
	async fetch(request: Request, env: Env): Promise<Response> {
		Object.assign(process.env, env);

		const AppLayer = Layer.mergeAll(
			buildApiLive(env.DB),
			HttpApiBuilder.middlewareCors({
				allowedOrigins: [
					"http://localhost:4321",
					"https://cloudflare-effect-better-auth-web.pages.dev",
				],
				credentials: true,
			}),
			HttpServer.layerContext,
		);

		const { handler } = HttpApiBuilder.toWebHandler(AppLayer);

		return await handler(request);
	},
};
