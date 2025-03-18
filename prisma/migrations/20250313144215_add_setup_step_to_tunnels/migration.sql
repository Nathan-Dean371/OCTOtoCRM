/*
  Warnings:

  - Added the required column `created_by` to the `tunnels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webhook_url` to the `tunnels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tunnels" ADD COLUMN     "created_by" UUID NOT NULL,
ADD COLUMN     "setup_step" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "webhook_url" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "tunnel_credentials" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tunnel_id" UUID NOT NULL,
    "source" VARCHAR(80) NOT NULL,
    "sourceEncryptedAPIkey" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iv" VARCHAR(64) NOT NULL,
    "authTag" VARCHAR(64) NOT NULL,
    "algorithm" VARCHAR(20) NOT NULL DEFAULT 'aes-256-gcm',

    CONSTRAINT "tunnel_credentials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tunnels" ADD CONSTRAINT "tunnels_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tunnel_credentials" ADD CONSTRAINT "tunnel_id" FOREIGN KEY ("tunnel_id") REFERENCES "tunnels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
