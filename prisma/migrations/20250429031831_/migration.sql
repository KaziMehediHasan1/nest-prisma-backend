/*
  Warnings:

  - A unique constraint covering the columns `[lastGroupMessageId]` on the table `DirectMessage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lastConversationMessageId]` on the table `DirectMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "lastConversationMessageId" TEXT,
ADD COLUMN     "lastGroupMessageId" TEXT,
ALTER COLUMN "conversationId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessage_lastGroupMessageId_key" ON "DirectMessage"("lastGroupMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessage_lastConversationMessageId_key" ON "DirectMessage"("lastConversationMessageId");

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_lastGroupMessageId_fkey" FOREIGN KEY ("lastGroupMessageId") REFERENCES "GroupMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_lastConversationMessageId_fkey" FOREIGN KEY ("lastConversationMessageId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
