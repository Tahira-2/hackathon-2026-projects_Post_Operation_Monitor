-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "communication";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "scheduling";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateEnum
CREATE TYPE "auth"."role" AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "scheduling"."appointment_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "communication"."message_sender" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "communication"."call_status" AS ENUM ('INITIATED', 'ONGOING', 'ENDED', 'MISSED');

-- CreateEnum
CREATE TYPE "scheduling"."week_day" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "scheduling"."block_type" AS ENUM ('BREAK', 'BUSY', 'PERSONAL', 'EMERGENCY');

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "auth"."role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."specializations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."doctors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."patients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."medicines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling"."working_hours" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "day" "scheduling"."week_day" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling"."busy_blocks" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "scheduling"."block_type" NOT NULL,
    "reason" TEXT,

    CONSTRAINT "busy_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling"."appointments" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "scheduling"."appointment_status" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."call_sessions" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "communication"."call_status" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."transcript_chunks" (
    "id" TEXT NOT NULL,
    "callSessionId" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."conversations" (
    "id" TEXT NOT NULL,
    "userIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "communication"."message_sender" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_name_key" ON "catalog"."specializations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userId_key" ON "users"."doctors"("userId");

-- CreateIndex
CREATE INDEX "doctors_specializationId_idx" ON "users"."doctors"("specializationId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_userId_key" ON "users"."patients"("userId");

-- CreateIndex
CREATE INDEX "medicines_name_idx" ON "catalog"."medicines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "working_hours_doctorId_day_key" ON "scheduling"."working_hours"("doctorId", "day");

-- CreateIndex
CREATE INDEX "busy_blocks_doctorId_startTime_idx" ON "scheduling"."busy_blocks"("doctorId", "startTime");

-- CreateIndex
CREATE INDEX "appointments_doctorId_startTime_idx" ON "scheduling"."appointments"("doctorId", "startTime");

-- CreateIndex
CREATE INDEX "appointments_patientId_startTime_idx" ON "scheduling"."appointments"("patientId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "call_sessions_appointmentId_key" ON "communication"."call_sessions"("appointmentId");

-- CreateIndex
CREATE INDEX "call_sessions_doctorId_idx" ON "communication"."call_sessions"("doctorId");

-- CreateIndex
CREATE INDEX "call_sessions_patientId_idx" ON "communication"."call_sessions"("patientId");

-- CreateIndex
CREATE INDEX "transcript_chunks_callSessionId_timestamp_idx" ON "communication"."transcript_chunks"("callSessionId", "timestamp");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "communication"."messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "communication"."notifications"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "users"."doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."doctors" ADD CONSTRAINT "doctors_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "catalog"."specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."patients" ADD CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling"."working_hours" ADD CONSTRAINT "working_hours_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling"."busy_blocks" ADD CONSTRAINT "busy_blocks_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling"."appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling"."appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."call_sessions" ADD CONSTRAINT "call_sessions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "scheduling"."appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."transcript_chunks" ADD CONSTRAINT "transcript_chunks_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "communication"."call_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication"."conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
