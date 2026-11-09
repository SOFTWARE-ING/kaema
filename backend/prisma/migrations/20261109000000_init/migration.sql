CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "AppointmentChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'CHAT', 'WEBSITE');
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'DELIVERED', 'CANCELLED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "clientName" TEXT NOT NULL,
  "contact" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "slot" TEXT NOT NULL,
  "message" TEXT NOT NULL DEFAULT '',
  "channel" "AppointmentChannel" NOT NULL DEFAULT 'WEBSITE',
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Appointment_date_status_idx" ON "Appointment"("date", "status");
CREATE INDEX "Appointment_userId_createdAt_idx" ON "Appointment"("userId", "createdAt");
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Suggestion" (
  "id" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Suggestion_createdAt_idx" ON "Suggestion"("createdAt");
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "SuggestionVote" (
  "id" TEXT NOT NULL,
  "suggestionId" TEXT NOT NULL,
  "userId" TEXT,
  "voterKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SuggestionVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SuggestionVote_suggestionId_voterKey_key" ON "SuggestionVote"("suggestionId", "voterKey");
CREATE INDEX "SuggestionVote_suggestionId_idx" ON "SuggestionVote"("suggestionId");
ALTER TABLE "SuggestionVote" ADD CONSTRAINT "SuggestionVote_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SuggestionVote" ADD CONSTRAINT "SuggestionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ShowroomProduct" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "imageUrl" TEXT NOT NULL DEFAULT '',
  "stock" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShowroomProduct_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ShowroomProduct_published_createdAt_idx" ON "ShowroomProduct"("published", "createdAt");

CREATE TABLE "ProductOrder" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "total" INTEGER NOT NULL,
  "deliveryDays" INTEGER NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerContact" TEXT NOT NULL,
  "message" TEXT NOT NULL DEFAULT '',
  "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProductOrder_status_createdAt_idx" ON "ProductOrder"("status", "createdAt");
ALTER TABLE "ProductOrder" ADD CONSTRAINT "ProductOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ShowroomProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ChatConversation" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "guestKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatConversation_userId_updatedAt_idx" ON "ChatConversation"("userId", "updatedAt");
CREATE INDEX "ChatConversation_guestKey_updatedAt_idx" ON "ChatConversation"("guestKey", "updatedAt");
CREATE UNIQUE INDEX "ChatConversation_userId_key" ON "ChatConversation"("userId");
CREATE UNIQUE INDEX "ChatConversation_guestKey_key" ON "ChatConversation"("guestKey");
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ChatMessage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "sender" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
