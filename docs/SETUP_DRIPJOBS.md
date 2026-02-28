# DripJobs + Arena setup

Get leads and home sales from DripJobs updating the Arena leaderboard.

---

## 1. Arena (this app)

### Run the app

```bash
npm run dev
```

Open http://localhost:3000 (or your deployed URL).

### Create users and link them to DripJobs

1. **Sign up** (or log in) for each rep/manager who should appear on the leaderboard.
2. After signup you’re sent to **onboarding**. Fill in:
   - **Role** – Sales Rep, Service Rep, or Manager
   - **Dealership ID** – Same value you’ll use in DripJobs for this store/dealership (e.g. `store-123` or your DripJobs org/dealer id).
   - **CRM Source** – **DripJobs**
   - **External User ID** – The rep’s ID in DripJobs (same value DripJobs will send in webhooks for this person).

3. **Important:**  
   - `Dealership ID` in Arena must **exactly match** `dealership_id` (or `dealershipId` / `dealerId` / `storeId`) in DripJobs webhook payloads.  
   - `External User ID` in Arena must **exactly match** `external_user_id` (or `externalUserId` / `userId`) in DripJobs webhook payloads.  
   If they don’t match, webhooks are stored but performance won’t be attributed to any user.

---

## 2. DripJobs

### Webhook URL

Point DripJobs at your Arena API:

- **Local:** use a tunnel (e.g. ngrok): `https://<your-ngrok-host>/api/webhooks/dripjobs`
- **Production:** `https://<your-arena-domain>/api/webhooks/dripjobs`

Method: **POST**.  
Body: **JSON** (see payload format below).

### Webhook secret (per organization)

Arena identifies the **organization** from the webhook secret. Each org has one or more CRM webhooks in the `crm_webhooks` table; the secret for that row is what you send.

- **Header name:** `x-webhook-secret`  
  (or use query param **`secret`**)
- **Header value:** the `webhook_secret` for your org’s DripJobs webhook.

After running migrations, a default organization and one DripJobs webhook are created. To get the secret:

- In Supabase (or your DB client): `SELECT webhook_secret FROM crm_webhooks WHERE crm_type = 'dripjobs' AND is_active = true;`
- Use that value in DripJobs (or Zapier) as the `x-webhook-secret` header.

If the secret is missing or doesn’t match an active webhook, Arena returns 401.

### Payload format

Arena expects a JSON body with at least one of `records` or `record`, and each record must include:

- **Team / Location** – one of: `dealership_id`, `dealershipId`, `dealerId`, `storeId`, `store_id`  
  If DripJobs/Zapier doesn’t provide a field for this, **use a constant** (example: `default`) and use the same value in Arena onboarding.
- **User** – one of: `external_user_id`, `externalUserId`, `user_id`, `userId`
- **Period** – `month` / `year`, or `timestamp`, or `period.timestamp`

**For a new lead** (increments “Leads” on the leaderboard):

- Include `leads_created: 1` (or `leadsCreated: 1`) on the record.

**For a job won / home sold** (increments “Homes Sold” and optionally volume/profit):

- Include one of:  
  - `homes_sold: 1`, or  
  - `jobs_won: 1`, or  
  - `cars_sold: 1` (legacy key; still supported)
- Optional: `vehicle_value_total`, `profit_total` (or camelCase equivalents).

**Example – new lead**

```json
{
  "eventId": "lead-created-abc",
  "dealership_id": "store-123",
  "records": [{
    "record_id": "lead-001",
    "external_user_id": "rep-jane",
    "dealership_id": "store-123",
    "month": 2,
    "year": 2026,
    "leads_created": 1
  }]
}
```

**Example – home sold**

```json
{
  "eventId": "sale-closed-xyz",
  "dealership_id": "store-123",
  "records": [{
    "record_id": "sale-002",
    "external_user_id": "rep-jane",
    "dealership_id": "store-123",
    "month": 2,
    "year": 2026,
    "homes_sold": 1,
    "vehicle_value_total": 450000,
    "profit_total": 13500
  }]
}
```

Use the same `dealership_id` and `external_user_id` values that you set in Arena onboarding for that rep and store.

---

## 3. Quick checklist

- [ ] Arena: Run migrations (creates default org and a DripJobs webhook; copy `webhook_secret` from `crm_webhooks`).
- [ ] Arena: `npm run dev` (or deploy and use that URL).
- [ ] Arena: Users created and onboarded with **CRM Source = DripJobs**, and correct **Dealership ID** and **External User ID** (matching DripJobs).
- [ ] DripJobs/Zapier: Webhook URL = `https://<your-host>/api/webhooks/dripjobs`.
- [ ] DripJobs/Zapier: Header `x-webhook-secret` = your org’s `webhook_secret` from `crm_webhooks` (or query param `secret`).
- [ ] DripJobs: Payloads use the same `dealership_id` and `external_user_id` as in Arena; send `leads_created` for leads and `cars_sold` (and optionally value/profit) for sales.

After that, new leads and home sales from DripJobs will update the Arena leaderboard for the current month.
