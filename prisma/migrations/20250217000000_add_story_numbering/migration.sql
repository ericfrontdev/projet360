-- Add storyNumber column to stories table
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "storyNumber" INTEGER;

-- Add type column to stories table
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'FEATURE';

-- Add taskNumber column to tasks table
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "taskNumber" INTEGER;

-- Update existing stories with sequential numbers per project
WITH numbered_stories AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "projectId" ORDER BY "createdAt") as num
  FROM "stories"
)
UPDATE "stories" s
SET "storyNumber" = ns.num
FROM numbered_stories ns
WHERE s.id = ns.id;

-- Update existing tasks with sequential numbers per story
WITH numbered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "storyId" ORDER BY "createdAt") as num
  FROM "tasks"
)
UPDATE "tasks" t
SET "taskNumber" = nt.num
FROM numbered_tasks nt
WHERE t.id = nt.id;

-- Make columns required
ALTER TABLE "stories" ALTER COLUMN "storyNumber" SET NOT NULL;
ALTER TABLE "stories" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "taskNumber" SET NOT NULL;

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "stories_projectId_storyNumber_key" ON "stories"("projectId", "storyNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "tasks_storyId_taskNumber_key" ON "tasks"("storyId", "taskNumber");

-- Create attachments table
CREATE TABLE IF NOT EXISTS "attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storyId" TEXT NOT NULL,
    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for attachments
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_storyId_fkey" 
    FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
