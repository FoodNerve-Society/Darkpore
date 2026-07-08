"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { User } from 'firebase/auth';

// ============================================================
// IDENTITY TYPES
// ============================================================

export type UserRole = 'student' | 'entrepreneur' | 'investor' | 'employee' | 'researcher' | 'chef' | 'farmer' | 'processor' | 'logistics' | 'vendor';

export type Challenge = 'post-harvest-loss' | 'cold-chain' | 'soil-health' | 'market-access' | 'capital' | 'energy';

export type RankLevel = 1 | 2 | 3 | 4 | 5;

export const RANK_NAMES: Record<RankLevel, string> = {
  1: 'Initiate',
  2: 'Builder',
  3: 'Catalyst',
  4: 'Pioneer',
  5: 'Apex',
};

export const RANK_COLORS: Record<RankLevel, string> = {
  1: '#9e9e9e',
  2: '#4caf50',
  3: '#ff9800',
  4: '#7c4dff',
  5: '#ffd700',
};

// ============================================================
// THE 4-TIER WALLET
// ============================================================

export interface NerveWallet {
  lifetimeNP: number;      // Permanent XP — determines rank, never goes down
  withdrawableNP: number;   // Earned from peers — withdrawable to fiat
  spendableNP: number;      // Bought with fiat — spendable on platform, non-withdrawable
  promoNP: number;           // Free credits — only for system sinks, non-transferable
}

// ============================================================
// GATEKEEPER FLAGS
// ============================================================

export interface GatekeeperFlags {
  hasCompletedProfile: boolean;    // Rank 2 requirement
  hasKYC: boolean;                  // Rank 3 requirement
  hasBusinessVerification: boolean; // Rank 4 requirement
}

// ============================================================
// ORGANIZATION CONTEXT
// ============================================================

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  department?: string;
  role: 'admin' | 'trader' | 'content-creator' | 'viewer' | 'editor' | string;
  verified?: boolean;
  logoUrl?: string;
  website?: string;
}

// ============================================================
// THE SOCIETY PROFILE
// ============================================================

export interface SocietyProfile {
  uid: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  prefixes?: string[];
  suffixes?: string[];
  avatarUrl?: string;
  bio?: string;
  isAdmin: boolean; // The God-Mode Flag

  // Identity
  roles: UserRole[];
  selectedChallenges: Challenge[];
  wahaalas: string[];
  tabOrder: string[];
  landingPage: string | null;

  // Ranking
  currentRank: RankLevel;
  gatekeepers: GatekeeperFlags;

  // Tokenomics (The 4-Tier Wallet)
  wallet: NerveWallet;

  // Capital Allocator Tracking
  lifetimeInvestedFiat: number;
  lifetimeDonatedFiat: number;
  lifetimeSpentNP: number;

  // Organization Context
  organizations?: Organization[];
  activeOrgId?: string | null; // null = acting as individual

  // Legacy
  onboardingComplete: boolean;
  lastActiveTab?: string;
  joinedAt?: string;
}

// ============================================================
// RANK CALCULATOR
// ============================================================

export function calculateRank(profile: SocietyProfile): RankLevel {
  const { wallet, gatekeepers, lifetimeInvestedFiat, lifetimeDonatedFiat, lifetimeSpentNP } = profile;
  const np = wallet.lifetimeNP;

  // Rank 5: Apex — Must be Rank 4 PLUS prove investment/support
  if (gatekeepers.hasBusinessVerification && np >= 5000 && lifetimeInvestedFiat >= 5000000) return 5;

  // Rank 4: Pioneer — Verified Business OR Verified Employee of a Rank 4 Business
  if (gatekeepers.hasBusinessVerification && np >= 5000) return 4;

  // Rank 3: Catalyst — KYC (Which includes joining a business) + (Spent 500 NP OR Donated ₦50k)
  if (gatekeepers.hasKYC && np >= 2000 && (lifetimeSpentNP >= 500 || lifetimeDonatedFiat >= 50000)) return 3;

  // Rank 2: Builder — Profile Complete
  if (gatekeepers.hasCompletedProfile && np >= 500) return 2;

  // Rank 1: Initiate (Default)
  return 1;
}

// ============================================================
// GATEKEEPER CHECKER
// ============================================================

export type GatekeeperResult = {
  allowed: boolean;
  requiredRank: RankLevel;
  currentRank: RankLevel;
  upgradeRoute?: string;
  message?: string;
};

export function checkGatekeeper(profile: SocietyProfile, requiredRank: RankLevel): GatekeeperResult {
  // Bypasses the gatekeeper if the user is an Admin, Super Admin, or Investor (Omni-Filter)
  if (profile.isAdmin || profile.roles?.includes('investor') || profile.roles?.includes('super_admin' as any)) {
    return { allowed: true, requiredRank, currentRank: 5 }; // Grant max rank privileges
  }

  const currentRank = calculateRank(profile);

  if (currentRank >= requiredRank) {
    return { allowed: true, requiredRank, currentRank };
  }

  const upgradeRoutes: Record<RankLevel, string> = {
    1: '/profile',
    2: '/profile/setup',
    3: '/profile/kyc',
    4: '/profile/verify-business',
    5: '/profile',
  };

  const messages: Record<RankLevel, string> = {
    1: 'You need to log in first.',
    2: 'Complete your profile to unlock this feature.',
    3: 'Verify your identity to unlock networking and advanced features.',
    4: 'Verify your business to launch campaigns and act as escrow.',
    5: 'Board approval is required for Industry-level actions.',
  };

  return {
    allowed: false,
    requiredRank,
    currentRank,
    upgradeRoute: upgradeRoutes[requiredRank],
    message: messages[requiredRank],
  };
}

// ============================================================
// CONTEXT TYPE
// ============================================================

interface SocietyContextType {
  user: User | null;
  profile: SocietyProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
  activeOrg: Organization | null;
  switchOrg: (orgId: string | null) => void;
  updateLastActiveTab: (tab: string) => Promise<void>;
  isUpdatesOpen: boolean;
  setUpdatesOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocietyContext = createContext<SocietyContextType>({
  user: null,
  profile: null,
  loading: true,
  needsOnboarding: false,
  activeOrg: null,
  switchOrg: () => {},
  updateLastActiveTab: async () => {},
  isUpdatesOpen: false,
  setUpdatesOpen: () => {},
});

export const useSociety = () => useContext(SocietyContext);

// ============================================================
// PROVIDER
// ============================================================

export function SocietyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SocietyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatesOpen, setUpdatesOpen] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Auto-close updates drawer on navigation
  useEffect(() => {
    if (pathname !== '/updates' && isUpdatesOpen) {
      setUpdatesOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    // DEV BYPASS REMOVED: We need real auth state and routing.

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch Prisma Profile via API
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              idToken,
              mockUser: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                picture: firebaseUser.photoURL
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // -------------------------------------------------------------------
            // THE ADMIN HACK:
            // Check if any Firebase provider is explicitly 'password'
            // -------------------------------------------------------------------
            const isSuperAdmin = firebaseUser.providerData.some(p => p.providerId === 'password');

            // Map Prisma User to SocietyProfile
            const prismaUser = data.user;
            const mappedProfile: SocietyProfile = {
              uid: prismaUser.id,
              displayName: prismaUser.name,
              firstName: prismaUser.firstName || undefined,
              lastName: prismaUser.lastName || undefined,
              prefixes: prismaUser.prefixes ? JSON.parse(prismaUser.prefixes) : [],
              avatarUrl: prismaUser.avatarUrl,
              bio: prismaUser.bio,
              isAdmin: isSuperAdmin,
              roles: [prismaUser.role], // Mock array
              selectedChallenges: [],
              wahaalas: prismaUser.wahaalaCategories ? JSON.parse(prismaUser.wahaalaCategories) : [],
              tabOrder: prismaUser.tabOrder ? JSON.parse(prismaUser.tabOrder) : [],
              landingPage: prismaUser.landingPage || null,
              currentRank: prismaUser.rank,
              gatekeepers: {
                hasCompletedProfile: prismaUser.hasCompletedProfile || false,
                hasKYC: prismaUser.hasKYC || false,
                hasBusinessVerification: prismaUser.hasBusinessVerification || false,
              },
              wallet: {
                lifetimeNP: prismaUser.lifetimeNP || 0,
                withdrawableNP: prismaUser.withdrawableNP || 0,
                spendableNP: prismaUser.spendableNP || 0,
                promoNP: prismaUser.promoNP || 0,
              },
              lifetimeInvestedFiat: 0,
              lifetimeDonatedFiat: 0,
              lifetimeSpentNP: 0,
              onboardingComplete: !!prismaUser.landingPage && !!prismaUser.tabOrder,
              joinedAt: prismaUser.joinedAt,
              organizations: prismaUser.organizationMembers?.map((m: any) => ({
                id: m.organization.id,
                name: m.organization.name,
                slug: m.organization.slug,
                department: m.department,
                role: m.role,
                logoUrl: m.organization.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.organization.name)}&background=0f172a&color=fff`,
                website: ''
              })) || [],
              activeOrgId: null,
            };setProfile(mappedProfile);

            // Redirect handling if needed
            const redirectUrl = searchParams.get('redirect') || searchParams.get('returnUrl');
            const hostname = window.location.hostname;
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : '';
            
            // If the user logs in from a public site (.com or darkpore.com), 
            // they MUST be physically redirected to the authenticated society subdomain.
            const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
            const isPublicSite = !isLocal && !hostname.includes('.org') && !hostname.startsWith('society.');
            
            let targetPath = '';

            if (redirectUrl) {
              targetPath = redirectUrl;
            } else if (
              window.location.pathname === '/join' || 
              window.location.pathname === '/' || 
              window.location.pathname === '/login' || 
              window.location.pathname === '/finishSignUp'
            ) {
              if (mappedProfile.landingPage) {
                targetPath = `/${mappedProfile.landingPage}`;
              } else if (mappedProfile.lastActiveTab) {
                targetPath = `/${mappedProfile.lastActiveTab}`;
              } else {
                targetPath = '/updates';
              }
            }

            if (targetPath) {
              if (isPublicSite) {
                // Cross-domain redirect to society.[tenant].com
                const cleanHostname = hostname.replace(/^www\./, '');
                const targetDomain = `society.${cleanHostname}`;
                window.location.href = `${protocol}//${targetDomain}${port}${targetPath}`;
              } else {
                // Relative router push for domains that already host the authenticated shell
                router.push(targetPath);
              }
            }
          } else {
            console.error('Failed to sync profile', await response.text());
            setProfile(null);
            auth.signOut(); // Force sign out to break the infinite loading loop
          }
        } catch (err) {
          console.error('Error fetching profile', err);
          setProfile(null);
          auth.signOut(); // Force sign out to break the infinite loading loop
        }
      } else {
        setUser(null);
        setProfile(null);
        // We let the specific (authenticated) Route Group handle security.
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const needsOnboarding = user !== null && (!profile || !profile.landingPage || !profile.tabOrder || profile.tabOrder.length === 0);

  // Organization context switcher
  const activeOrg = profile?.organizations?.find(o => o.id === profile.activeOrgId) || null;

  const switchOrg = (orgId: string | null) => {
    if (!profile) return;
    setProfile({ ...profile, activeOrgId: orgId });
  };

  const updateLastActiveTab = async (tab: string) => {
    if (!profile || profile.lastActiveTab === tab) return;
    
    // Optimistically update UI
    setProfile({ ...profile, lastActiveTab: tab });

    // Sync to DB (if we have an endpoint for this)
    // fetch('/api/user/preference', { method: 'POST', body: JSON.stringify({ key: 'lastActiveTab', value: tab }) });
  };

  // -------------------------------------------------------------
  // Smart Interceptor: Route Authenticated Root Visits to Updates
  // -------------------------------------------------------------
  useEffect(() => {
    if (user && profile && window.location.pathname === '/') {
      router.push('/updates');
    }
  }, [user, profile, router]);

  return (
    <SocietyContext.Provider value={{ user, profile, loading, needsOnboarding, activeOrg, switchOrg, updateLastActiveTab, isUpdatesOpen, setUpdatesOpen }}>
      {children}
    </SocietyContext.Provider>
  );
}
