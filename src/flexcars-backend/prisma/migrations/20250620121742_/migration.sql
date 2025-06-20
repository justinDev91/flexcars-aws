-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('RENTAL', 'ACCIDENT', 'LATER_PENALTY');

-- AlterTable
ALTER TABLE "PricingRule" ADD COLUMN     "type" "PricingType" DEFAULT 'RENTAL';
