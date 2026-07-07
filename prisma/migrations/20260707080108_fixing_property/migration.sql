/*
  Warnings:

  - You are about to drop the column `ownerId` on the `properties` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_ownerId_fkey";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "ownerId";
