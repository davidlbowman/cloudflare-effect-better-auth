import { Cause, Effect, Exit, Option } from "effect";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";

export function SignUpForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);

		const program = Effect.gen(function* () {
			const client = yield* apiClient;
			return yield* client.auth.signUp({
				payload: { email, password, name },
			});
		});

		const exit = await Effect.runPromiseExit(program);

		Exit.match(exit, {
			onFailure: (cause) => {
				const maybeError = Cause.failureOption(cause);
				if (Option.isSome(maybeError)) {
					const err = maybeError.value;
					console.error("Sign up error:", err);
					setError(
						"message" in err
							? err.message
							: "Failed to sign up. Please try again.",
					);
				} else {
					console.error("Sign up error:", cause);
					setError("Failed to sign up. Please try again.");
				}
				setLoading(false);
			},
			onSuccess: (result) => {
				console.log("Sign up successful:", result);

				// Store the token if provided
				if (result.token) {
					localStorage.setItem("auth_token", result.token);
				}

				setSuccess(true);
				setLoading(false);

				// Redirect to dashboard after 1 second
				setTimeout(() => {
					window.location.href = "/dashboard";
				}, 1000);
			},
		});
	};

	return (
		<div className="w-full max-w-md space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Create an account</h1>
				<p className="text-muted-foreground">
					Enter your details below to create your account
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						type="text"
						placeholder="John Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						disabled={loading}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
						minLength={8}
					/>
				</div>

				{error && (
					<div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
						{error}
					</div>
				)}

				{success && (
					<div className="p-3 text-sm text-green-500 bg-green-50 rounded-md border border-green-200">
						Account created successfully! Redirecting...
					</div>
				)}

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? "Creating account..." : "Sign Up"}
				</Button>
			</form>

			<div className="text-center text-sm">
				Already have an account?{" "}
				<a href="/sign-in" className="text-primary hover:underline">
					Sign in
				</a>
			</div>
		</div>
	);
}
