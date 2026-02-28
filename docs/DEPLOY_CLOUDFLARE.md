# Deploy Arena to Cloudflare (Workers / Pages)

Arena is set up to build and deploy with **OpenNext for Cloudflare**. After deployment, use the published URL in Zapier (e.g. `https://arena.<your-subdomain>.workers.dev/api/webhooks/dripjobs`).

## 1. One-time setup

### Cloudflare account

1. Log in: [dash.cloudflare.com](https://dash.cloudflare.com)
2. In **Workers & Pages** you’ll see your **Account ID** in the right sidebar (or in the URL).
3. Open **wrangler.jsonc** and set `account_id` to that value (replace the empty `""`).

   If you have multiple accounts, pick the one you want to use and set:

   ```json
   "account_id": "YOUR_ACCOUNT_ID"
   ```

   Alternatively you can set it via env and leave `account_id` out of the file:

   ```bash
   export CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
   ```

### Wrangler login (if not already)

```bash
npx wrangler login
```

## 2. Environment variables (secrets)

Arena needs these in production. Set them as **secrets** so they aren’t in the repo:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put DIRECT_URL
npx wrangler secret put JWT_SECRET
npx wrangler secret put DRIPJOBS_WEBHOOK_SECRET
```

When prompted, paste the same values you use in `.env` (Supabase pooler URL, direct URL, JWT secret, DripJobs webhook secret). Optional if you don’t use those webhooks:

```bash
npx wrangler secret put ELEAD_WEBHOOK_SECRET
npx wrangler secret put FORTELLIS_WEBHOOK_SECRET
npx wrangler secret put XTIME_WEBHOOK_SECRET
```

Optional, for cookie domain:

```bash
npx wrangler secret put COOKIE_DOMAIN
```

## 3. Deploy

From the project root:

```bash
npm run deploy
```

This runs the OpenNext Cloudflare build and then deploys the Worker. At the end you’ll get a URL like:

- `https://arena.<account>.workers.dev`

Use that as the **Arena domain** in Zapier:

- Webhook URL: `https://arena.<account>.workers.dev/api/webhooks/dripjobs`
- Header: `x-webhook-secret` = your `DRIPJOBS_WEBHOOK_SECRET` value

## 4. After deploy

- **Zapier:** Set the webhook step URL to `https://<your-worker-url>/api/webhooks/dripjobs` and add the `x-webhook-secret` header.
- **Users:** Sign up and complete onboarding in the deployed app (same Dealership ID and External User ID you use in DripJobs payloads).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm run preview` | Build and run locally with Wrangler (preview Worker) |
| `npm run upload` | Build and upload a new version without deploying |

## Notes

- The app is built with `--dangerouslyUseUnsupportedNextVersion` because the project uses Next.js 14; the adapter officially targets Next 15+. For a new project, upgrading to Next 15 is recommended.
- Worker size: free plan limit is 3 MB (compressed). If you hit it, consider the paid plan or reducing bundle size.
