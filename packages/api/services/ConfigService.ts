import { Config, Effect } from "effect";

export class ConfigService extends Effect.Service<ConfigService>()(
	"ConfigService",
	{
		effect: Effect.gen(function* () {
			const betterAuthSecret = yield* Config.redacted("BETTER_AUTH_SECRET");
			const betterAuthUrl = yield* Config.string("BETTER_AUTH_URL");

			return {
				auth: {
					secret: betterAuthSecret,
					url: betterAuthUrl,
				},
			};
		}),
	},
) {}
