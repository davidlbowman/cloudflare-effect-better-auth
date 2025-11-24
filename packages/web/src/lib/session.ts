import { Cause, Effect, Exit, Option } from "effect";
import { apiClient } from "./api";

/**
 * Check if user has a valid session
 * Returns the user and session data if authenticated
 */
export async function getSession() {
	const program = Effect.gen(function* () {
		const client = yield* apiClient;
		return yield* client.auth.session();
	});

	const exit = await Effect.runPromiseExit(program);

	return Exit.match(exit, {
		onFailure: (cause) => {
			const maybeError = Cause.failureOption(cause);
			if (Option.isSome(maybeError)) {
				console.error("Session check failed:", maybeError.value);
			}
			return null;
		},
		onSuccess: (result) => result,
	});
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	const session = await getSession();
	return session !== null && session.user !== undefined;
}

/**
 * Sign out the user
 */
export async function signOut() {
	const program = Effect.gen(function* () {
		const client = yield* apiClient;
		return yield* client.auth.signOut();
	});

	const exit = await Effect.runPromiseExit(program);

	return Exit.match(exit, {
		onFailure: (cause) => {
			const maybeError = Cause.failureOption(cause);
			const error = Option.isSome(maybeError) ? maybeError.value : cause;
			console.error("Sign out failed:", error);
			throw error;
		},
		onSuccess: () => {
			// Clear stored token
			localStorage.removeItem("auth_token");

			// Redirect to home
			window.location.href = "/";
		},
	});
}
