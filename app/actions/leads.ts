'use server';

import { prisma } from '@/lib/db/client';

export async function submitLead(formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (!firstName || !lastName || !email) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    // Check if email already exists
    const existing = await prisma.earlyAccessLead.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: 'This email is already on the list!' };
    }

    await prisma.earlyAccessLead.create({
      data: {
        firstName,
        lastName,
        email,
        role: role || 'Unknown',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting lead:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
