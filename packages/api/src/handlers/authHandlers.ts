import { HttpServerRequest, HttpServerResponse } from "@effect/platform";
import { Effect, Schema, pipe } from "effect";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../../../shared/src/errors/AuthError";
import type {
	AuthResponseSchema,
	ForgetPasswordSchema,
	ResetPasswordSchema,
	SignInSchema,
	SignUpSchema,
	SuccessSchema,
	UpdateUserSchema,
} from "../../../shared/src/api/AuthApi";

type SignUpPayload = Schema.Schema.Type<typeof SignUpSchema>;
type SignInPayload = Schema.Schema.Type<typeof SignInSchema>;
type UpdateUserPayload = Schema.Schema.Type<typeof UpdateUserSchema>;
type ForgetPasswordPayload = Schema.Schema.Type<typeof ForgetPasswordSchema>;
type ResetPasswordPayload = Schema.Schema.Type<typeof ResetPasswordSchema>;
type AuthResponse = Schema.Schema.Type<typeof AuthResponseSchema>;
type SuccessResponse = Schema.Schema.Type<typeof SuccessSchema>;

export const handleSignUp = ({ payload }: { payload: SignUpPayload }) =>
	Effect.gen(function* () {
		const auth = yield* AuthService;
		const request = yield* HttpServerRequest.HttpServerRequest;

		const { headers, response }: { headers: Headers; response: unknown } =
			yield* Effect.tryPromise(() =>
				auth.api.signUpEmail({
					body: {
						email: payload.email,
						password: payload.password,
						name: payload.name,
					},
					headers: request.headers,
					returnHeaders: true,
				}),
			).pipe(
				Effect.mapError(
					(error) =>
						new AuthError({
							message: error instanceof Error ? error.message : String(error),
						}),
				),
			);

		// Create JSON response and forward Set-Cookie headers
		const setCookie = headers.get("set-cookie");
		return yield* HttpServerResponse.json(response as AuthResponse).pipe(
			Effect.map((jsonResponse) =>
				setCookie
					? pipe(
							jsonResponse,
							HttpServerResponse.setHeader("set-cookie", setCookie),
					  )
					: jsonResponse,
			),
			Effect.mapError(() => new AuthError({ message: "Failed to create response" })),
		);
	});

export const handleSignIn = ({ payload }: { payload: SignInPayload }) =>
	Effect.gen(function* () {
		const auth = yield* AuthService;
		const request = yield* HttpServerRequest.HttpServerRequest;

		const { headers, response }: { headers: Headers; response: unknown } =
			yield* Effect.tryPromise(() =>
				auth.api.signInEmail({
					body: {
						email: payload.email,
						password: payload.password,
					},
					headers: request.headers,
					returnHeaders: true,
				}),
			).pipe(
				Effect.mapError(
					(error) =>
						new AuthError({
							message: error instanceof Error ? error.message : String(error),
						}),
				),
			);

		// Create JSON response and forward Set-Cookie headers
		const setCookie = headers.get("set-cookie");
		return yield* HttpServerResponse.json(response as AuthResponse).pipe(
			Effect.map((jsonResponse) =>
				setCookie
					? pipe(
							jsonResponse,
							HttpServerResponse.setHeader("set-cookie", setCookie),
					  )
					: jsonResponse,
			),
			Effect.mapError(() => new AuthError({ message: "Failed to create response" })),
		);
	});

export const handleSignOut = () =>
	Effect.gen(function* () {
		const auth = yield* AuthService;
		const request = yield* HttpServerRequest.HttpServerRequest;

		const { headers } = yield* Effect.tryPromise(() =>
			auth.api.signOut({
				headers: request.headers,
				returnHeaders: true,
			}),
		).pipe(
			Effect.mapError(
				(error) =>
					new AuthError({
						message: error instanceof Error ? error.message : String(error),
					}),
			),
		);

		// Create JSON response and forward Set-Cookie headers
		const setCookie = headers.get("set-cookie");
		return yield* HttpServerResponse.json({
			success: true,
		} as SuccessResponse).pipe(
			Effect.map((jsonResponse) =>
				setCookie
					? pipe(
							jsonResponse,
							HttpServerResponse.setHeader("set-cookie", setCookie),
					  )
					: jsonResponse,
			),
			Effect.mapError(() => new AuthError({ message: "Failed to create response" })),
		);
	});

export const handleSession = () =>
	Effect.gen(function* () {
		const auth = yield* AuthService;
		const request = yield* HttpServerRequest.HttpServerRequest;

		const response: unknown = yield* Effect.tryPromise(() =>
			auth.api.getSession({
				headers: request.headers,
			}),
		).pipe(
			Effect.mapError(
				(error) =>
					new AuthError({
						message: error instanceof Error ? error.message : String(error),
					}),
			),
		);

		return response as AuthResponse;
	});

export const handleUpdateUser = ({ payload }: { payload: UpdateUserPayload }) =>
	Effect.gen(function* () {
		const auth = yield* AuthService;
		const request = yield* HttpServerRequest.HttpServerRequest;

		const response: unknown = yield* Effect.tryPromise(() =>
			auth.api.updateUser({
				body: {
					name: payload.name,
				},
				headers: request.headers,
			}),
		).pipe(
			Effect.mapError(
				(error) =>
					new AuthError({
						message: error instanceof Error ? error.message : String(error),
					}),
			),
		);

		return response as AuthResponse;
	});

export const handleForgetPassword = ({
	payload,
}: { payload: ForgetPasswordPayload }) =>
	Effect.gen(function* () {
		const auth = yield* AuthService;

		yield* Effect.tryPromise(() =>
			auth.api.requestPasswordReset({
				body: {
					email: payload.email,
					redirectTo: "/reset-password",
				},
			}),
		).pipe(
			Effect.mapError(
				(error) =>
					new AuthError({
						message: error instanceof Error ? error.message : String(error),
					}),
			),
		);

		return { success: true } as SuccessResponse;
	});

export const handleResetPassword = ({
	payload,
}: { payload: ResetPasswordPayload }) =>
	Effect.gen(function* () {
		const auth = yield* AuthService;

		yield* Effect.tryPromise(() =>
			auth.api.resetPassword({
				body: {
					newPassword: payload.password,
				},
				query: {
					token: payload.token,
				},
			}),
		).pipe(
			Effect.mapError(
				(error) =>
					new AuthError({
						message: error instanceof Error ? error.message : String(error),
					}),
			),
		);

		return { success: true } as SuccessResponse;
	});
