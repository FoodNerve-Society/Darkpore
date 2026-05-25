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
        // Kick them out if they are on a protected route
        // Wait, middleware should theoretically handle this, but fallback here:
        router.push('/?auth=required');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const needsOnboarding = user !== null && (!profile || !profile.onboardingComplete);

  return (
    <SocietyContext.Provider value={{ user, profile, loading, needsOnboarding }}>
      {children}
    </SocietyContext.Provider>
  );
}
