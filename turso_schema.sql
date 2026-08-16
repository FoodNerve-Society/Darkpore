CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "prefixes" TEXT,
    "suffixes" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "lifetimeNP" INTEGER NOT NULL DEFAULT 0,
    "withdrawableNP" INTEGER NOT NULL DEFAULT 0,
    "spendableNP" INTEGER NOT NULL DEFAULT 0,
    "promoNP" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "hasCompletedProfile" BOOLEAN NOT NULL DEFAULT false,
    "hasKYC" BOOLEAN NOT NULL DEFAULT false,
    "hasBusinessVerification" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "location" TEXT,
    "lga" TEXT,
    "specialization" TEXT,
    "subSector" TEXT,
    "bio" TEXT,
    "wahaalaCategories" TEXT,
    "tabOrder" TEXT,
    "landingPage" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, "username" TEXT);
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT,
    "cacNumber" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rank" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, "logoUrl" TEXT, "country" TEXT, "state" TEXT, "lga" TEXT, "address" TEXT, "isVirtual" BOOLEAN NOT NULL DEFAULT false, "isExternal" BOOLEAN NOT NULL DEFAULT false, "isPlatformOwner" BOOLEAN NOT NULL DEFAULT false, "challenges" TEXT, "subcategories" TEXT);
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "department" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "TradeListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "commodity" TEXT,
    "quantity" TEXT,
    "priceOrAsk" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'active',
    "slotsFilled" INTEGER,
    "slotsTotal" INTEGER,
    "swapOffer" TEXT,
    "swapWant" TEXT,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "nervePointsCost" INTEGER,
    "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedById" TEXT NOT NULL, "jobSource" TEXT, "compType" TEXT, "targetTenantId" TEXT, "externalCompany" TEXT, "externalUrl" TEXT, "npReward" INTEGER, "minRank" INTEGER, "currency" TEXT, "minSalary" REAL, "maxSalary" REAL, "duration" TEXT, "startDate" DATETIME, "endDate" DATETIME, "workModel" TEXT, "challenges" TEXT, "subcategories" TEXT, "applicationMethod" TEXT NOT NULL DEFAULT 'native', "applicationEmail" TEXT, "applicationInstructions" TEXT, "customQuestions" TEXT, "requiredDocuments" TEXT, "externalButtonText" TEXT, "organizationId" TEXT, "jobFunction" TEXT,
    CONSTRAINT "TradeListing_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tier" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "goalAmount" REAL NOT NULL,
    "raisedAmount" REAL NOT NULL DEFAULT 0,
    "backerCount" INTEGER NOT NULL DEFAULT 0,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'funding',
    "originTag" TEXT,
    "tractionMetric" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizerId" TEXT NOT NULL,
    "initiativeId" TEXT, "organizationId" TEXT,
    CONSTRAINT "Campaign_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Campaign_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "InitiativePitch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE "MarketPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commodity" TEXT NOT NULL,
    "currentPrice" TEXT NOT NULL,
    "previousPrice" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "change" REAL NOT NULL,
    "region" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE "MeetEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "attendees" INTEGER NOT NULL DEFAULT 0,
    "maxAttendees" INTEGER NOT NULL,
    "hostName" TEXT NOT NULL,
    "hostAvatarUrl" TEXT,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, "organizationId" TEXT, "status" TEXT NOT NULL DEFAULT 'published', "hostUserId" TEXT);
CREATE TABLE "LearnContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'article',
    "status" TEXT NOT NULL DEFAULT 'published',
    "bottleneckTags" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT,
    "subcategory" TEXT,
    "timeframe" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "authorId" TEXT,
    "authorName" TEXT,
    "authorAvatarUrl" TEXT,
    "collaborators" TEXT NOT NULL DEFAULT '[]',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "costNP" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "targetDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, "organizationId" TEXT);
CREATE TABLE "LearnArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnContentId" TEXT NOT NULL,
    "readTime" TEXT,
    CONSTRAINT "LearnArticle_learnContentId_fkey" FOREIGN KEY ("learnContentId") REFERENCES "LearnContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "LearnArticleBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "blockType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "LearnArticleBlock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "LearnArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "BlockComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "avatarUrl" TEXT,
    "text" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockComment_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "LearnArticleBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlockComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlockComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "LearnArticleBlockRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "editedBy" TEXT NOT NULL,
    "oldContent" TEXT NOT NULL,
    "newContent" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearnArticleBlockRevision_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "LearnArticleBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "LearnVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnContentId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT,
    CONSTRAINT "LearnVideo_learnContentId_fkey" FOREIGN KEY ("learnContentId") REFERENCES "LearnContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "LearnClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnContentId" TEXT NOT NULL,
    "moduleCount" INTEGER NOT NULL DEFAULT 1,
    "totalDuration" TEXT,
    CONSTRAINT "LearnClass_learnContentId_fkey" FOREIGN KEY ("learnContentId") REFERENCES "LearnContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "LearnLivestream" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnContentId" TEXT NOT NULL,
    "streamUrl" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "scheduledFor" DATETIME,
    CONSTRAINT "LearnLivestream_learnContentId_fkey" FOREIGN KEY ("learnContentId") REFERENCES "LearnContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "LearnReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnContentId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "pageCount" INTEGER,
    CONSTRAINT "LearnReport_learnContentId_fkey" FOREIGN KEY ("learnContentId") REFERENCES "LearnContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "ChallengeUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "importance" TEXT NOT NULL DEFAULT 'normal',
    "linkText" TEXT NOT NULL,
    "externalLink" TEXT,
    "subcategoryId" TEXT NOT NULL,
    "subcategoryTitle" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "LearningMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "previewText" TEXT NOT NULL,
    "fullContent" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "author" TEXT,
    "readTime" TEXT,
    "subcategoryId" TEXT NOT NULL,
    "subcategoryTitle" TEXT,
    "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "CommunityGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityGroup_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommunityGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE "CommunityGroupMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "DailySparkQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionText" TEXT NOT NULL,
    "sourceArticleId" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "era" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "CommunityCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "dailySparkId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "hasSpawnedSubgroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityCard_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityCard_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityCard_dailySparkId_fkey" FOREIGN KEY ("dailySparkId") REFERENCES "DailySparkQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "CommunityCardBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "blockType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "CommunityCardBlock_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CommunityCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityPost_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "CommunityPostBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "blockType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "CommunityPostBlock_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "SubgroupInitiative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceCardId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ideation',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubgroupInitiative_sourceCardId_fkey" FOREIGN KEY ("sourceCardId") REFERENCES "CommunityCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "SubgroupParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    CONSTRAINT "SubgroupParticipant_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "SubgroupInitiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubgroupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "SubgroupFollower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubgroupFollower_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "SubgroupInitiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubgroupFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "ConsensusQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "proposedAnswer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passedAt" DATETIME,
    CONSTRAINT "ConsensusQuestion_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "SubgroupInitiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "ConsensusVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "voteStatus" TEXT NOT NULL,
    CONSTRAINT "ConsensusVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ConsensusQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConsensusVote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "SubgroupParticipant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "InitiativePitch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InitiativePitch_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "SubgroupInitiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "PitchReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pitchId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "isHelpful" BOOLEAN,
    "ratedAt" DATETIME,
    CONSTRAINT "PitchReview_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "InitiativePitch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PitchReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hasUnread" BOOLEAN NOT NULL DEFAULT false,
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT,
    "images" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");
CREATE UNIQUE INDEX "Campaign_initiativeId_key" ON "Campaign"("initiativeId");
CREATE UNIQUE INDEX "LearnContent_slug_key" ON "LearnContent"("slug");
CREATE INDEX "LearnContent_authorId_status_idx" ON "LearnContent"("authorId", "status");
CREATE INDEX "LearnContent_type_status_idx" ON "LearnContent"("type", "status");
CREATE INDEX "LearnContent_targetDate_idx" ON "LearnContent"("targetDate");
CREATE UNIQUE INDEX "LearnArticle_learnContentId_key" ON "LearnArticle"("learnContentId");
CREATE INDEX "BlockComment_blockId_createdAt_idx" ON "BlockComment"("blockId", "createdAt");
CREATE INDEX "BlockComment_parentId_idx" ON "BlockComment"("parentId");
CREATE UNIQUE INDEX "LearnVideo_learnContentId_key" ON "LearnVideo"("learnContentId");
CREATE UNIQUE INDEX "LearnClass_learnContentId_key" ON "LearnClass"("learnContentId");
CREATE UNIQUE INDEX "LearnLivestream_learnContentId_key" ON "LearnLivestream"("learnContentId");
CREATE UNIQUE INDEX "LearnReport_learnContentId_key" ON "LearnReport"("learnContentId");
CREATE UNIQUE INDEX "LearningMaterial_slug_key" ON "LearningMaterial"("slug");
CREATE UNIQUE INDEX "Community_roleKey_key" ON "Community"("roleKey");
CREATE UNIQUE INDEX "CommunityGroup_organizationId_key" ON "CommunityGroup"("organizationId");
CREATE UNIQUE INDEX "CommunityGroupMember_groupId_userId_key" ON "CommunityGroupMember"("groupId", "userId");
CREATE UNIQUE INDEX "DailySparkQuestion_scheduledDate_key" ON "DailySparkQuestion"("scheduledDate");
CREATE UNIQUE INDEX "SubgroupInitiative_sourceCardId_key" ON "SubgroupInitiative"("sourceCardId");
CREATE UNIQUE INDEX "SubgroupParticipant_initiativeId_userId_key" ON "SubgroupParticipant"("initiativeId", "userId");
CREATE UNIQUE INDEX "SubgroupFollower_initiativeId_userId_key" ON "SubgroupFollower"("initiativeId", "userId");
CREATE UNIQUE INDEX "ConsensusVote_questionId_participantId_key" ON "ConsensusVote"("questionId", "participantId");
CREATE UNIQUE INDEX "InitiativePitch_initiativeId_key" ON "InitiativePitch"("initiativeId");
CREATE UNIQUE INDEX "PitchReview_pitchId_reviewerId_key" ON "PitchReview"("pitchId", "reviewerId");
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");
CREATE TABLE "OmniWikiDoc" (
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
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "UserWikiState" ("id" TEXT PRIMARY KEY, "wikiDocId" TEXT, "userId" TEXT, "checkboxes" TEXT);
CREATE TABLE "WikiHotspotRegistry" ("id" TEXT PRIMARY KEY, "label" TEXT, "description" TEXT, "category" TEXT, "subcategory" TEXT, "createdAt" DATETIME, "updatedAt" DATETIME);