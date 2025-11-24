import type { D1Database } from "@cloudflare/workers-types";
import { FetchHttpClient, HttpApiBuilder } from "@effect/platform";
import { Layer } from "effect";
import { AuthApi } from "../../../shared/src/api/AuthApi";
import * as handlers from "../handlers/authHandlers";
import * as devHandlers from "../handlers/devHandlers";
import { AuthLive } from "./AuthService";
import { ConfigService } from "./ConfigService";
import { D1Live } from "./D1Service";
import { DrizzleLive } from "./DrizzleService";

/**
 * Handler group for authentication endpoints.
 *
 * @internal
 */
const AuthHandlers = HttpApiBuilder.group(AuthApi, "auth", (h) =>
	h
		.handle("signUp", handlers.handleSignUp)
		.handle("signIn", handlers.handleSignIn)
		.handle("signOut", handlers.handleSignOut)
		.handle("session", handlers.handleSession)
		.handle("updateUser", handlers.handleUpdateUser)
		.handle("forgetPassword", handlers.handleForgetPassword)
		.handle("resetPassword", handlers.handleResetPassword),
);

/**
 * Handler group for development/debugging endpoints.
 *
 * @internal
 */
const DevHandlers = HttpApiBuilder.group(AuthApi, "dev", (h) =>
	h.handle("listTokens", devHandlers.handleListTokens),
);

/**
 * Builds the complete API layer with all required dependencies.
 *
 * Provides a fully configured HTTP API with:
 * - Authentication handlers (sign-up, sign-in, sign-out, session)
 * - User management (update user, password reset)
 * - Development utilities (token listing)
 * - Database connections (D1 and Drizzle)
 * - Configuration and HTTP client services
 *
 * @param db - The D1 database instance from Cloudflare Workers environment
 * @returns A Layer providing the complete API
 *
 * @since 1.0.0
 * @category Layers
 *
 * @example
 * ```ts
 * const AppLayer = Layer.mergeAll(
 *   buildApiLive(env.DB),
 *   HttpApiBuilder.middlewareCors({ allowedOrigins: ["http://localhost:4321"] }),
 *   HttpServer.layerContext
 * );
 * ```
 */
export const buildApiLive = (db: D1Database) =>
	HttpApiBuilder.api(AuthApi).pipe(
		Layer.provide(AuthHandlers),
		Layer.provide(DevHandlers),
		Layer.provide(AuthLive),
		Layer.provide(DrizzleLive(db)),
		Layer.provide(D1Live(db)),
		Layer.provide(ConfigService.Default),
		Layer.provide(FetchHttpClient.layer),
	);
