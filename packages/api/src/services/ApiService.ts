import type { D1Database } from "@cloudflare/workers-types";
import { FetchHttpClient, HttpApiBuilder } from "@effect/platform";
import { Layer } from "effect";
import { AuthApi } from "../../../shared/src/api/AuthApi";
import * as handlers from "../handlers/authHandlers";
import * as devHandlers from "../handlers/devHandlers";
import { AuthDev } from "./AuthService";
import { ConfigService } from "./ConfigService";
import { D1Dev } from "./D1Service";
import { DrizzleDev } from "./DrizzleService";

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
		Layer.provide(AuthDev),
		Layer.provide(DrizzleDev(db)),
		Layer.provide(D1Dev(db)),
		Layer.provide(ConfigService.Default),
		Layer.provide(FetchHttpClient.layer),
	);
