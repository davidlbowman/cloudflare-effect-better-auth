/// <reference types="@cloudflare/workers-types" />

type Env = {
	// D1 database binding will be added here
	// DB: D1Database;
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		return new Response("Hello from Cloudflare + Effect + Better Auth!", {
			headers: { "Content-Type": "text/plain" },
		});
	},
};