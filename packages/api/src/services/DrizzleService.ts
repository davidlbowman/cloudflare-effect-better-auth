import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { Context, Layer } from "effect";
import * as schema from "../db/schema";

/**
 * Service providing Drizzle ORM database access.
 *
 * Yields the Drizzle database instance directly for type-safe queries.
 * Uses Context.Tag since it receives a runtime value (D1 binding).
 *
 * @since 1.0.0
 * @category Services
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const db = yield* DrizzleService;
 *   const users = yield* Effect.tryPromise(() =>
 *     db.select().from(schema.user)
 *   );
 * });
 * ```
 */
export class DrizzleService extends Context.Tag("DrizzleService")<
	DrizzleService,
	DrizzleD1Database<typeof schema>
>() {}

/**
 * Test layer providing an empty database mock.
 *
 * Use for unit testing without a real database connection.
 *
 * @since 1.0.0
 * @category Layers
 *
 * @example
 * ```ts
 * const testProgram = myEffect.pipe(
 *   Effect.provide(DrizzleTest)
 * );
 * ```
 */
export const DrizzleTest = Layer.succeed(
	DrizzleService,
	{} as DrizzleD1Database<typeof schema>,
);

/**
 * Creates a DrizzleService layer from a D1 database binding.
 *
 * @param d1 - The D1 database instance from Cloudflare Workers environment
 * @returns A Layer providing the DrizzleService with full schema support
 *
 * @since 1.0.0
 * @category Layers
 *
 * @example
 * ```ts
 * const layer = DrizzleLive(env.DB);
 * ```
 */
export const DrizzleLive = (d1: D1Database) =>
	Layer.succeed(DrizzleService, drizzle(d1, { schema }));
