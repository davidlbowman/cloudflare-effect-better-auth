import { Schema } from "effect";

/**
 * Auth Error
 * Used for all authentication operation failures
 */
export class AuthError extends Schema.TaggedError<AuthError>()("AuthError", {
	message: Schema.String,
}) {}
