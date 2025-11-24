import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSession, signOut } from "@/lib/session";

interface User {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export function Dashboard() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [signingOut, setSigningOut] = useState(false);

	useEffect(() => {
		async function checkSession() {
			try {
				const session = await getSession();

				if (!session || !session.user) {
					// No valid session, redirect to sign-in
					window.location.href = "/sign-in";
					return;
				}

				setUser(session.user as User);
			} catch (error) {
				console.error("Failed to check session:", error);
				window.location.href = "/sign-in";
			} finally {
				setLoading(false);
			}
		}

		checkSession();
	}, []);

	const handleSignOut = async () => {
		setSigningOut(true);
		try {
			await signOut();
		} catch (error) {
			console.error("Sign out failed:", error);
			setSigningOut(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!user) {
		return null; // Will redirect
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<Button
						variant="outline"
						onClick={handleSignOut}
						disabled={signingOut}
					>
						{signingOut ? "Signing out..." : "Sign Out"}
					</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="max-w-2xl space-y-6">
					<div className="bg-card p-6 rounded-lg border">
						<h2 className="text-xl font-semibold mb-4">
							Welcome, {user.name}!
						</h2>

						<div className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground">Email</p>
								<p className="font-medium">{user.email}</p>
							</div>

							<div>
								<p className="text-sm text-muted-foreground">Email Verified</p>
								<p className="font-medium">
									{user.emailVerified ? "Yes" : "No"}
								</p>
							</div>

							<div>
								<p className="text-sm text-muted-foreground">Account Created</p>
								<p className="font-medium">
									{new Date(user.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-card p-6 rounded-lg border">
						<h2 className="text-xl font-semibold mb-2">Protected Content</h2>
						<p className="text-muted-foreground">
							This is a protected page. Only authenticated users can see this
							content.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
