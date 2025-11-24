import { Effect, Exit } from "effect";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { getErrorMessage } from "@/lib/effect";

export function SignInForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [resetting, setResetting] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const program = Effect.gen(function* () {
			const client = yield* apiClient;
			return yield* client.auth.signIn({ payload: { email, password } });
		});

		const exit = await Effect.runPromiseExit(program);

		Exit.match(exit, {
			onFailure: (cause) => {
				setError(getErrorMessage(cause, "Failed to sign in"));
				setLoading(false);
			},
			onSuccess: (result) => {
				if (result.token) localStorage.setItem("auth_token", result.token);
				window.location.href = "/dashboard";
			},
		});
	};

	const handleResetPassword = async () => {
		if (!email) {
			setError("Please enter your email first");
			return;
		}

		setResetting(true);
		setError("");
		setResetSuccess(false);

		const program = Effect.gen(function* () {
			const client = yield* apiClient;
			yield* client.auth.forgetPassword({ payload: { email } });

			const { tokens } = yield* client.dev.listTokens();
			const resetToken = tokens.find((t) =>
				t.identifier.startsWith("reset-password:"),
			);

			if (!resetToken)
				return yield* Effect.fail(new Error("Reset token not found"));

			const token = resetToken.identifier.replace("reset-password:", "");
			yield* client.auth.resetPassword({
				payload: { token, password: "Reset!1234" },
			});

			return { success: true } as const;
		});

		const exit = await Effect.runPromiseExit(program);

		Exit.match(exit, {
			onFailure: (cause) => {
				setError(getErrorMessage(cause, "Failed to reset password"));
				setResetting(false);
			},
			onSuccess: () => {
				setResetSuccess(true);
				setPassword("Reset!1234");
				setResetting(false);
			},
		});
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
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Password</Label>
						<button
							type="button"
							onClick={handleResetPassword}
							disabled={resetting || !email}
							className="text-xs text-primary hover:underline disabled:opacity-50"
						>
							{resetting ? "Resetting..." : "Forgot password?"}
						</button>
					</div>
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

				{resetSuccess && (
					<div className="p-3 text-sm text-green-500 bg-green-50 rounded-md border border-green-200">
						Password reset to: Reset!1234
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
