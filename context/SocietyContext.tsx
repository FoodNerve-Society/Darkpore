"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, rtdb } from '@/lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from 'firebase/auth';

export type UserRole = 'student' | 'industry' | 'investor';

export interface SocietyProfile {
  uid: string;
  role?: UserRole;
  wahaalas: string[];
  nervePoints: number;
  onboardingComplete: boolean;
  businessDetails?: {
    location: string;
    sector: string;
    whatsapp: string;
  };
}

interface SocietyContextType {
  user: User | null;
  profile: SocietyProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
}

const SocietyContext = createContext<SocietyContextType>({
  user: null,
  profile: null,
  loading: true,
  needsOnboarding: false,
});

export const useSociety = () => useContext(SocietyContext);

export function SocietyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SocietyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // -------------------------------------------------------------
    // DEV BYPASS: If no real Firebase API key is provided, we 
    // inject a mock user so you can preview the Dashboard UI!
    // -------------------------------------------------------------
    if (
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-key" || 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "placeholder_api_key" || 
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    ) {
      console.log("Using Mock Auth State for Development Preview");
      setTimeout(() => {
        setUser({ uid: "dev-mock-uid" } as User);
        setProfile({
          uid: "dev-mock-uid",
          role: "industry",
          wahaalas: ["Capital", "Post-Harvest Loss"],
          nervePoints: 1250,
          onboardingComplete: true
        });
        setLoading(false);
      }, 1000);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch RTDB Profile
        const profileRef = ref(rtdb, `users/${firebaseUser.uid}`);
        const snapshot = await get(profileRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProfile(data);
          
          if (!data.onboardingComplete) {
            // Needs onboarding, but stay on current URL so modal can pop up
          } else {
            // If they came from a deep link, hydrate and redirect
            const redirectUrl = searchParams.get('redirect');
            if (redirectUrl) {
              router.push(redirectUrl);
            }
          }
        } else {
          // Brand new user -> Needs onboarding
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        // We no longer aggressively redirect here! 
        // We let the specific (authenticated) Route Group handle security.
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router, searchParams]);

  const needsOnboarding = user !== null && (!profile || !profile.onboardingComplete);

  return (
    <SocietyContext.Provider value={{ user, profile, loading, needsOnboarding }}>
      {children}
    </SocietyContext.Provider>
  );
}
