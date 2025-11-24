import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { Context, Layer } from "effect";
import * as schema from "../db/schema";

/**
 * DrizzleService - Drizzle ORM database access
 *
 * Yields the drizzle db instance directly.
 * Uses Context.Tag since it receives a runtime value (d1) that can't come from Config.
 */
export class DrizzleService extends Context.Tag("DrizzleService")<
	DrizzleService,
	DrizzleD1Database<typeof schema>
>() {}

/**
 * DrizzleTest - Empty database mock for testing
 */
export const DrizzleTest = Layer.succeed(
	DrizzleService,
	{} as DrizzleD1Database<typeof schema>,
);

/**
 * DrizzleLive - Create DrizzleService layer from D1 binding
 */
export const DrizzleLive = (d1: D1Database) =>
	Layer.succeed(DrizzleService, drizzle(d1, { schema }));
