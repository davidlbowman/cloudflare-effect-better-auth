import type { D1Database } from "@cloudflare/workers-types";
import { Context, Layer } from "effect";

/**
 * D1Service provides the D1Database instance from Cloudflare Workers environment
 */
export class D1Service extends Context.Tag("D1Service")<
	D1Service,
	D1Database
>() {}

/**
 * D1Dev - Create D1Service layer from D1 binding
 */
export const D1Dev = (db: D1Database) => Layer.succeed(D1Service, db);
