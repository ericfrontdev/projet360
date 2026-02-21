-- Create invitations table
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invitations_token_key" UNIQUE ("token")
);

-- Create invitation_projects table
CREATE TABLE "invitation_projects" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "invitation_projects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invitation_projects_invitationId_projectId_key" UNIQUE ("invitationId", "projectId")
);

-- Add foreign keys
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" 
    FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invitation_projects" ADD CONSTRAINT "invitation_projects_invitationId_fkey" 
    FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitation_projects" ADD CONSTRAINT "invitation_projects_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
