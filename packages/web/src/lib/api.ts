import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { Effect, Layer } from "effect";
import { AuthApi } from "../../../shared/src/api/AuthApi";

/**
 * Type-safe API client for Better Auth endpoints
 * Uses Effect's HttpApiClient to call the backend API
 */

// Create a custom FetchHttpClient layer with credentials: "include"
// This ensures cookies are sent with cross-origin requests
const fetchClientLayer = FetchHttpClient.layer.pipe(
	Layer.provide(
		Layer.succeed(FetchHttpClient.RequestInit, {
			credentials: "include",
		}),
	),
);

export const apiClient = HttpApiClient.make(AuthApi, {
	baseUrl: import.meta.env.PUBLIC_API_URL || "http://localhost:8787",
}).pipe(Effect.provide(fetchClientLayer));
