// ============================
// Recommendation hook
// ============================
// Reads garage + preferences to influence what the app shows.

import { useMemo } from 'react';
import { useGarage } from '@/contexts/GarageContext';

export function useRecommendations() {
  const { vehicles, preferences } = useGarage();

  return useMemo(() => {
    const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))];
    const tags = preferences.styleTags;
    const types = preferences.vehicleTypes;
    const hasGarage = vehicles.length > 0;

    // Generate recommended filter chips for Discovery
    const suggestedFilters: string[] = [];
    if (tags.includes('Track')) suggestedFilters.push('Track Day');
    if (tags.includes('JDM')) suggestedFilters.push('JDM');
    if (tags.includes('Euro')) suggestedFilters.push('Euro');
    if (tags.includes('Classic')) suggestedFilters.push('Classic');
    if (tags.includes('EV')) suggestedFilters.push('EV');
    if (types.includes('motorcycle')) suggestedFilters.push('Motorcycle');

    // Service categories to prioritise
    const priorityServiceCategories: string[] = [];
    if (tags.includes('EV')) priorityServiceCategories.push('EV Charging');
    if (tags.includes('Modified') || tags.includes('Track')) priorityServiceCategories.push('Performance Tuning');
    if (tags.includes('Classic')) priorityServiceCategories.push('Restoration');

    // Marketplace defaults
    const marketplaceFilters = {
      makes: makes.slice(0, 3),
      useGarageFiltering: hasGarage,
    };

    return {
      hasGarage,
      makes,
      tags,
      types,
      suggestedFilters,
      priorityServiceCategories,
      marketplaceFilters,
    };
  }, [vehicles, preferences]);
}
