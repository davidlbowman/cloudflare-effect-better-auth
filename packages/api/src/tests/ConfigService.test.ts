import { describe, expect, test } from "bun:test";
import { ConfigProvider, Effect } from "effect";
import { ConfigService } from "../services/ConfigService";

describe("ConfigService", () => {
	test("should load configuration from environment", () => {
		const program = Effect.gen(function* () {
			const config = yield* ConfigService;

			return {
				hasSecret: config.auth.secret !== undefined,
				url: config.auth.url,
			};
		});

		const testConfig = ConfigProvider.fromMap(
			new Map([
				["BETTER_AUTH_SECRET", "test-secret-key"],
				["BETTER_AUTH_URL", "http://localhost:8787"],
			]),
		);

		const result = program.pipe(
			Effect.provide(ConfigService.Default),
			Effect.withConfigProvider(testConfig),
			Effect.runSync,
		);

		expect(result.hasSecret).toBe(true);
		expect(result.url).toBe("http://localhost:8787");
	});

	test("should fail when required config is missing", async () => {
		const emptyConfig = ConfigProvider.fromMap(new Map());

		const program = ConfigService.pipe(
			Effect.provide(ConfigService.Default),
			Effect.withConfigProvider(emptyConfig),
			Effect.flip,
		);

		const error = await Effect.runPromise(program);

		expect(error).toBeDefined();
	});
});
