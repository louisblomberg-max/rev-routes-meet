// ============================
// Discovery Stats Hook
// ============================
import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import type { DiscoveryStats } from '@/models';

export function useDiscoveryStats(): DiscoveryStats {
  const { state } = useData();

  return useMemo(() => ({
    eventsNearby: state.events.length,
    routesTrending: state.routes.length,
    servicesOpenNow: state.services.length,
  }), [state.events, state.routes, state.services]);
}
