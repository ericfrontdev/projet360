-- Create teams table
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- Create unique index for slug
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- Create team_members table
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- Create unique index for teamId + userId
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- Add foreign keys for team_members
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" 
    FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add teamId column to projects table
ALTER TABLE "projects" ADD COLUMN "teamId" TEXT;

-- Add foreign key for projects.teamId
ALTER TABLE "projects" ADD CONSTRAINT "projects_teamId_fkey" 
    FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create default team for existing projects
INSERT INTO "teams" ("id", "name", "slug", "description", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'Mon Équipe',
    'mon-equipe',
    'Équipe par défaut',
    NOW()
WHERE EXISTS (SELECT 1 FROM "projects");

-- Assign existing projects to default team
UPDATE "projects" 
SET "teamId" = (SELECT "id" FROM "teams" LIMIT 1)
WHERE "teamId" IS NULL;

-- Make teamId required
ALTER TABLE "projects" ALTER COLUMN "teamId" SET NOT NULL;
