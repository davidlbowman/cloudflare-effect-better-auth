import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Context, Effect, Layer, Redacted } from "effect";
import { ConfigService } from "./ConfigService";
import { DrizzleService } from "./DrizzleService";

/**
 * Service providing Better Auth authentication functionality.
 *
 * Wraps the Better Auth library to provide email/password authentication
 * with session management via the Effect ecosystem.
 *
 * @since 1.0.0
 * @category Services
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const auth = yield* AuthService;
 *   const result = yield* Effect.tryPromise(() =>
 *     auth.api.signInEmail({ body: { email, password } })
 *   );
 * });
 * ```
 */
export class AuthService extends Context.Tag("AuthService")<
	AuthService,
	ReturnType<typeof betterAuth>
>() {}

/**
 * Creates an AuthService layer with Better Auth configured.
 *
 * Configures Better Auth with:
 * - Drizzle adapter for D1/SQLite database
 * - Email/password authentication enabled
 * - Email verification disabled (for development)
 * - Console-based password reset emails (for development)
 *
 * @since 1.0.0
 * @category Layers
 *
 * @example
 * ```ts
 * const appLayer = Layer.mergeAll(
 *   AuthLive,
 *   DrizzleLive(env.DB),
 *   ConfigService.Default
 * );
 * ```
 */
export const AuthLive = Layer.effect(
	AuthService,
	Effect.gen(function* () {
		const config = yield* ConfigService;
		const db = yield* DrizzleService;

		return betterAuth({
			database: drizzleAdapter(db, {
				provider: "sqlite",
			}),
			secret: Redacted.value(config.auth.secret),
			baseURL: config.auth.url,
			trustedOrigins: ["http://localhost:4321", config.webUrl],
			advanced: {
				defaultCookieAttributes: {
					sameSite: "none",
					secure: true,
					partitioned: true,
				},
			},
			emailAndPassword: {
				enabled: true,
				requireEmailVerification: false,
				sendResetPassword: async ({ user, url }) => {
					console.log(`[DEV] Password reset for ${user.email}: ${url}`);
				},
			},
		});
	}),
);
