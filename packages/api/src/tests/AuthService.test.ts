import { describe, expect, test } from "bun:test";
import { ConfigProvider, Effect, Layer } from "effect";
import { AuthLive, AuthService } from "../services/AuthService";
import { ConfigService } from "../services/ConfigService";
import { DrizzleTest } from "../services/DrizzleService";

describe("AuthService", () => {
	test("should provide Better Auth instance", async () => {
		const testConfig = ConfigProvider.fromMap(
			new Map([
				["BETTER_AUTH_SECRET", "test-secret-key-minimum-32-chars-long"],
				["BETTER_AUTH_URL", "http://localhost:8787"],
			]),
		);

		const testLayer = AuthLive.pipe(
			Layer.provide(DrizzleTest),
			Layer.provide(ConfigService.Default),
		);

		const auth = await AuthService.pipe(
			Effect.provide(testLayer),
			Effect.withConfigProvider(testConfig),
			Effect.runPromise,
		);

		expect(auth).toBeDefined();
		expect(auth.api).toBeDefined();
	});
});
