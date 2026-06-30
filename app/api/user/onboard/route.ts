import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    // If the client doesn't send the token in header, maybe they use session cookie
    // But typically they would need to send idToken. Let's assume Firebase Client is available
    // Actually, in Next.js Server Components, we don't have idToken directly.
    // Let's rely on standard practice or we can just send the idToken in the body if needed.
    // But since this is called from the client, we can send idToken in headers or body.
    // Let's modify the client to send the idToken in Authorization header.
    
    // Actually, wait, let's just grab the token from headers:
    const token = authHeader?.split('Bearer ')[1];
    if (!token) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const body = await request.json();
    const { landingPage, tabOrder, firstName, lastName, prefixes, suffixes } = body;

    if (!landingPage || !tabOrder) {
       return NextResponse.json({ error: 'Landing page and Tab Order are required' }, { status: 400 });
    }

    const updateData: any = {
      landingPage: landingPage,
      tabOrder: JSON.stringify(tabOrder),
    };

    if (firstName && lastName) {
      const nameParts = [
        ...(prefixes || []),
        firstName,
        lastName,
        ...(suffixes || [])
      ];
      updateData.name = nameParts.filter(Boolean).join(' ');
      updateData.firstName = firstName;
      updateData.lastName = lastName;
      updateData.prefixes = prefixes && prefixes.length > 0 ? JSON.stringify(prefixes) : null;
      updateData.suffixes = suffixes && suffixes.length > 0 ? JSON.stringify(suffixes) : null;
    }

    // Update the User in Prisma
    const updatedUser = await prisma.user.update({
      where: { firebaseUid: uid },
      data: updateData
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
