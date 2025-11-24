import { Schema } from "effect";

/**
 * Authentication error with optional context.
 *
 * Used for all authentication operation failures including
 * sign-up, sign-in, session, and password reset errors.
 *
 * @since 1.0.0
 * @category Errors
 *
 * @example
 * ```ts
 * new AuthError({
 *   message: "Failed to sign in",
 *   context: { email: "user@example.com" }
 * })
 * ```
 */
export class AuthError extends Schema.TaggedError<AuthError>()("AuthError", {
	message: Schema.String,
	context: Schema.optional(
		Schema.Record({ key: Schema.String, value: Schema.Unknown }),
	),
}) {}
