-- CreateTable
CREATE TABLE "communication"."consultation_summaries" (
    "id" TEXT NOT NULL,
    "callSessionId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "diagnoses" TEXT[],
    "medications" TEXT[],
    "followUp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consultation_summaries_callSessionId_key" ON "communication"."consultation_summaries"("callSessionId");

-- AddForeignKey
ALTER TABLE "communication"."consultation_summaries" ADD CONSTRAINT "consultation_summaries_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "communication"."call_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
