# Cloudflare + Effect + Better Auth

A full-stack authentication demo using [Better Auth](https://www.better-auth.com/) on [Cloudflare Workers](https://workers.cloudflare.com/) with [Effect](https://effect.website/) for type-safe functional patterns and [Cloudflare D1](https://developers.cloudflare.com/d1/) for the database.

**Live Demo:** <https://cloudflare-effect-better-auth-web.pages.dev>

## Stack

- **API:** Cloudflare Workers + Effect HttpApi + Better Auth + Drizzle + D1
- **Web:** Astro + React + Tailwind + shadcn/ui
- **Auth:** Better Auth (email/password, sessions, password reset)

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.3+
- [Cloudflare account](https://dash.cloudflare.com/)

### Local Development

```bash
# Install dependencies
bun install

# Copy environment variables
cp .dev.vars.example .dev.vars

# Start both API and web
bun run dev
```

- API: <http://localhost:8787>
- Web: <http://localhost:4321>

### Database Setup (Local)

Local D1 uses SQLite automatically. To apply migrations:

```bash
cd packages/api
bunx wrangler d1 execute cloudflare-effect-better-auth --local --file=drizzle/0000_bright_puma.sql
```

## Deployment

### 1. Create D1 Database

```bash
wrangler d1 create cloudflare-effect-better-auth
```

Copy the `database_id` from the output.

### 2. Configure wrangler.toml

Copy the example and add your database ID:

```bash
cp wrangler.toml.example wrangler.toml
```

Edit `wrangler.toml` and replace `<YOUR_D1_DATABASE_ID>` with your actual database ID.

### 3. Run Migrations

```bash
wrangler d1 execute cloudflare-effect-better-auth --remote --file=packages/api/drizzle/0000_bright_puma.sql
```

### 4. Set Secrets

```bash
# Generate a secret
openssl rand -base64 32

# Set secrets
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL  # e.g., https://your-api.workers.dev
wrangler secret put WEB_URL          # e.g., https://your-web.pages.dev
```

### 5. Deploy API

```bash
wrangler deploy
```

> **Note:** For production, remove `http://localhost:4321` from `allowedOrigins` in `packages/api/src/index.ts` and `trustedOrigins` in `packages/api/src/services/AuthService.ts`.

### 6. Deploy Web

```bash
cd packages/web

# Build with production API URL
NODE_ENV=production PUBLIC_API_URL=https://your-api.workers.dev bun run build

# Create Pages project (first time only)
wrangler pages project create your-project-web --production-branch=main

# Deploy
wrangler pages deploy dist --project-name=your-project-web --branch=main
```

## Project Structure

```
├── packages/
│   ├── api/                 # Cloudflare Worker API
│   │   ├── src/
│   │   │   ├── index.ts     # Worker entry point
│   │   │   ├── handlers/    # API route handlers
│   │   │   └── services/    # Effect services (Auth, Drizzle, D1)
│   │   └── drizzle/         # Database migrations
│   ├── web/                 # Astro frontend
│   │   └── src/
│   │       ├── components/  # React components
│   │       ├── pages/       # Astro pages
│   │       └── lib/         # API client, helpers
│   └── shared/              # Shared types and schemas
│       └── src/api/         # Effect HttpApi definitions
├── wrangler.toml.example    # Cloudflare config template
└── .dev.vars.example        # Environment variables template
```

## Password Reset (Demo)

This demo doesn't include email integration. The "Forgot password?" flow works by:
1. Generating a reset token in the database
2. Fetching the token via `/dev/tokens` endpoint
3. Automatically resetting the password to `Reset!1234`

For production, integrate an email provider (Resend, SendGrid, etc.) and remove the `/dev/tokens` endpoint.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start API and web in parallel |
| `bun run dev:api` | Start API only |
| `bun run dev:web` | Start web only |
| `bun run typecheck` | TypeScript type checking |
| `bun run lint` | Biome linting |
| `bun run lint:fix` | Fix linting issues |

## Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Effect Docs](https://effect.website/docs/introduction)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Astro](https://docs.astro.build/)
