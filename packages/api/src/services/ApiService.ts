import { FetchHttpClient, HttpApiBuilder } from "@effect/platform";
import type { D1Database } from "@cloudflare/workers-types";
import { Layer } from "effect";
import { AuthApi } from "../api/AuthApi";
import * as handlers from "../handlers/authHandlers";
import { AuthDev } from "./AuthService";
import { ConfigService } from "./ConfigService";
import { D1Dev } from "./D1Service";
import { DrizzleDev } from "./DrizzleService";

// Auth handlers group
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
 * Build complete API layer with all dependencies
 * @param db - D1 database instance from Cloudflare Workers env
 */
export const buildApiLive = (db: D1Database) =>
	HttpApiBuilder.api(AuthApi).pipe(
		Layer.provide(AuthHandlers),
		Layer.provide(AuthDev),
		Layer.provide(DrizzleDev(db)),
		Layer.provide(D1Dev(db)),
		Layer.provide(ConfigService.Default),
		Layer.provide(FetchHttpClient.layer),
	);
