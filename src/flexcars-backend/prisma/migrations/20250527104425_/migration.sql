/*
  Warnings:

  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "birthDate" DROP NOT NULL,
ALTER COLUMN "birthDate" DROP DEFAULT,
ALTER COLUMN "phoneNumber" DROP NOT NULL;
