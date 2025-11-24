import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Effect, Exit, Schema } from "effect";
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

const SignUpFormSchema = Schema.Struct({
	name: Schema.String,
	email: Schema.String,
	password: Schema.String,
});

type FormValues = Schema.Schema.Type<typeof SignUpFormSchema>;

export function SignUpForm() {
	const form = useForm<FormValues>({
		resolver: effectTsResolver(SignUpFormSchema),
		defaultValues: { name: "", email: "", password: "" },
	});

	const onSubmit = async (values: FormValues) => {
		const program = Effect.gen(function* () {
			const client = yield* apiClient;
			return yield* client.auth.signUp({ payload: values });
		});

		const exit = await Effect.runPromiseExit(program);

		Exit.match(exit, {
			onFailure: (cause) => {
				form.setError("root", {
					message: getErrorMessage(cause, "Failed to sign up"),
				});
			},
			onSuccess: (result) => {
				if (result.token) localStorage.setItem("auth_token", result.token);
				window.location.href = "/dashboard";
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

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="John Doe" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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
								<FormLabel>Password</FormLabel>
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

					<Button
						type="submit"
						className="w-full"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
					</Button>
				</form>
			</Form>

			<div className="text-center text-sm">
				Already have an account?{" "}
				<a href="/sign-in" className="text-primary hover:underline">
					Sign in
				</a>
			</div>
		</div>
	);
}
