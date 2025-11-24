/// <reference types="@cloudflare/workers-types" />

import { HttpApiBuilder, HttpServer } from "@effect/platform";
import type { D1Database } from "@cloudflare/workers-types";
import { Layer } from "effect";
import { buildApiLive } from "./services/ApiService";

type Env = {
	DB: D1Database;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Copy env to process.env for Effect Config
		Object.assign(process.env, env);

		// Build the complete layer stack with DB dependency and CORS middleware
		const AppLayer = Layer.mergeAll(
			buildApiLive(env.DB),
			HttpApiBuilder.middlewareCors({
			allowedOrigins: ["http://localhost:4321"], // Frontend origin
			credentials: true, // Allow credentials (cookies) to be sent
		}),
			HttpServer.layerContext,
		);

		// Create web handler
		const { handler } = HttpApiBuilder.toWebHandler(AppLayer);

		return await handler(request);
	},
};
