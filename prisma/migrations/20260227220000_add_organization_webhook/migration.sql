-- CreateTable
CREATE TABLE organizations (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,

    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE crm_webhooks (
    id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    webhook_secret TEXT NOT NULL,
    crm_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP(3),
    request_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,

    CONSTRAINT crm_webhooks_pkey PRIMARY KEY (id)
);

-- AlterTable User: add organization_id (nullable)
ALTER TABLE "User" ADD COLUMN "organization_id" TEXT;

-- Drop old User uniques
DROP INDEX IF EXISTS "User_email_key";
DROP INDEX IF EXISTS "dealership_external_user_unique";

-- Create new User uniques and index
CREATE UNIQUE INDEX "organization_email_unique" ON "User"("organization_id", "email");
CREATE UNIQUE INDEX "org_dealership_external_user_unique" ON "User"("organization_id", "dealership_id", "external_user_id");
CREATE INDEX "User_organization_id_idx" ON "User"("organization_id");

-- AlterTable RawIngest: add organization_id
ALTER TABLE "RawIngest" ADD COLUMN "organization_id" TEXT;

-- Drop old RawIngest unique (recreate with organization_id)
DROP INDEX IF EXISTS "raw_ingest_idempotency_unique";
CREATE UNIQUE INDEX "raw_ingest_idempotency_unique" ON "RawIngest"("organization_id", "source_system", "external_record_id");
CREATE INDEX "RawIngest_organization_id_idx" ON "RawIngest"("organization_id");

-- Add FK CrmWebhook -> Organization
ALTER TABLE crm_webhooks
ADD CONSTRAINT crm_webhooks_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add FK User -> Organization
ALTER TABLE "User"
ADD CONSTRAINT user_organization_id_fkey
FOREIGN KEY ("organization_id") REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one default org, one DripJobs webhook, assign all users to that org
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (gen_random_uuid()::text, 'Default', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE "User" SET "organization_id" = (SELECT id FROM organizations LIMIT 1);

INSERT INTO crm_webhooks (id, organization_id, webhook_secret, crm_type, is_active, request_count, created_at, updated_at)
SELECT
  gen_random_uuid()::text,
  (SELECT id FROM organizations LIMIT 1),
  gen_random_uuid()::text,
  'dripjobs',
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP;
