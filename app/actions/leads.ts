'use server';

import { prisma } from '@/lib/db/client';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitLead(formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (!firstName || !lastName || !email || !role) {
      return { success: false, error: 'Please fill in all required fields, including your role.' };
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

    // Send the Welcome Email
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await resend.emails.send({
        from: 'Food Nerve <hello@innhubs.app>', // Must match verified domain
        to: email,
        subject: 'Welcome to the Vanguard.',
        react: WelcomeEmail({ firstName, role: role || 'Value Chain Actors' }),
      });
      
      console.log('Resend API Response:', resendResponse);
      
      if (resendResponse.error) {
        console.error('Failed to send email via Resend:', resendResponse.error);
        // We still return success: true because the lead was captured in the DB
      }
    } else {
      console.warn('RESEND_API_KEY is not set. Email was not sent.');
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting lead:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
