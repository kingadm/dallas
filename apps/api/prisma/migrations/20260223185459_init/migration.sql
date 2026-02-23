-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "closeTime" TEXT,
ADD COLUMN     "openDays" TEXT,
ADD COLUMN     "openTime" TEXT,
ADD COLUMN     "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo';
