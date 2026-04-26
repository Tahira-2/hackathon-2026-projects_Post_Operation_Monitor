/*
  Warnings:

  - You are about to drop the column `fullTranscript` on the `call_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "communication"."call_sessions" DROP COLUMN "fullTranscript";
