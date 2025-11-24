#!/usr/bin/env bun

/**
 * Database Seed Script
 *
 * Truncates all tables and creates a test user:
 * - Email: test@test.com
 * - Password: Test!1234
 * - Name: Test
 */

import { Console, Effect } from "effect";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../src/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import fs from "node:fs";
import path from "node:path";

// Load environment variables from .dev.vars
const envPath = path.join(import.meta.dir, "../../.dev.vars");

if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, "utf-8");
	envContent.split("\n").forEach((line: string) => {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith("#")) {
			const [key, ...valueParts] = trimmed.split("=");
			if (key) {
				process.env[key.trim()] = valueParts.join("=").trim();
			}
		}
	});
}

// Test user credentials
const TEST_USER = {
	email: "test@test.com",
	password: "Test!1234",
	name: "Test",
};

// Database path
const dbPath = "../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/2b35d4d42e3c9f6b5ad5b5579a7b1470c66e69f6b33a31e3f5a0095cc6d18656.sqlite";

const seedProgram = Effect.gen(function* () {
	yield* Console.log("🌱 Starting database seed...\n");

	// Connect to database directly
	const sqlite = new Database(dbPath);
	const db = drizzle(sqlite, { schema });

	// Create Better Auth instance
	const auth = betterAuth({
		database: drizzleAdapter(db, { provider: "sqlite" }),
		secret: process.env.BETTER_AUTH_SECRET!,
		baseURL: process.env.BETTER_AUTH_URL!,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
	});

	yield* Console.log("📋 Truncating tables...");

	// Delete in order to respect foreign key constraints
	yield* Effect.promise(() => db.delete(schema.session));
	yield* Effect.promise(() => db.delete(schema.account));
	yield* Effect.promise(() => db.delete(schema.verification));
	yield* Effect.promise(() => db.delete(schema.user));

	yield* Console.log("✅ All tables truncated\n");

	yield* Console.log("👤 Creating test user...");
	yield* Console.log(`   Email: ${TEST_USER.email}`);
	yield* Console.log(`   Password: ${TEST_USER.password}`);
	yield* Console.log(`   Name: ${TEST_USER.name}\n`);

	// Use Better Auth API to create user
	const result = yield* Effect.tryPromise({
		try: () =>
			auth.api.signUpEmail({
				body: {
					email: TEST_USER.email,
					password: TEST_USER.password,
					name: TEST_USER.name,
				},
			}),
		catch: (error) => new Error(`Failed to create user: ${error}`),
	});

	yield* Console.log("✅ Test user created successfully!");
	yield* Console.log(`   User ID: ${result.user.id}\n`);

	yield* Console.log("🎉 Database seeded successfully!");
	yield* Console.log("\n📝 You can now sign in with:");
	yield* Console.log(`   Email: ${TEST_USER.email}`);
	yield* Console.log(`   Password: ${TEST_USER.password}`);

	sqlite.close();
});

// Run the seed program
seedProgram.pipe(Effect.runPromise).then(
	() => process.exit(0),
	(error) => {
		console.error("\n❌ Seed failed:", error);
		process.exit(1);
	},
);
