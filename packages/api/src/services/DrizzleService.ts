import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { Context, Layer } from "effect";
import * as schema from "../db/schema";

/**
 * DrizzleService - Drizzle ORM database access
 */
export class DrizzleService extends Context.Tag("DrizzleService")<
	DrizzleService,
	{
		readonly db: DrizzleD1Database<typeof schema>;
	}
>() {}

/**
 * DrizzleTest - Empty database mock for testing
 */
export const DrizzleTest = Layer.succeed(
	DrizzleService,
	DrizzleService.of({
		db: {} as DrizzleD1Database<typeof schema>,
	}),
);

/**
 * DrizzleDev - Create DrizzleService layer from D1 binding
 */
export const DrizzleDev = (d1: D1Database) =>
	Layer.succeed(
		DrizzleService,
		DrizzleService.of({
			db: drizzle(d1, { schema }),
		}),
	);
