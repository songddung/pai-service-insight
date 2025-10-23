-- CreateTable
CREATE TABLE "analytics" (
    "analytics_id" BIGSERIAL NOT NULL,
    "child_id" INT NOT NULL,
    "conversation_id" BIGINT NOT NULL,
    "extracted_keywords" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateTable
CREATE TABLE "child_interests" (
    "interest_id" BIGSERIAL NOT NULL,
    "child_id" INT NOT NULL,
    "keyword" VARCHAR(100) NOT NULL,
    "raw_score" DOUBLE PRECISION NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_interests_pkey" PRIMARY KEY ("interest_id")
);

-- CreateIndex
CREATE INDEX "analytics_child_id_idx" ON "analytics"("child_id");

-- CreateIndex
CREATE INDEX "analytics_conversation_id_idx" ON "analytics"("conversation_id");

-- CreateIndex
CREATE INDEX "analytics_created_at_idx" ON "analytics"("created_at");

-- CreateIndex
CREATE INDEX "child_interests_child_id_idx" ON "child_interests"("child_id");

-- CreateIndex
CREATE INDEX "child_interests_last_updated_idx" ON "child_interests"("last_updated");

-- CreateIndex
CREATE UNIQUE INDEX "child_interests_child_id_keyword_key" ON "child_interests"("child_id", "keyword");
