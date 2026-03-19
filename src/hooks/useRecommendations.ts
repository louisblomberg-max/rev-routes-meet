// ============================
// Recommendation hook
// ============================
// Reads garage + preferences + auth interests to influence what the app shows.

import { useMemo } from 'react';
import { useGarage } from '@/contexts/GarageContext';
import { useAuth } from '@/contexts/AuthContext';

export function useRecommendations() {
  const { vehicles, preferences } = useGarage();
  const { user } = useAuth();

  return useMemo(() => {
    const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))];
    const tags = preferences.styleTags;
    const types = preferences.vehicleTypes;
    const hasGarage = vehicles.length > 0;

    // Merge interests from GarageContext preferences + AuthContext
    const allInterests = [
      ...new Set([
        ...preferences.interests,
        ...(user?.interests?.events ?? []),
        ...(user?.interests?.routes ?? []),
        ...(user?.interests?.services ?? []),
      ]),
    ];

    // Generate recommended filter chips for Discovery
    const suggestedFilters: string[] = [];
    if (tags.includes('Track') || allInterests.includes('Track days')) suggestedFilters.push('Track Day');
    if (tags.includes('JDM')) suggestedFilters.push('JDM');
    if (tags.includes('Euro')) suggestedFilters.push('Euro');
    if (tags.includes('Classic') || allInterests.includes('Car shows')) suggestedFilters.push('Classic');
    if (tags.includes('EV')) suggestedFilters.push('EV');
    if (types.includes('motorcycle') || allInterests.includes('Motorcycle groups')) suggestedFilters.push('Motorcycle');
    if (allInterests.includes('Drive-outs')) suggestedFilters.push('Drive-outs');
    if (allInterests.includes('Events')) suggestedFilters.push('Events');

    // Service categories to prioritise based on interests + tags
    const priorityServiceCategories: string[] = [];
    if (tags.includes('EV')) priorityServiceCategories.push('EV Charging');
    if (tags.includes('Modified') || tags.includes('Track') || allInterests.includes('Tuning')) priorityServiceCategories.push('Performance Tuning');
    if (tags.includes('Classic')) priorityServiceCategories.push('Restoration');
    if (allInterests.includes('Mechanics')) priorityServiceCategories.push('Mechanics');
    if (allInterests.includes('Detailing')) priorityServiceCategories.push('Detailing');
    if (allInterests.includes('Parts suppliers')) priorityServiceCategories.push('Parts');

    // Route type preferences from interests
    const priorityRouteTypes: string[] = [];
    if (allInterests.includes('Scenic routes')) priorityRouteTypes.push('scenic');
    if (allInterests.includes('Twisty roads')) priorityRouteTypes.push('twisty');
    if (allInterests.includes('Off-road routes')) priorityRouteTypes.push('offroad');

    // Event type preferences
    const priorityEventTypes: string[] = [];
    if (allInterests.includes('Events') || allInterests.includes('Car shows')) priorityEventTypes.push('shows');
    if (allInterests.includes('Track days')) priorityEventTypes.push('track_day');
    if (allInterests.includes('Drive-outs')) priorityEventTypes.push('drive');

    // Club recommendations based on interests + vehicle makes
    const clubRecommendationFactors = {
      interests: allInterests,
      vehicleMakes: makes,
      vehicleCategories: tags,
    };

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
      allInterests,
      suggestedFilters,
      priorityServiceCategories,
      priorityRouteTypes,
      priorityEventTypes,
      clubRecommendationFactors,
      marketplaceFilters,
    };
  }, [vehicles, preferences, user?.interests]);
}
