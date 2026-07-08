/*
  Warnings:

  - The values [ACTIVE] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PropertyAmenity" AS ENUM ('SECURITY_24_7', 'ELEVATOR', 'GENERATOR_BACKUP', 'CCTV_SURVEILLANCE', 'CENTRAL_AC', 'ROOFTOP_GARDEN', 'GYM_ACCESS', 'WIFI', 'PARKING', 'PREPAID_GAS');

-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('APPROVED', 'PENDING', 'REJECTED', 'COMPLETED');
ALTER TABLE "public"."rental_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rental_requests" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "public"."RentalStatus_old";
ALTER TABLE "rental_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "amenities" "PropertyAmenity"[];
