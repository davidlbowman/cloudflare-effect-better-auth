import { useState } from "react";
import { Effect } from "effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";

export function SignInForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const program = Effect.gen(function* () {
				const client = yield* apiClient;
				return yield* client.auth.signIn({
					payload: { email, password },
				});
			});

			const result = await Effect.runPromise(program);

			console.log("Sign in successful:", result);

			// Store the token in localStorage
			if (result.token) {
				localStorage.setItem("auth_token", result.token);
			}

			// Redirect to dashboard
			window.location.href = "/dashboard";
		} catch (err) {
			console.error("Sign in error:", err);
			setError(
				err instanceof Error ? err.message : "Failed to sign in. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Sign in</h1>
				<p className="text-muted-foreground">
					Enter your email and password to sign in
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
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

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? "Signing in..." : "Sign In"}
				</Button>
			</form>

			<div className="text-center text-sm">
				Don't have an account?{" "}
				<a href="/sign-up" className="text-primary hover:underline">
					Sign up
				</a>
			</div>
		</div>
	);
}
