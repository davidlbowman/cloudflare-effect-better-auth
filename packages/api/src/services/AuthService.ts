import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Context, Effect, Layer, Redacted } from "effect";
import { ConfigService } from "./ConfigService";
import { DrizzleService } from "./DrizzleService";

/**
 * AuthService - Better Auth instance
 */
export class AuthService extends Context.Tag("AuthService")<
	AuthService,
	ReturnType<typeof betterAuth>
>() {}

/**
 * AuthDev - Create AuthService layer with Better Auth
 */
export const AuthDev = Layer.effect(
	AuthService,
	Effect.gen(function* () {
		const config = yield* ConfigService;
		const { db } = yield* DrizzleService;

		return betterAuth({
			database: drizzleAdapter(db, {
				provider: "sqlite",
			}),
			secret: Redacted.value(config.auth.secret),
			baseURL: config.auth.url,
			emailAndPassword: {
				enabled: true,
				requireEmailVerification: false,
				sendResetPassword: async ({ user, url }) => {
					// Mock email sender for local dev - just log to console
					console.log(`[DEV] Password reset for ${user.email}: ${url}`);
				},
			},
		});
	}),
);
