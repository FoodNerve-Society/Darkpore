import 'dotenv/config';
import { prisma } from '../lib/db/client';
import { 
  inviteCoHostAction, 
  respondToCoHostInvitation, 
  notifyCoHostsOnPublish, 
  createLearnContent 
} from '../lib/actions/learn';

async function runTests() {
  console.log('--- Starting Co-Host Actions Tests ---');

  // 1. Create a test livestream content record
  const uniqueSlug = `test-livestream-${Date.now()}`;
  const content = await prisma.learnContent.create({
    data: {
      title: 'Automated Test Livestream: Cocoa Post-Harvest Processing',
      description: 'Testing co-host invitation flow and acceptance tracking.',
      slug: uniqueSlug,
      type: 'livestream',
      status: 'draft',
      category: 'post-harvest',
      subcategory: 'fermentation',
      timeframe: 'present',
      authorId: 'test-host-uid',
      authorName: 'Dr. Test Host',
      authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      collaborators: '[]',
      targetDate: new Date(Date.now() + 86400000), // tomorrow
    }
  });

  console.log(`[PASS] Created test livestream: ID=${content.id}, Slug=${content.slug}`);

  // Create associated LearnLivestream with studio meta
  const studioMeta = {
    guestStudioUrl: 'https://studio.restream.io/guest/test-session-123',
    streamUrl: 'https://youtube.com/live/test1234',
    hubTitle: 'Production & Capital',
    hubColor: '#10b981',
  };

  const stream = await prisma.learnLivestream.create({
    data: {
      learnContentId: content.id,
      streamUrl: studioMeta.streamUrl,
      scheduledFor: content.targetDate,
      blocks: {
        create: [
          {
            orderIndex: 0,
            blockType: 'metadata',
            content: JSON.stringify({ _studioMeta: studioMeta }),
          }
        ]
      }
    }
  });
  console.log(`[PASS] Created LearnLivestream with guestStudioUrl`);

  // 2. Test inviteCoHostAction with ID
  console.log('\n--- Test 2: inviteCoHostAction with ID ---');
  const inviteRes1 = await inviteCoHostAction({
    draftId: content.id,
    collaborator: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'Guest Panelist',
      note: 'Looking forward to your insights on fermentation kinetics.',
    },
    inviterName: 'Dr. Test Host',
    livestreamTitle: content.title,
    tenant: 'food',
  });
  console.log('Invite 1 result:', inviteRes1);

  if (!inviteRes1.success) {
    throw new Error(`Invite 1 failed: ${inviteRes1.error}`);
  }

  // Verify DB record
  const checkDb1 = await prisma.learnContent.findUnique({
    where: { id: content.id },
    select: { collaborators: true }
  });
  const collabs1 = JSON.parse(checkDb1?.collaborators || '[]');
  console.log('Collaborators in DB after invite 1:', collabs1);
  if (collabs1.length !== 1 || collabs1[0].email !== 'ada@example.com' || collabs1[0].status !== 'invited') {
    throw new Error('Database collaborator state mismatch after invite 1');
  }

  // 3. Test inviteCoHostAction with SLUG (instead of ID)
  console.log('\n--- Test 3: inviteCoHostAction with SLUG ---');
  const inviteRes2 = await inviteCoHostAction({
    draftId: content.slug,
    collaborator: {
      name: 'Babatunde Alabi',
      email: 'babatunde@example.com',
      role: 'Technical Presenter',
    },
    inviterName: 'Dr. Test Host',
    tenant: 'food',
  });
  console.log('Invite 2 (slug) result:', inviteRes2);
  if (!inviteRes2.success) {
    throw new Error(`Invite 2 by slug failed: ${inviteRes2.error}`);
  }

  // 4. Test respondToCoHostInvitation (Accept)
  console.log('\n--- Test 4: respondToCoHostInvitation (Accept) ---');
  const acceptRes = await respondToCoHostInvitation({
    livestreamId: content.id,
    accept: true,
    user: {
      uid: 'ada-uid-789',
      name: 'Ada Lovelace, PhD',
      email: 'ada@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    }
  });
  console.log('Accept result:', acceptRes);
  if (!acceptRes.success || acceptRes.status !== 'accepted') {
    throw new Error(`Accept failed: ${JSON.stringify(acceptRes)}`);
  }

  // Verify DB updated with accepted status, acceptedAt, and real name/avatar
  const checkDb2 = await prisma.learnContent.findUnique({
    where: { id: content.id },
    select: { collaborators: true }
  });
  const collabs2 = JSON.parse(checkDb2?.collaborators || '[]');
  console.log('Collaborators in DB after acceptance:', collabs2);
  const adaInDb = collabs2.find((c: any) => c.email === 'ada@example.com');
  if (!adaInDb || adaInDb.status !== 'accepted' || !adaInDb.acceptedAt) {
    throw new Error('Database collaborator acceptance mismatch');
  }

  // 5. Test respondToCoHostInvitation (Decline)
  console.log('\n--- Test 5: respondToCoHostInvitation (Decline) ---');
  const declineRes = await respondToCoHostInvitation({
    livestreamId: content.slug,
    accept: false,
    user: {
      uid: 'babatunde-uid-456',
      name: 'Babatunde Alabi',
      email: 'babatunde@example.com',
    }
  });
  console.log('Decline result:', declineRes);
  if (!declineRes.success || declineRes.status !== 'declined') {
    throw new Error(`Decline failed: ${JSON.stringify(declineRes)}`);
  }

  // 6. Test notifyCoHostsOnPublish
  console.log('\n--- Test 6: notifyCoHostsOnPublish ---');
  const notifyRes = await notifyCoHostsOnPublish(content.id, 'Dr. Test Host');
  console.log('Notify on publish result:', notifyRes);
  // Ada is accepted (not declined), Babatunde is declined (excluded)
  // So count should be 1
  if (!notifyRes.success || notifyRes.count !== 1) {
    throw new Error(`Expected exactly 1 notification dispatched (Ada), got: ${notifyRes.count}`);
  }

  // Cleanup test content
  await prisma.learnLivestreamBlock.deleteMany({ where: { livestreamId: stream.id } });
  await prisma.learnLivestream.delete({ where: { id: stream.id } });
  await prisma.learnContent.delete({ where: { id: content.id } });
  console.log('\n[CLEANUP] Successfully cleaned up test records');

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(e => {
  console.error('\n[TEST FAILURE]:', e);
  process.exit(1);
});
