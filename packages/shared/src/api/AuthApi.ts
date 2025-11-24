import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { AuthError } from "../errors/AuthError";

// Request Schemas
export const SignUpSchema = Schema.Struct({
	email: Schema.String,
	password: Schema.String,
	name: Schema.String,
});

export const SignInSchema = Schema.Struct({
	email: Schema.String,
	password: Schema.String,
});

export const UpdateUserSchema = Schema.Struct({
	name: Schema.String,
});

export const ForgetPasswordSchema = Schema.Struct({
	email: Schema.String,
});

export const ResetPasswordSchema = Schema.Struct({
	token: Schema.String,
	password: Schema.String,
});

// Response Schemas
export const UserSchema = Schema.Struct({
	id: Schema.String,
	email: Schema.String,
	name: Schema.String,
	emailVerified: Schema.Boolean,
	image: Schema.NullOr(Schema.String),
	createdAt: Schema.Date,
	updatedAt: Schema.Date,
});

export const SessionSchema = Schema.Struct({
	id: Schema.String,
	expiresAt: Schema.Date,
	token: Schema.String,
	ipAddress: Schema.NullOr(Schema.String),
	userAgent: Schema.NullOr(Schema.String),
	userId: Schema.String,
});

// Better Auth can return different response structures
// Sometimes with session, sometimes without
export const AuthResponseSchema = Schema.Struct({
	user: UserSchema,
	session: Schema.optional(SessionSchema),
	token: Schema.optional(Schema.NullOr(Schema.String)),
});

export const SuccessSchema = Schema.Struct({
	success: Schema.Boolean,
});

export const TokenSchema = Schema.Struct({
	identifier: Schema.String,
	value: Schema.String,
	expiresAt: Schema.Date,
	createdAt: Schema.Date,
});

export const TokensResponseSchema = Schema.Struct({
	tokens: Schema.Array(TokenSchema),
});

// Auth API Group with 7 endpoints
const authGroup = HttpApiGroup.make("auth")
	.add(
		HttpApiEndpoint.post("signUp", "/auth/sign-up")
			.setPayload(SignUpSchema)
			.addSuccess(AuthResponseSchema)
			.addError(AuthError),
	)
	.add(
		HttpApiEndpoint.post("signIn", "/auth/sign-in")
			.setPayload(SignInSchema)
			.addSuccess(AuthResponseSchema)
			.addError(AuthError),
	)
	.add(
		HttpApiEndpoint.post("signOut", "/auth/sign-out")
			.addSuccess(SuccessSchema)
			.addError(AuthError),
	)
	.add(
		HttpApiEndpoint.get("session", "/auth/session")
			.addSuccess(AuthResponseSchema)
			.addError(AuthError),
	)
	.add(
		HttpApiEndpoint.post("updateUser", "/auth/update-user")
			.setPayload(UpdateUserSchema)
			.addSuccess(AuthResponseSchema)
			.addError(AuthError),
	)
	.add(
		HttpApiEndpoint.post("forgetPassword", "/auth/forget-password")
			.setPayload(ForgetPasswordSchema)
			.addSuccess(SuccessSchema)
			.addError(AuthError),
	)
	.add(
		HttpApiEndpoint.post("resetPassword", "/auth/reset-password")
			.setPayload(ResetPasswordSchema)
			.addSuccess(SuccessSchema)
			.addError(AuthError),
	);

// Dev API Group - for local testing only
const devGroup = HttpApiGroup.make("dev").add(
	HttpApiEndpoint.get("listTokens", "/dev/tokens")
		.addSuccess(TokensResponseSchema)
		.addError(AuthError),
);

// Complete API
export const AuthApi = HttpApi.make("api").add(authGroup).add(devGroup);
