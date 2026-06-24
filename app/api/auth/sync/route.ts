import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { idToken, mockUser } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID Token' }, { status: 400 });
    }

    let uid, email, name, picture;

    try {
      // Verify token with Firebase Admin
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;
      email = decodedToken.email;
      name = decodedToken.name;
      picture = decodedToken.picture;
    } catch (e: any) {
      if (e.message === "DEV_MISSING_ADMIN_KEYS" && mockUser) {
        uid = mockUser.uid;
        email = mockUser.email;
        name = mockUser.name;
        picture = mockUser.picture;
      } else {
        throw e;
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Upsert User in Prisma
    const user = await prisma.user.upsert({
      where: { email },
      update: {}, // Do not overwrite user-customized name and avatar on every auth sync
      create: {
        id: uid,
        firebaseUid: uid,
        email,
        name: name || email.split('@')[0],
        avatarUrl: picture || null,
        role: 'member',
        rank: 1,
        lifetimeNP: 100, // Initial bonus
        spendableNP: 100, // Initial bonus
      },
      include: {
        organizationMembers: {
          include: {
            organization: true
          }
        }
      }
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Auth sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
