import * as admin from 'firebase-admin';

if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle escaped newlines in private keys
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Export adminAuth proxy that warns if not initialized
export const adminAuth = process.env.FIREBASE_PRIVATE_KEY 
  ? admin.auth() 
  : {
      verifyIdToken: async (token: string) => {
        console.warn("FIREBASE_PRIVATE_KEY missing. Bypassing token verification in development.");
        if (process.env.NODE_ENV !== 'development') {
          throw new Error("Missing FIREBASE_PRIVATE_KEY in production.");
        }
        // In dev, we can't decode the token safely without a library, 
        // so we just throw a specific error and let the route handle it.
        throw new Error("DEV_MISSING_ADMIN_KEYS");
      }
    } as any;
