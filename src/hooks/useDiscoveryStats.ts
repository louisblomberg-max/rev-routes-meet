// ============================
// Discovery Stats Hook
// ============================
// Provides reactive counters for "X events nearby", "Y routes trending", etc.

import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import type { DiscoveryStats } from '@/models';

export function useDiscoveryStats(): DiscoveryStats {
  const { events, routes, services } = useData();

  return useMemo(() => ({
    eventsNearby: events.getDiscoveryStats().eventsNearby,
    routesTrending: routes.getDiscoveryStats().routesTrending,
    servicesOpenNow: services.getDiscoveryStats().servicesOpenNow,
  }), [events, routes, services]);
}
