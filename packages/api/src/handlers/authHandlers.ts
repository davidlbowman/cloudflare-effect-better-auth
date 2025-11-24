/**
 * Authentication HTTP handlers for the Better Auth API.
 *
 * @module
 */
import { HttpServerRequest, HttpServerResponse } from "@effect/platform";
import { Effect, pipe, type Schema } from "effect";
import type {
	AuthResponseSchema,
	ForgetPasswordSchema,
	ResetPasswordSchema,
	SignInSchema,
	SignUpSchema,
	SuccessSchema,
	UpdateUserSchema,
} from "../../../shared/src/api/AuthApi";
import { AuthError } from "../../../shared/src/errors/AuthError";
import { AuthService } from "../services/AuthService";

type SignUpPayload = Schema.Schema.Type<typeof SignUpSchema>;
type SignInPayload = Schema.Schema.Type<typeof SignInSchema>;
type UpdateUserPayload = Schema.Schema.Type<typeof UpdateUserSchema>;
type ForgetPasswordPayload = Schema.Schema.Type<typeof ForgetPasswordSchema>;
type ResetPasswordPayload = Schema.Schema.Type<typeof ResetPasswordSchema>;
type AuthResponse = Schema.Schema.Type<typeof AuthResponseSchema>;
type SuccessResponse = Schema.Schema.Type<typeof SuccessSchema>;

/**
 * Handles user registration with email and password.
 *
 * Creates a new user account and returns session cookies.
 *
 * @param payload - User registration data (email, password, name)
 * @returns Effect yielding HTTP response with session cookie
 *
 * @since 1.0.0
 * @category Handlers
 */
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
							context: { operation: "sign-up", email: payload.email },
						}),
				),
			);

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
			Effect.mapError(
				() =>
					new AuthError({
						message: "Failed to create sign-up response",
						context: { operation: "sign-up", email: payload.email },
					}),
			),
		);
	});

/**
 * Handles user authentication with email and password.
 *
 * Validates credentials and returns session cookies on success.
 *
 * @param payload - Login credentials (email, password)
 * @returns Effect yielding HTTP response with session cookie
 *
 * @since 1.0.0
 * @category Handlers
 */
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
							context: { operation: "sign-in", email: payload.email },
						}),
				),
			);

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
			Effect.mapError(
				() =>
					new AuthError({
						message: "Failed to create sign-in response",
						context: { operation: "sign-in", email: payload.email },
					}),
			),
		);
	});

/**
 * Handles user sign out.
 *
 * Invalidates the current session and clears cookies.
 *
 * @returns Effect yielding HTTP response with cleared session cookie
 *
 * @since 1.0.0
 * @category Handlers
 */
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
						context: { operation: "sign-out" },
					}),
			),
		);

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
			Effect.mapError(
				() =>
					new AuthError({
						message: "Failed to create sign-out response",
						context: { operation: "sign-out" },
					}),
			),
		);
	});

/**
 * Retrieves the current user session.
 *
 * Returns user and session data if authenticated, null otherwise.
 *
 * @returns Effect yielding session data or null
 *
 * @since 1.0.0
 * @category Handlers
 */
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
						context: { operation: "get-session" },
					}),
			),
		);

		return response as AuthResponse;
	});

/**
 * Handles user profile updates.
 *
 * @param payload - Update data (name)
 * @returns Effect yielding updated user data
 *
 * @since 1.0.0
 * @category Handlers
 */
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
						context: { operation: "update-user", name: payload.name },
					}),
			),
		);

		return response as AuthResponse;
	});

/**
 * Initiates password reset flow.
 *
 * Sends a password reset email (logs to console in development).
 *
 * @param payload - Email address for password reset
 * @returns Effect yielding success response
 *
 * @since 1.0.0
 * @category Handlers
 */
export const handleForgetPassword = ({
	payload,
}: {
	payload: ForgetPasswordPayload;
}) =>
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
						context: { operation: "forget-password", email: payload.email },
					}),
			),
		);

		return { success: true } as SuccessResponse;
	});

/**
 * Completes password reset with new password.
 *
 * @param payload - Reset token and new password
 * @returns Effect yielding success response
 *
 * @since 1.0.0
 * @category Handlers
 */
export const handleResetPassword = ({
	payload,
}: {
	payload: ResetPasswordPayload;
}) =>
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
						context: { operation: "reset-password" },
					}),
			),
		);

		return { success: true } as SuccessResponse;
	});
