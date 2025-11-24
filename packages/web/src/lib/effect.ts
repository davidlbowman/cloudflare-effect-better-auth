import { Cause, Option } from "effect";

export const getErrorMessage = (
	cause: Cause.Cause<unknown>,
	fallback: string,
): string => {
	const err = Option.getOrNull(Cause.failureOption(cause));
	return err && typeof err === "object" && "message" in err
		? String(err.message)
		: fallback;
};
