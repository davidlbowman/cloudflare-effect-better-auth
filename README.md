# Cloudflare + Effect + Better Auth Demo

A demonstration of building authentication with [Better Auth](https://www.better-auth.com/) on [Cloudflare Workers](https://workers.cloudflare.com/) using [Effect](https://effect.website/) for functional programming patterns and [Cloudflare D1](https://developers.cloudflare.com/d1/) for SQLite database storage.

The frontend is built with [Astro](https://astro.build/).

## Features

- **Better Auth** for authentication and session management
- **Effect-TS** for type-safe, composable error handling and data flow
- **Cloudflare D1** for serverless SQLite database
- **Cloudflare Workers** for edge-deployed API endpoints
- **Astro** for the frontend application

## Prerequisites

- [Bun](https://bun.sh/) v1.3.1 or higher
- [Cloudflare account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Create your local environment variables:**

   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Edit `.dev.vars` and add your configuration:
   - `BETTER_AUTH_SECRET`: A random secret key for Better Auth
   - `BETTER_AUTH_URL`: Your app URL (use `http://localhost:8787` for local dev)

3. **Create a D1 database:**

   ```bash
   npx wrangler d1 create cloudflare-effect-better-auth
   ```

   Copy the database ID from the output and update `wrangler.toml` with your database configuration.

4. **Run database migrations:**

   ```bash
   # For local development
   bun run db:apply:local

   # For production
   bun run db:apply:remote
   ```

## Development

Run the development server:

```bash
bun run dev
```

The API will be available at `http://localhost:8787`.

For remote development (using Cloudflare's edge):

```bash
bun run dev:remote
```

## Deployment

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

Make sure to set your production secrets:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL
```

## Project Structure

```
cloudflare-effect-better-auth/
├── src/
│   └── index.ts          # Main Worker entry point
├── migrations/           # D1 database migrations
├── wrangler.toml        # Cloudflare Workers configuration
└── package.json
```

## Scripts

- `bun run dev` - Start local development server
- `bun run dev:remote` - Start development server on Cloudflare's edge
- `bun run deploy` - Deploy to production
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome
- `bun run typecheck` - Run TypeScript type checking

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Effect Documentation](https://effect.website/docs/introduction)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Astro Documentation](https://docs.astro.build/)
