import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import {
  NavigationRoute,
  NavigationDestination,
  NavigationStep,
  fetchRoute,
  getUserPosition,
  watchUserPosition,
  isOffRoute,
  getCurrentStepIndex,
} from '@/services/navigationService';
import { toast } from 'sonner';

type NavigationStatus = 'idle' | 'loading' | 'previewing' | 'navigating';

interface NavigationContextType {
  status: NavigationStatus;
  route: NavigationRoute | null;
  destination: NavigationDestination | null;
  userPosition: { lat: number; lng: number } | null;
  currentStepIndex: number;
  steps: NavigationStep[];
  error: string | null;

  startNavigation: (dest: NavigationDestination) => Promise<void>;
  beginLiveNavigation: () => void;
  stopNavigation: () => void;
  recenter: () => void;
  // Expose for map recenter callback
  onRecenterRef: React.MutableRefObject<(() => void) | null>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const REROUTE_DEBOUNCE_MS = 5000;

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<NavigationStatus>('idle');
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [destination, setDestination] = useState<NavigationDestination | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchCleanupRef = useRef<(() => void) | null>(null);
  const lastRerouteRef = useRef(0);
  const onRecenterRef = useRef<(() => void) | null>(null);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => { watchCleanupRef.current?.(); };
  }, []);

  const startNavigation = useCallback(async (dest: NavigationDestination) => {
    setError(null);
    setStatus('loading');
    setDestination(dest);

    try {
      const origin = await getUserPosition();
      setUserPosition(origin);
      const r = await fetchRoute(origin, { lat: dest.lat, lng: dest.lng });
      setRoute(r);
      setCurrentStepIndex(0);
      setStatus('previewing');
    } catch (e: any) {
      const msg = e?.message || 'Failed to get route';
      setError(msg);
      setStatus('idle');
      toast.error('Navigation failed', { description: msg });
    }
  }, []);

  const beginLiveNavigation = useCallback(() => {
    if (!route) return;
    setStatus('navigating');

    watchCleanupRef.current?.();
    watchCleanupRef.current = watchUserPosition(
      (pos) => {
        setUserPosition(pos);

        // Update current step
        if (route) {
          const idx = getCurrentStepIndex(pos, route.steps);
          setCurrentStepIndex(idx);

          // Off-route detection with debounce
          if (isOffRoute(pos, route) && Date.now() - lastRerouteRef.current > REROUTE_DEBOUNCE_MS) {
            lastRerouteRef.current = Date.now();
            toast.info('Rerouting...');
            // Re-fetch route from current position
            if (destination) {
              fetchRoute(pos, { lat: destination.lat, lng: destination.lng })
                .then((newRoute) => {
                  setRoute(newRoute);
                  setCurrentStepIndex(0);
                })
                .catch(() => {}); // silent fail on reroute
            }
          }
        }
      },
      () => {
        toast.error('GPS signal lost');
      },
    );
  }, [route, destination]);

  const stopNavigation = useCallback(() => {
    watchCleanupRef.current?.();
    watchCleanupRef.current = null;
    setStatus('idle');
    setRoute(null);
    setDestination(null);
    setCurrentStepIndex(0);
    setError(null);
  }, []);

  const recenter = useCallback(() => {
    onRecenterRef.current?.();
  }, []);

  return (
    <NavigationContext.Provider value={{
      status,
      route,
      destination,
      userPosition,
      currentStepIndex,
      steps: route?.steps || [],
      error,
      startNavigation,
      beginLiveNavigation,
      stopNavigation,
      recenter,
      onRecenterRef,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
};
