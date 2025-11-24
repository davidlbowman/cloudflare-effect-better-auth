import { Effect } from "effect";
import { apiClient } from "./api";

/**
 * Check if user has a valid session
 * Returns the user and session data if authenticated
 */
export async function getSession() {
	try {
		const program = Effect.gen(function* () {
			const client = yield* apiClient;
			return yield* client.auth.session();
		});

		const result = await Effect.runPromise(program);
		return result;
	} catch (error) {
		console.error("Session check failed:", error);
		return null;
	}
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
	try {
		const program = Effect.gen(function* () {
			const client = yield* apiClient;
			return yield* client.auth.signOut();
		});

		await Effect.runPromise(program);

		// Clear stored token
		localStorage.removeItem("auth_token");

		// Redirect to home
		window.location.href = "/";
	} catch (error) {
		console.error("Sign out failed:", error);
		throw error;
	}
}
