import type { D1Database } from "@cloudflare/workers-types";
import { Context, Layer } from "effect";

/**
 * Service providing access to the Cloudflare D1 database instance.
 *
 * Uses Context.Tag since it receives a runtime value (env.DB)
 * that cannot be obtained from Effect Config.
 *
 * @since 1.0.0
 * @category Services
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const db = yield* D1Service;
 *   // use db directly for raw D1 queries
 * });
 * ```
 */
export class D1Service extends Context.Tag("D1Service")<
	D1Service,
	D1Database
>() {}

/**
 * Creates a D1Service layer from a Cloudflare D1 database binding.
 *
 * @param db - The D1 database instance from Cloudflare Workers environment
 * @returns A Layer providing the D1Service
 *
 * @since 1.0.0
 * @category Layers
 *
 * @example
 * ```ts
 * const layer = D1Live(env.DB);
 * ```
 */
export const D1Live = (db: D1Database) => Layer.succeed(D1Service, db);
