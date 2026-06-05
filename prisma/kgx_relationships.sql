CREATE TABLE IF NOT EXISTS "KgxRelationship" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KgxRelationship_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "KgxRelationship_sourceType_idx" ON "KgxRelationship"("sourceType");
CREATE INDEX IF NOT EXISTS "KgxRelationship_sourceId_idx" ON "KgxRelationship"("sourceId");
CREATE INDEX IF NOT EXISTS "KgxRelationship_relationType_idx" ON "KgxRelationship"("relationType");
CREATE INDEX IF NOT EXISTS "KgxRelationship_targetType_idx" ON "KgxRelationship"("targetType");
CREATE INDEX IF NOT EXISTS "KgxRelationship_targetId_idx" ON "KgxRelationship"("targetId");
