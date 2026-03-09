// ============================
// Content Filtering & Personalisation Engine
// ============================
// Reads user preferences (onboarding interests, garage vehicles, style tags)
// and returns scored/filtered content. Supabase-ready: replace with RPC calls later.

import { useMemo } from 'react';
import { useGarage } from '@/contexts/GarageContext';
import { useData } from '@/contexts/DataContext';
import type { RevEvent, RevRoute, RevService, Club } from '@/models';

// ── Canonical tag mapping from onboarding interest labels → content tags ──
const INTEREST_TO_TAGS: Record<string, string[]> = {
  'Events':           ['events', 'meets', 'cars & coffee'],
  'Drive-outs':       ['drive-outs', 'group drive', 'drive / drive-out'],
  'Track days':       ['track days', 'track', 'track day', 'motorsport'],
  'Car shows':        ['car shows', 'show / exhibition'],
  'Scenic routes':    ['scenic', 'scenic routes'],
  'Twisty roads':     ['twisty', 'twisty roads'],
  'Off-road routes':  ['off-road', 'off-road routes'],
  'Mechanics':        ['mechanics', 'mechanic', 'garage'],
  'Detailing':        ['detailing', 'ceramic coating', 'ppf'],
  'Tuning':           ['tuning', 'performance', 'ecu'],
  'Parts suppliers':  ['parts suppliers', 'parts', 'aftermarket'],
  'Car clubs':        ['local club', 'brand specific', 'track club'],
  'Motorcycle groups':['motorcycle', 'motorcycle club', 'motorcycle groups'],
};

// ── Style tag → content tag mapping ──
const STYLE_TAG_TO_TAGS: Record<string, string[]> = {
  'Classic':   ['classic', 'restoration'],
  'Supercar':  ['supercars', 'performance'],
  'JDM':       ['jdm'],
  'Euro':      ['euro', 'bmw', 'mercedes', 'audi', 'porsche'],
  'American':  ['american', 'muscle', 'v8'],
  'Track':     ['track', 'track days', 'motorsport', 'performance'],
  'Off-road':  ['off-road', 'off-road routes'],
  'Drift':     ['drift', 'jdm'],
  'EV':        ['ev', 'ev charging'],
  'Modified':  ['tuning', 'performance', 'modified'],
  'Stock':     [],
  'Project':   ['project', 'restoration'],
  'Show Car':  ['car shows', 'detailing'],
  'Daily':     [],
};

interface ScoredItem<T> {
  item: T;
  score: number;
}

function scoreTags(itemTags: string[], userTags: Set<string>): number {
  if (userTags.size === 0) return 0;
  let score = 0;
  for (const tag of itemTags) {
    if (userTags.has(tag.toLowerCase())) score += 1;
  }
  return score;
}

function scoreMakeMatch(itemTags: string[], userMakes: string[]): number {
  let score = 0;
  for (const make of userMakes) {
    const makeLower = make.toLowerCase();
    if (itemTags.some(t => t.toLowerCase() === makeLower)) score += 2; // make match is strong signal
  }
  return score;
}

export function useContentFilter() {
  const { vehicles, preferences } = useGarage();
  const { state } = useData();

  // Build unified user tag set from interests + style tags + vehicle types
  const userContext = useMemo(() => {
    const tags = new Set<string>();

    // From onboarding interests stored in preferences
    for (const interest of preferences.interests) {
      const mapped = INTEREST_TO_TAGS[interest];
      if (mapped) mapped.forEach(t => tags.add(t));
    }

    // From style tags
    for (const styleTag of preferences.styleTags) {
      const mapped = STYLE_TAG_TO_TAGS[styleTag];
      if (mapped) mapped.forEach(t => tags.add(t));
    }

    // From vehicle types
    if (preferences.vehicleTypes.includes('motorcycle')) tags.add('motorcycle');

    // Vehicle makes for make-matching
    const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))];

    // Vehicle-derived tags
    for (const vehicle of vehicles) {
      for (const tag of vehicle.tags) {
        const mapped = STYLE_TAG_TO_TAGS[tag];
        if (mapped) mapped.forEach(t => tags.add(t));
        else tags.add(tag.toLowerCase());
      }
    }

    return { tags, makes, hasPreferences: tags.size > 0 || makes.length > 0 };
  }, [preferences, vehicles]);

  // Score and sort any tagged array
  function scoreAndSort<T extends { tags: string[] }>(items: T[]): ScoredItem<T>[] {
    return items
      .map(item => ({
        item,
        score: scoreTags(item.tags, userContext.tags) + scoreMakeMatch(item.tags, userContext.makes),
      }))
      .sort((a, b) => b.score - a.score);
  }

  // ── Filtered + scored content ──
  const filteredEvents = useMemo(() => scoreAndSort(state.events.map(e => ({ ...e, tags: e.tags || [] }))), [state.events, userContext]);
  const filteredRoutes = useMemo(() => scoreAndSort(state.routes), [state.routes, userContext]);
  const filteredServices = useMemo(() => scoreAndSort(state.services), [state.services, userContext]);
  const filteredClubs = useMemo(() => scoreAndSort(state.clubs), [state.clubs, userContext]);

  // Convenience: check if an item matches user preferences (score > 0)
  const isRelevant = (tags: string[]): boolean => {
    if (!userContext.hasPreferences) return true; // no prefs = show everything
    return scoreTags(tags, userContext.tags) + scoreMakeMatch(tags, userContext.makes) > 0;
  };

  return {
    userContext,
    filteredEvents,
    filteredRoutes,
    filteredServices,
    filteredClubs,
    isRelevant,
    scoreAndSort,
  };
}
