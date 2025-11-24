import { HttpServerResponse } from "@effect/platform";
import { desc } from "drizzle-orm";
import { Effect, type Schema } from "effect";
import type { TokensResponseSchema } from "../../../shared/src/api/AuthApi";
import { AuthError } from "../../../shared/src/errors/AuthError";
import { verification } from "../db/schema";
import { DrizzleService } from "../services/DrizzleService";

type TokensResponse = Schema.Schema.Type<typeof TokensResponseSchema>;

/**
 * Dev-only endpoint to list recent verification tokens
 * Useful for testing password reset without email
 */
export const handleListTokens = () =>
	Effect.gen(function* () {
		const db = yield* DrizzleService;

		// Get the 10 most recent tokens
		const tokens = yield* Effect.tryPromise(() =>
			db
				.select()
				.from(verification)
				.orderBy(desc(verification.createdAt))
				.limit(10),
		).pipe(
			Effect.mapError(
				(error) =>
					new AuthError({
						message:
							error instanceof Error ? error.message : "Failed to fetch tokens",
					}),
			),
		);

		return yield* HttpServerResponse.json({
			tokens: tokens.map((token) => ({
				identifier: token.identifier,
				value: token.value,
				expiresAt: token.expiresAt,
				createdAt: token.createdAt,
			})),
		} as TokensResponse).pipe(
			Effect.mapError(
				() => new AuthError({ message: "Failed to create response" }),
			),
		);
	});
