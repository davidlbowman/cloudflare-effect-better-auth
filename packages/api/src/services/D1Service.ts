import type { D1Database } from "@cloudflare/workers-types";
import { Context, Layer } from "effect";

/**
 * D1Service - provides the D1Database instance from Cloudflare Workers environment
 *
 * Uses Context.Tag since it receives a runtime value (env.DB) that can't come from Config.
 */
export class D1Service extends Context.Tag("D1Service")<
	D1Service,
	D1Database
>() {}

/**
 * D1Live - Create D1Service layer from D1 binding
 */
export const D1Live = (db: D1Database) => Layer.succeed(D1Service, db);
