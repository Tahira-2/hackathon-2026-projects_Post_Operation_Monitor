/*
  Warnings:

  - Added the required column `form` to the `medicines` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "catalog"."medicine_forms" AS ENUM ('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT', 'DROPS', 'INHALER', 'POWDER');

-- CreateEnum
CREATE TYPE "catalog"."medicine_categories" AS ENUM ('PRESCRIPTION', 'OTC', 'CONTROLLED', 'SUPPLEMENT');

-- AlterTable
ALTER TABLE "catalog"."medicines" ADD COLUMN     "category" "catalog"."medicine_categories",
ADD COLUMN     "drugClass" TEXT,
ADD COLUMN     "form" "catalog"."medicine_forms" NOT NULL,
ADD COLUMN     "rxnormCode" TEXT;

-- CreateIndex
CREATE INDEX "medicines_rxnormCode_idx" ON "catalog"."medicines"("rxnormCode");
