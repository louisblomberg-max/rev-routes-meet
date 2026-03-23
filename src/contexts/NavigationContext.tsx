/**
 * NavigationContext — full turn-by-turn navigation state management.
 * Includes session tracking to Supabase navigation_sessions table.
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import {
  NavigationRoute, NavigationDestination, NavigationStep,
  fetchRoute, getUserPosition, watchUserPosition, isOffRoute, getCurrentStepIndex,
} from '@/services/navigationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type NavigationStatus = 'idle' | 'loading' | 'previewing' | 'navigating' | 'arrived';
export type CameraFollowMode = 'follow' | 'free';

export interface LiveSharingState { isSharing: boolean; recipients: LiveShareRecipient[]; sessionId: string | null; startedAt: string | null; }
export interface LiveShareRecipient { id: string; type: 'friends' | 'specific' | 'club'; label: string; }

export interface NavigationState {
  status: NavigationStatus; route: NavigationRoute | null; destination: NavigationDestination | null;
  userPosition: { lat: number; lng: number } | null; userHeading: number | null;
  currentStepIndex: number; steps: NavigationStep[]; error: string | null;
  muted: boolean; cameraFollowMode: CameraFollowMode; isOverviewMode: boolean;
  distanceRemainingMeters: number; etaSeconds: number; liveSharing: LiveSharingState;
}

interface NavigationContextType extends NavigationState {
  startNavigation: (dest: NavigationDestination) => Promise<void>;
  beginLiveNavigation: () => void; stopNavigation: () => void; recenter: () => void;
  toggleMute: () => void; toggleOverview: () => void;
  setActiveStep: (index: number) => void; setCameraFollowMode: (mode: CameraFollowMode) => void;
  toggleLiveSharing: () => void; setLiveSharingRecipients: (recipients: LiveShareRecipient[]) => void;
  stopLiveSharing: () => void;
  onRecenterRef: React.MutableRefObject<(() => void) | null>;
  onCameraFollowRef: React.MutableRefObject<((pos: { lat: number; lng: number }, heading: number | null) => void) | null>;
  onOverviewRef: React.MutableRefObject<((route: NavigationRoute) => void) | null>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);
const REROUTE_DEBOUNCE_MS = 5000;
const ARRIVAL_THRESHOLD_M = 50;

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<NavigationStatus>('idle');
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [destination, setDestination] = useState<NavigationDestination | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraFollowMode, setCameraFollowMode] = useState<CameraFollowMode>('follow');
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  const [distanceRemainingMeters, setDistanceRemainingMeters] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [liveSharing, setLiveSharing] = useState<LiveSharingState>({ isSharing: false, recipients: [], sessionId: null, startedAt: null });

  const watchCleanupRef = useRef<(() => void) | null>(null);
  const lastRerouteRef = useRef(0);
  const navSessionIdRef = useRef<string | null>(null);
  const onRecenterRef = useRef<(() => void) | null>(null);
  const onCameraFollowRef = useRef<((pos: { lat: number; lng: number }, heading: number | null) => void) | null>(null);
  const onOverviewRef = useRef<((route: NavigationRoute) => void) | null>(null);

  useEffect(() => { return () => { watchCleanupRef.current?.(); }; }, []);

  useEffect(() => {
    if (!route) { setDistanceRemainingMeters(0); setEtaSeconds(0); return; }
    let dist = 0, dur = 0;
    for (let i = currentStepIndex; i < route.steps.length; i++) { dist += route.steps[i].distance; dur += route.steps[i].duration; }
    setDistanceRemainingMeters(dist); setEtaSeconds(dur);
  }, [route, currentStepIndex]);

  const endSession = useCallback(async (completed: boolean, distance: number) => {
    if (!navSessionIdRef.current) return;
    await supabase.from('navigation_sessions').update({
      ended_at: new Date().toISOString(), distance_meters: distance, completed,
    }).eq('id', navSessionIdRef.current);
    navSessionIdRef.current = null;
  }, []);

  const startNavigation = useCallback(async (dest: NavigationDestination) => {
    setError(null); setStatus('loading'); setDestination(dest);
    setCameraFollowMode('follow'); setIsOverviewMode(false);
    try {
      const origin = await getUserPosition(); setUserPosition(origin);
      const r = await fetchRoute(origin, { lat: dest.lat, lng: dest.lng });
      setRoute(r); setCurrentStepIndex(0); setDistanceRemainingMeters(r.distance); setEtaSeconds(r.duration);
      setStatus('previewing');
      // Insert navigation session
      if (user?.id) {
        const { data } = await supabase.from('navigation_sessions').insert({
          user_id: user.id, destination_title: dest.title,
          dest_lat: dest.lat, dest_lng: dest.lng, started_at: new Date().toISOString(),
        }).select('id').single();
        if (data) navSessionIdRef.current = data.id;
      }
    } catch (e: any) {
      const msg = e?.message || 'Failed to get route';
      setError(msg); setStatus('idle'); toast.error('Navigation failed', { description: msg });
    }
  }, [user?.id]);

  const beginLiveNavigation = useCallback(() => {
    if (!route) return;
    setStatus('navigating'); setCameraFollowMode('follow'); setIsOverviewMode(false);
    watchCleanupRef.current?.();
    watchCleanupRef.current = watchUserPosition(
      (pos) => {
        setUserPosition(pos);
        if (route) {
          const idx = getCurrentStepIndex(pos, route.steps); setCurrentStepIndex(idx);
          if (cameraFollowMode === 'follow') onCameraFollowRef.current?.(pos, null);
          if (destination) {
            const distToDest = haversineDistance(pos.lat, pos.lng, destination.lat, destination.lng);
            if (distToDest < ARRIVAL_THRESHOLD_M) {
              setStatus('arrived'); watchCleanupRef.current?.(); watchCleanupRef.current = null;
              if (!muted) toast.success('You have arrived!', { description: destination.title });
              endSession(true, 0);
              return;
            }
          }
          if (isOffRoute(pos, route) && Date.now() - lastRerouteRef.current > REROUTE_DEBOUNCE_MS) {
            lastRerouteRef.current = Date.now();
            if (!muted) toast.info('Rerouting…');
            if (destination) {
              fetchRoute(pos, { lat: destination.lat, lng: destination.lng })
                .then((newRoute) => { setRoute(newRoute); setCurrentStepIndex(0); }).catch(() => {});
            }
          }
        }
      },
      () => { toast.error('GPS signal lost'); },
    );
  }, [route, destination, cameraFollowMode, muted, endSession]);

  const stopNavigation = useCallback(() => {
    watchCleanupRef.current?.(); watchCleanupRef.current = null;
    endSession(false, distanceRemainingMeters);
    setStatus('idle'); setRoute(null); setDestination(null); setCurrentStepIndex(0);
    setError(null); setMuted(false); setCameraFollowMode('follow'); setIsOverviewMode(false);
    setLiveSharing({ isSharing: false, recipients: [], sessionId: null, startedAt: null });
  }, [endSession, distanceRemainingMeters]);

  const recenter = useCallback(() => { setCameraFollowMode('follow'); setIsOverviewMode(false); onRecenterRef.current?.(); }, []);
  const toggleMute = useCallback(() => { setMuted(prev => !prev); }, []);
  const toggleOverview = useCallback(() => {
    setIsOverviewMode(prev => { const next = !prev; if (next && route) onOverviewRef.current?.(route); else if (!next) onRecenterRef.current?.(); return next; });
  }, [route]);
  const setActiveStep = useCallback((index: number) => { setCurrentStepIndex(index); }, []);
  const toggleLiveSharing = useCallback(() => {
    setLiveSharing(prev => ({ ...prev, isSharing: !prev.isSharing, sessionId: !prev.isSharing ? crypto.randomUUID() : null, startedAt: !prev.isSharing ? new Date().toISOString() : null }));
  }, []);
  const setLiveSharingRecipients = useCallback((recipients: LiveShareRecipient[]) => { setLiveSharing(prev => ({ ...prev, recipients })); }, []);
  const stopLiveSharing = useCallback(() => { setLiveSharing({ isSharing: false, recipients: [], sessionId: null, startedAt: null }); }, []);

  return (
    <NavigationContext.Provider value={{
      status, route, destination, userPosition, userHeading, currentStepIndex,
      steps: route?.steps || [], error, muted, cameraFollowMode, isOverviewMode,
      distanceRemainingMeters, etaSeconds, liveSharing,
      startNavigation, beginLiveNavigation, stopNavigation, recenter, toggleMute,
      toggleOverview, setActiveStep, setCameraFollowMode, toggleLiveSharing,
      setLiveSharingRecipients, stopLiveSharing, onRecenterRef, onCameraFollowRef, onOverviewRef,
    }}>{children}</NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
