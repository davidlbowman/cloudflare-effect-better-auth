import { Effect, Exit } from "effect";
import { apiClient } from "./api";

export async function getSession() {
	const program = Effect.gen(function* () {
		const client = yield* apiClient;
		return yield* client.auth.session();
	});

	const exit = await Effect.runPromiseExit(program);

	return Exit.match(exit, {
		onFailure: () => null,
		onSuccess: (result) => result,
	});
}

export async function isAuthenticated(): Promise<boolean> {
	const session = await getSession();
	return session !== null && session.user !== undefined;
}

export async function signOut() {
	const program = Effect.gen(function* () {
		const client = yield* apiClient;
		return yield* client.auth.signOut();
	});

	const exit = await Effect.runPromiseExit(program);

	Exit.match(exit, {
		onFailure: () => {},
		onSuccess: () => {
			localStorage.removeItem("auth_token");
			window.location.href = "/";
		},
	});
}
