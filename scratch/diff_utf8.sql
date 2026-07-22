CREATE TABLE IF NOT EXISTS "OmniWikiDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "allowedRoles" TEXT NOT NULL DEFAULT '[]',
    "allowedUsers" TEXT NOT NULL DEFAULT '[]',
    "blocks" TEXT NOT NULL DEFAULT '[]',
    "parentId" TEXT,
    "hotspotId" TEXT UNIQUE,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "authorId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
