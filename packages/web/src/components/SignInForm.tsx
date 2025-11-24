import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Effect, Exit, Schema } from "effect";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { getErrorMessage } from "@/lib/effect";

const SignInFormSchema = Schema.Struct({
	email: Schema.String,
	password: Schema.String,
});

type FormValues = Schema.Schema.Type<typeof SignInFormSchema>;

export function SignInForm() {
	const [resetting, setResetting] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);

	const form = useForm<FormValues>({
		resolver: effectTsResolver(SignInFormSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = async (values: FormValues) => {
		const program = Effect.gen(function* () {
			const client = yield* apiClient;
			return yield* client.auth.signIn({ payload: values });
		});

		const exit = await Effect.runPromiseExit(program);

		Exit.match(exit, {
			onFailure: (cause) => {
				form.setError("root", {
					message: getErrorMessage(cause, "Failed to sign in"),
				});
			},
			onSuccess: (result) => {
				if (result.token) localStorage.setItem("auth_token", result.token);
				window.location.href = "/dashboard";
			},
		});
	};

	const handleResetPassword = async () => {
		const email = form.getValues("email");
		if (!email) {
			form.setError("email", { message: "Please enter your email first" });
			return;
		}

		setResetting(true);
		setResetSuccess(false);
		form.clearErrors("root");

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
				form.setError("root", {
					message: getErrorMessage(cause, "Failed to reset password"),
				});
				setResetting(false);
			},
			onSuccess: () => {
				setResetSuccess(true);
				form.setValue("password", "Reset!1234");
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

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="name@example.com"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>Password</FormLabel>
									<button
										type="button"
										onClick={handleResetPassword}
										disabled={resetting}
										className="text-xs text-primary hover:underline disabled:opacity-50"
									>
										{resetting ? "Resetting..." : "Forgot password?"}
									</button>
								</div>
								<FormControl>
									<Input type="password" placeholder="••••••••" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{form.formState.errors.root && (
						<div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
							{form.formState.errors.root.message}
						</div>
					)}

					{resetSuccess && (
						<div className="p-3 text-sm text-green-500 bg-green-50 rounded-md border border-green-200">
							Password reset to: Reset!1234
						</div>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? "Signing in..." : "Sign In"}
					</Button>
				</form>
			</Form>

			<div className="text-center text-sm">
				Don't have an account?{" "}
				<a href="/sign-up" className="text-primary hover:underline">
					Sign up
				</a>
			</div>
		</div>
	);
}
