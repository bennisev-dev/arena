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

### Secret header

Arena expects:

- **Header name:** `x-webhook-secret`
- **Header value:** same as `DRIPJOBS_WEBHOOK_SECRET` in your Arena `.env`

Set this in DripJobs’ webhook configuration so every request includes that header. If it’s missing or wrong, Arena returns 401.

### Payload format

Arena expects a JSON body with at least one of `records` or `record`, and each record must include:

- **Dealership** – one of: `dealership_id`, `dealershipId`, `dealerId`, `storeId`, `store_id`
- **User** – one of: `external_user_id`, `externalUserId`, `user_id`, `userId`
- **Period** – `month` / `year`, or `timestamp`, or `period.timestamp`

**For a new lead** (increments “Leads” on the leaderboard):

- Include `leads_created: 1` (or `leadsCreated: 1`) on the record.

**For a home sold** (increments “Homes Sold” and optionally volume/profit):

- Include `cars_sold: 1` (or `carsSold: 1`).
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
    "cars_sold": 1,
    "vehicle_value_total": 450000,
    "profit_total": 13500
  }]
}
```

Use the same `dealership_id` and `external_user_id` values that you set in Arena onboarding for that rep and store.

---

## 3. Quick checklist

- [ ] Arena: `npm run dev` (or deploy and use that URL).
- [ ] Arena: `.env` has `DRIPJOBS_WEBHOOK_SECRET` set.
- [ ] Arena: Users created and onboarded with **CRM Source = DripJobs**, and correct **Dealership ID** and **External User ID** (matching DripJobs).
- [ ] DripJobs: Webhook URL = `https://<your-host>/api/webhooks/dripjobs`.
- [ ] DripJobs: Header `x-webhook-secret` = same value as `DRIPJOBS_WEBHOOK_SECRET`.
- [ ] DripJobs: Payloads use the same `dealership_id` and `external_user_id` as in Arena; send `leads_created` for leads and `cars_sold` (and optionally value/profit) for sales.

After that, new leads and home sales from DripJobs will update the Arena leaderboard for the current month.
