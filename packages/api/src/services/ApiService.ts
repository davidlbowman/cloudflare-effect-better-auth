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

const DevHandlers = HttpApiBuilder.group(AuthApi, "dev", (h) =>
	h.handle("listTokens", devHandlers.handleListTokens),
);

/**
 * Build complete API layer with all dependencies
 * @param db - D1 database instance from Cloudflare Workers env
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
