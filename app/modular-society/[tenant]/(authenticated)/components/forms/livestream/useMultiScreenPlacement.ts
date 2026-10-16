'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ScreenInfo {
  id: string;
  label: string;
  isPrimary: boolean;
  isInternal: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
}

export type BroadcastWindowRole = 'teleprompter' | 'desktop_stage' | 'mobile_stage';

interface ScreenDetailedNative {
  label?: string;
  isPrimary?: boolean;
  isInternal?: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
}

interface ScreenDetailsNative extends EventTarget {
  screens: ScreenDetailedNative[];
  currentScreen: ScreenDetailedNative;
  onscreenschange: ((this: ScreenDetailsNative, ev: Event) => any) | null;
  oncurrentscreenchange: ((this: ScreenDetailsNative, ev: Event) => any) | null;
}

declare global {
  interface Window {
    getScreenDetails?: () => Promise<ScreenDetailsNative>;
  }
}

function getFallbackPrimaryScreen(): ScreenInfo {
  if (typeof window === 'undefined') {
    return {
      id: 'primary-0',
      label: 'Primary Display',
      isPrimary: true,
      isInternal: true,
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
      availLeft: 0,
      availTop: 0,
      availWidth: 1920,
      availHeight: 1040,
    };
  }

  const s = window.screen as any;
  return {
    id: 'primary-0',
    label: s?.label || 'Primary Display',
    isPrimary: true,
    isInternal: true,
    left: s?.left ?? 0,
    top: s?.top ?? 0,
    width: s?.width ?? 1920,
    height: s?.height ?? 1080,
    availLeft: s?.availLeft ?? 0,
    availTop: s?.availTop ?? 0,
    availWidth: s?.availWidth ?? 1920,
    availHeight: s?.availHeight ?? 1040,
  };
}

function mapNativeScreens(nativeScreens: ScreenDetailedNative[]): ScreenInfo[] {
  return nativeScreens.map((s, idx) => ({
    id: `screen-${idx}-${s.left}-${s.top}`,
    label: s.label || (s.isPrimary ? 'Primary Display' : `External Display ${idx + 1}`),
    isPrimary: !!s.isPrimary,
    isInternal: !!s.isInternal,
    left: s.left,
    top: s.top,
    width: s.width,
    height: s.height,
    availLeft: s.availLeft,
    availTop: s.availTop,
    availWidth: s.availWidth,
    availHeight: s.availHeight,
  }));
}

export function useMultiScreenPlacement(active: boolean = true) {
  const [screens, setScreens] = useState<ScreenInfo[]>(() => [getFallbackPrimaryScreen()]);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [newlyConnectedScreen, setNewlyConnectedScreen] = useState<ScreenInfo | null>(null);
  const [isMultiScreenExtended, setIsMultiScreenExtended] = useState<boolean>(false);

  const screenDetailsRef = useRef<ScreenDetailsNative | null>(null);
  const prevScreenCountRef = useRef<number>(1);

  const updateFromScreenDetails = useCallback((details: ScreenDetailsNative) => {
    const mapped = mapNativeScreens(details.screens);
    setScreens((prev) => {
      if (mapped.length > prev.length && prev.length >= 1) {
        // Find a newly added external screen
        const added = mapped.find((m) => !prev.some((p) => p.left === m.left && p.top === m.top && p.label === m.label));
        if (added) {
          setNewlyConnectedScreen(added);
        } else {
          const ext = mapped.find((m) => !m.isPrimary);
          if (ext) setNewlyConnectedScreen(ext);
        }
      }
      prevScreenCountRef.current = mapped.length;
      return mapped.length > 0 ? mapped : [getFallbackPrimaryScreen()];
    });
    setIsMultiScreenExtended(mapped.length > 1);
  }, []);

  const requestScreenAccess = useCallback(async (): Promise<ScreenInfo[]> => {
    if (typeof window === 'undefined' || typeof window.getScreenDetails !== 'function') {
      setPermissionState('unsupported');
      const fallback = [getFallbackPrimaryScreen()];
      setScreens(fallback);
      return fallback;
    }

    try {
      const details = await window.getScreenDetails();
      screenDetailsRef.current = details;
      setPermissionState('granted');
      const mapped = mapNativeScreens(details.screens);
      prevScreenCountRef.current = mapped.length;
      setScreens(mapped);
      setIsMultiScreenExtended(mapped.length > 1);

      details.onscreenschange = () => {
        updateFromScreenDetails(details);
      };

      return mapped;
    } catch (err) {
      setPermissionState('denied');
      const fallback = [getFallbackPrimaryScreen()];
      setScreens(fallback);
      return fallback;
    }
  }, [updateFromScreenDetails]);

  // Automatically check window-management permission and extended status on open
  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    // Check window.screen.isExtended if available (doesn't require permission prompt)
    const winScreen = window.screen as any;
    if (typeof winScreen?.isExtended === 'boolean') {
      setIsMultiScreenExtended(winScreen.isExtended);
    }

    const handleScreenChange = () => {
      if (typeof winScreen?.isExtended === 'boolean') {
        const nowExtended = winScreen.isExtended;
        setIsMultiScreenExtended(nowExtended);
      }
    };

    if (winScreen && typeof winScreen.addEventListener === 'function') {
      winScreen.addEventListener('change', handleScreenChange);
    }

    // If permission was already granted previously, initialize getScreenDetails silently
    if (navigator.permissions && typeof navigator.permissions.query === 'function') {
      navigator.permissions
        .query({ name: 'window-management' as PermissionName })
        .then((status) => {
          setPermissionState(status.state as any);
          if (status.state === 'granted') {
            requestScreenAccess();
          }
          status.onchange = () => {
            setPermissionState(status.state as any);
            if (status.state === 'granted') {
              requestScreenAccess();
            }
          };
        })
        .catch(() => {
          // Fallback for browsers where window-management isn't a recognized query name
          if (typeof window.getScreenDetails !== 'function') {
            setPermissionState('unsupported');
          }
        });
    }

    return () => {
      if (winScreen && typeof winScreen.removeEventListener === 'function') {
        winScreen.removeEventListener('change', handleScreenChange);
      }
    };
  }, [active, requestScreenAccess]);

  const dismissNewScreenAlert = useCallback(() => {
    setNewlyConnectedScreen(null);
  }, []);

  /**
   * Computes exact window.open features (left, top, width, height) for a given role
   * so windows open directly on external monitors or non-overlapping coordinates.
   */
  const getWindowPlacementFeatures = useCallback(
    (
      role: BroadcastWindowRole,
      options?: {
        targetScreen?: ScreenInfo;
        suiteMode?: boolean;
        customScreens?: ScreenInfo[];
      }
    ): string => {
      const activeScreens = options?.customScreens || screens;
      const primary = activeScreens.find((s) => s.isPrimary) || activeScreens[0] || getFallbackPrimaryScreen();
      const externals = activeScreens.filter((s) => !s.isPrimary);

      let left = primary.availLeft + 60;
      let top = primary.availTop + 60;
      let width = 1280;
      let height = 780;

      // If caller specified an explicit target screen
      if (options?.targetScreen) {
        const t = options.targetScreen;
        if (role === 'mobile_stage') {
          width = Math.min(520, t.availWidth);
          height = Math.min(920, t.availHeight);
          left = t.availLeft + Math.max(0, Math.floor((t.availWidth - width) / 2));
          top = t.availTop + Math.max(0, Math.floor((t.availHeight - height) / 2));
        } else {
          width = t.availWidth;
          height = t.availHeight;
          left = t.availLeft;
          top = t.availTop;
        }
        return `left=${left},top=${top},width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,resizable=yes`;
      }

      // Multi-screen smart distribution
      if (externals.length >= 2) {
        // 3+ Monitors total:
        // External 1 -> Teleprompter (Full screen)
        // External 2 -> Desktop 16:9 Stage (Left/Main) + Mobile 9:16 Stage (Right)
        const ext1 = externals[0];
        const ext2 = externals[1];
        if (role === 'teleprompter') {
          left = ext1.availLeft;
          top = ext1.availTop;
          width = ext1.availWidth;
          height = ext1.availHeight;
        } else if (role === 'desktop_stage') {
          left = ext2.availLeft;
          top = ext2.availTop;
          width = options?.suiteMode ? Math.floor(ext2.availWidth * 0.68) : ext2.availWidth;
          height = ext2.availHeight;
        } else if (role === 'mobile_stage') {
          width = Math.min(520, Math.floor(ext2.availWidth * 0.32));
          height = Math.min(940, ext2.availHeight);
          left = ext2.availLeft + ext2.availWidth - width;
          top = ext2.availTop;
        }
      } else if (externals.length === 1) {
        // 2 Monitors total (Primary + 1 External Display):
        const ext = externals[0];
        if (options?.suiteMode) {
          // In Suite Mode: place Teleprompter + Desktop Stage cleanly on External Display, Mobile Stage on Primary right edge
          if (role === 'teleprompter') {
            width = Math.floor(ext.availWidth * 0.42);
            height = ext.availHeight;
            left = ext.availLeft + ext.availWidth - width;
            top = ext.availTop;
          } else if (role === 'desktop_stage') {
            width = Math.floor(ext.availWidth * 0.58);
            height = ext.availHeight;
            left = ext.availLeft;
            top = ext.availTop;
          } else if (role === 'mobile_stage') {
            width = Math.min(500, Math.floor(primary.availWidth * 0.3));
            height = Math.min(900, primary.availHeight - 40);
            left = primary.availLeft + primary.availWidth - width - 20;
            top = primary.availTop + 20;
          }
        } else {
          // Single window launch when 1 external monitor is connected -> send directly to External Monitor!
          if (role === 'mobile_stage') {
            width = Math.min(520, ext.availWidth);
            height = Math.min(920, ext.availHeight);
            left = ext.availLeft + Math.max(0, Math.floor((ext.availWidth - width) / 2));
            top = ext.availTop + Math.max(0, Math.floor((ext.availHeight - height) / 2));
          } else {
            left = ext.availLeft;
            top = ext.availTop;
            width = ext.availWidth;
            height = ext.availHeight;
          }
        }
      } else {
        // 1 Monitor (Primary Display only): Non-overlapping tiled coordinates
        if (role === 'teleprompter') {
          width = Math.min(760, Math.floor(primary.availWidth * 0.45));
          height = Math.min(860, primary.availHeight - 60);
          left = primary.availLeft + primary.availWidth - width - 24;
          top = primary.availTop + 30;
        } else if (role === 'desktop_stage') {
          width = Math.min(1180, Math.floor(primary.availWidth * 0.62));
          height = Math.min(720, primary.availHeight - 80);
          left = primary.availLeft + 24;
          top = primary.availTop + 30;
        } else if (role === 'mobile_stage') {
          width = 480;
          height = Math.min(880, primary.availHeight - 60);
          left = primary.availLeft + Math.max(40, Math.floor((primary.availWidth - width) / 2));
          top = primary.availTop + 30;
        }
      }

      return `left=${Math.round(left)},top=${Math.round(top)},width=${Math.round(width)},height=${Math.round(height)},menubar=no,toolbar=no,location=no,status=no,resizable=yes`;
    },
    [screens]
  );

  const externalScreens = screens.filter((s) => !s.isPrimary);

  return {
    screens,
    externalScreens,
    isMultiScreenExtended: isMultiScreenExtended || externalScreens.length > 0,
    permissionState,
    newlyConnectedScreen,
    dismissNewScreenAlert,
    requestScreenAccess,
    getWindowPlacementFeatures,
  };
}
