/*
  Warnings:

  - You are about to drop the column `status` on the `companies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_status` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "company_status" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "unique_company_id";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "status",
ADD COLUMN     "company_status" "company_status" NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "last_login" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "password_reset_expires" DROP NOT NULL,
ALTER COLUMN "password_reset_expires" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "tunnels" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "company_id" UUID NOT NULL,
    "source_type" VARCHAR(50) NOT NULL,
    "source_config" JSON NOT NULL,
    "destination_type" VARCHAR(50) NOT NULL,
    "destination_config" JSON NOT NULL,
    "field_mappings" JSON NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tunnels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unique Company Name" ON "companies"("name");

-- AddForeignKey
ALTER TABLE "tunnels" ADD CONSTRAINT "company_id FK" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
