import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { Effect } from "effect";
import { AuthApi } from "../../../shared/src/api/AuthApi";

/**
 * Type-safe API client for Better Auth endpoints
 * Uses Effect's HttpApiClient to call the backend API
 */
export const apiClient = HttpApiClient.make(AuthApi, {
	baseUrl: import.meta.env.PUBLIC_API_URL || "http://localhost:8787",
}).pipe(Effect.provide(FetchHttpClient.layer));
