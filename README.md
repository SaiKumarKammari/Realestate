# Real estate website

Land lookup by document number, property listings, and buyer requirements (area + budget).
Runs entirely on Cloudflare's free tier: a Worker (site + API) and D1 (database).

## Structure
- `public/` – website (HTML/CSS/JS). Site name, phone, WhatsApp and email are set in `public/js/app.js` (`SITE`).
- `src/worker.js` – entry point; routes `/api/*` to the handlers in `functions/api/`, serves everything else from `public/`
- `functions/api/` – API: `/api/land`, `/api/properties`, `/api/enquiries`
- `schema.sql` – database tables plus sample data (remove the sample rows before launch)
- `public/admin.html` – admin panel for adding properties and land records and viewing enquiries

## Run locally
Requires Node.js 18+ (https://nodejs.org).
```
npm install
npm run db:local        # create local DB with sample data
npm run dev             # http://localhost:8788  (admin token is in .dev.vars)
```

## Deploy
Connected to GitHub (`SaiKumarKammari/Realestate`) through Cloudflare Workers Builds:
**every push to `main` deploys automatically** to https://realestate.saikumararya-a.workers.dev

- Production database: D1 `realestate-db` (APAC). Apply schema changes with `npx wrangler d1 execute realestate-db --remote --file=<file>.sql`
  (don't re-run `schema.sql` on production: it drops all tables)
- Admin password: `npx wrangler secret put ADMIN_TOKEN` (the current one is in the git-ignored `.admin-token`)

## Custom domain (later)
Buy it in the Cloudflare dashboard: Domain Registration, then Register Domains (sold at cost, about $10/yr for .com).
Then go to Workers & Pages, open `realestate`, then Settings, then Domains & Routes, and add it as a Custom domain. DNS and SSL are set up automatically.
