import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { DrizzleService, DrizzleTest } from "../services/DrizzleService";

describe("DrizzleService", () => {
	describe("DrizzleTest", () => {
		test("should provide empty database layer", async () => {
			const db = await DrizzleService.pipe(
				Effect.provide(DrizzleTest),
				Effect.runPromise,
			);

			expect(db).toBeDefined();
		});
	});
});
