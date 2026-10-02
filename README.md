# Real estate website

Land lookup by document number, property listings, and buyer requirements (area + budget).
Runs entirely on Cloudflare's free tier: Pages (site), Pages Functions (API) and D1 (database).

## Structure
- `public/` – website (HTML/CSS/JS). Site name, phone, WhatsApp and email are set in `public/js/app.js` (`SITE`).
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

## Deploy (free)
1. Create a free account at https://dash.cloudflare.com/sign-up
2. `npx wrangler login`
3. `npx wrangler d1 create realestate-db` and paste the printed `database_id` into `wrangler.toml`
4. `npm run db:remote`
5. `npx wrangler pages project create realestate --production-branch main`
6. `npm run deploy`, which gives you a live URL at `https://realestate.pages.dev`
7. Set the admin password: `npx wrangler pages secret put ADMIN_TOKEN` (use a long random string), then run `npm run deploy` again

## Custom domain (later)
Buy it in the Cloudflare dashboard: Domain Registration, then Register Domains (sold at cost, about $10/yr for .com).
Then go to Workers & Pages, open `realestate`, and add it under Custom domains. DNS and SSL are set up automatically.
