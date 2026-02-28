-- CreateEnum
CREATE TYPE "Role" AS ENUM ('sales_rep', 'service_rep', 'manager');

-- CreateEnum
CREATE TYPE "SourceSystem" AS ENUM ('elead', 'fortellis', 'xtime', 'dripjobs');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role",
    "dealership_id" TEXT,
    "external_user_id" TEXT,
    "crm_source" "SourceSystem",
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "leads_created" INTEGER NOT NULL DEFAULT 0,
    "cars_sold" INTEGER NOT NULL DEFAULT 0,
    "vehicle_value_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "profit_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "services_completed" INTEGER NOT NULL DEFAULT 0,
    "hours_billed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hours_worked" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawIngest" (
    "id" TEXT NOT NULL,
    "source_system" "SourceSystem" NOT NULL,
    "external_record_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_user_id" TEXT,
    "processed_performance_id" TEXT,
    "error_message" TEXT,

    CONSTRAINT "RawIngest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_dealership_id_idx" ON "User"("dealership_id");

-- CreateIndex
CREATE UNIQUE INDEX "dealership_external_user_unique" ON "User"("dealership_id", "external_user_id");

-- CreateIndex
CREATE INDEX "Performance_month_year_idx" ON "Performance"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "performance_user_month_year_unique" ON "Performance"("user_id", "month", "year");

-- CreateIndex
CREATE INDEX "RawIngest_received_at_idx" ON "RawIngest"("received_at");

-- CreateIndex
CREATE UNIQUE INDEX "raw_ingest_idempotency_unique" ON "RawIngest"("source_system", "external_record_id");

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
