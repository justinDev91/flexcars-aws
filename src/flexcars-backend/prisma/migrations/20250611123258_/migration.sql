-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailConfirmExpires" TIMESTAMP(3),
ADD COLUMN     "emailConfirmToken" TEXT,
ADD COLUMN     "emailConfirmed" BOOLEAN NOT NULL DEFAULT false;
