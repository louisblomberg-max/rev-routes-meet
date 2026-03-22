// ============================
// Data convenience hooks
// ============================
import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import type { UserStats } from '@/models';

/** Get current user stats — reactive to state changes */
export const useUserStats = (_userId?: string): UserStats => {
  const { state } = useData();
  const { user } = useAuth();
  const { vehicles } = useGarage();
  const userId = _userId || user?.id || '';

  return useMemo(() => ({
    garageCount: vehicles.length,
    friendsCount: state.friends.filter((f: any) => f.status === 'accepted').length,
    clubsCount: state.clubMemberships.filter((m: any) => m.userId === userId).length,
    eventsCount: state.userAttendingEvents.length + state.userHostedEvents.length,
    routesCount: state.savedRoutes.length,
    discussionsCount: state.activities.filter((a: any) => a.type === 'forum_post' || a.type === 'forum_reply').length,
  }), [vehicles, state.friends, state.clubMemberships, state.userAttendingEvents, state.userHostedEvents, state.savedRoutes, state.activities, userId]);
};

/** Get community stats */
export const useCommunityStats = () => {
  const { state } = useData();
  return useMemo(() => ({
    totalMembers: 0,
    activeClubs: state.clubs.length,
    forumPosts: state.forumPosts.length,
    totalEvents: state.events.length,
  }), [state.clubs, state.forumPosts, state.events]);
};

/** Forum helpers */
export const useForumHelpers = () => {
  const getCategoryInfo = (categoryId: string) => {
    const categories: Record<string, { name: string; color: string }> = {
      general: { name: 'General', color: 'bg-muted text-foreground' },
      mods: { name: 'Mods & Tuning', color: 'bg-routes text-white' },
      troubleshooting: { name: 'Troubleshooting', color: 'bg-events text-white' },
      buying: { name: 'Buying & Selling', color: 'bg-primary text-primary-foreground' },
      track: { name: 'Track & Motorsport', color: 'bg-clubs text-white' },
      insurance: { name: 'Insurance & Ownership', color: 'bg-services text-foreground' },
    };
    return categories[categoryId] || { name: categoryId, color: 'bg-muted text-foreground' };
  };

  const getPostTypeInfo = (type: string) => {
    const types: Record<string, { label: string; icon: string; color: string }> = {
      question: { label: 'Question', icon: 'HelpCircle', color: 'bg-blue-100 text-blue-700' },
      advice: { label: 'Advice', icon: 'Lightbulb', color: 'bg-amber-100 text-amber-700' },
      discussion: { label: 'Discussion', icon: 'MessageSquare', color: 'bg-purple-100 text-purple-700' },
    };
    return types[type] || { label: type, icon: 'MessageSquare', color: 'bg-muted text-foreground' };
  };

  return { getCategoryInfo, getPostTypeInfo };
};
