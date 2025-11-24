import { Config, Effect } from "effect";

/**
 * Service providing application configuration from environment variables.
 *
 * Reads configuration using Effect's Config module for type-safe,
 * validated access to environment variables.
 *
 * @since 1.0.0
 * @category Services
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const config = yield* ConfigService;
 *   const secret = Redacted.value(config.auth.secret);
 * });
 *
 * // Use with Layer
 * const layer = Layer.provide(ConfigService.Default);
 * ```
 */
export class ConfigService extends Effect.Service<ConfigService>()(
	"ConfigService",
	{
		effect: Effect.gen(function* () {
			const betterAuthSecret = yield* Config.redacted("BETTER_AUTH_SECRET");
			const betterAuthUrl = yield* Config.string("BETTER_AUTH_URL");

			return {
				auth: {
					/** Better Auth secret key (redacted for security) */
					secret: betterAuthSecret,
					/** Better Auth base URL */
					url: betterAuthUrl,
				},
			};
		}),
	},
) {}
