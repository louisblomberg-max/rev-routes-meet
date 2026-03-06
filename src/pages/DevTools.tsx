// ============================
// Dev Tools — Switch Users, Reset Data, QA Checklist
// ============================
import { useState } from 'react';
import { FlaskConical, User, RotateCcw, CheckSquare, ChevronRight, Zap, Crown, CreditCard, AlertTriangle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { useData } from '@/contexts/DataContext';
import { MOCK_USER_PRESETS, type MockUserPreset } from '@/data/mockUsers';
import {
  seedEvents, seedRoutes, seedServices,
} from '@/repositories/mock/seedData';

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-sm p-4 ${className}`}>{children}</div>
);

const DevTools = () => {
  const navigate = useNavigate();
  const { user: authUser, updateProfile, logout } = useAuth();
  const { setPlan, setSubscriptionStatus, currentPlan, effectivePlan, getPlanLabel } = usePlan();
  const { state, events: eventsRepo } = useData();

  const [activePreset, setActivePreset] = useState<string | null>(() => {
    return localStorage.getItem('revnet_dev_preset') || null;
  });

  const switchUser = (preset: MockUserPreset) => {
    // Update AuthContext
    updateProfile({
      ...preset.authUser,
    });
    // Update PlanContext
    setPlan(preset.planId);
    setSubscriptionStatus('active');
    // Update DataContext user
    state.setCurrentUser(prev => prev ? {
      ...prev,
      id: preset.authUser.id,
      email: preset.authUser.email || '',
      displayName: preset.authUser.displayName || 'User',
      username: preset.authUser.username || 'user',
      avatar: preset.authUser.avatar || null,
      bio: preset.authUser.bio || '',
      location: preset.authUser.location || '',
      plan: preset.planId,
      eventCredits: preset.eventCredits,
      routeCredits: preset.routeCredits,
    } : prev);

    setActivePreset(preset.id);
    localStorage.setItem('revnet_dev_preset', preset.id);
    toast.success(`Switched to ${preset.label}`, { description: preset.description });
  };

  const resetMockData = () => {
    // Clear localStorage
    localStorage.removeItem('revnet_dev_preset');
    setActivePreset(null);
    toast.success('Mock data reset! Reload to take full effect.', {
      action: { label: 'Reload', onClick: () => window.location.reload() },
    });
  };

  const planColor: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-routes/10 text-routes',
    club: 'bg-clubs/10 text-clubs',
  };

  const testPublishToMap = () => {
    // Get user location or use default
    navigator.geolocation.getCurrentPosition(
      (pos) => createTestEvent(pos.coords.latitude, pos.coords.longitude),
      () => createTestEvent(51.5074, -0.1278),
      { timeout: 3000 },
    );
  };

  const createTestEvent = (lat: number, lng: number) => {
    eventsRepo.create({
      title: `Test Event ${Date.now().toString(36)}`,
      description: 'Auto-generated test event from Dev Tools',
      location: 'Current Location',
      lat,
      lng,
      date: new Date().toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      eventType: 'Meets',
      vehicleTypes: ['All Welcome'],
      visibility: 'public' as const,
      createdBy: state.currentUser?.id || 'dev',
      attendees: 0,
      isMultiDay: false,
      isRecurring: false,
      tags: ['meets'],
    });
    toast.success('Test event created at your location!', {
      description: 'Switch to Discovery → Events to see the pin.',
      action: { label: 'View Map', onClick: () => navigate('/', { state: { centerOn: { lat, lng }, category: 'events' } }) },
    });
  };

  // QA quick links
  const qaLinks = [
    { label: 'Add Event', route: '/add/event', color: 'text-events' },
    { label: 'Add Route', route: '/add/route', color: 'text-routes' },
    { label: 'Add Service', route: '/add/service', color: 'text-services' },
    { label: 'Add Club', route: '/add/club', color: 'text-clubs' },
    { label: 'Upgrade / Plans', route: '/upgrade', color: 'text-primary' },
    { label: 'Profile', route: '/profile', color: 'text-foreground' },
    { label: 'Settings', route: '/settings', color: 'text-foreground' },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-10 h-10 rounded-xl bg-muted/80 hover:bg-muted" />
          <FlaskConical className="w-5 h-5 text-amber-600" />
          <h1 className="text-lg font-bold text-foreground">Dev Tools</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 pb-28">

        {/* Current State */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">Current State</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Plan</span>
              <p className="font-bold text-foreground">{getPlanLabel(effectivePlan)}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Event Credits</span>
              <p className="font-bold text-foreground">{state.currentUser?.eventCredits ?? 0}{state.currentUser?.eventCredits === -1 ? ' (∞)' : ''}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Events</span>
              <p className="font-bold text-foreground">{state.events.length}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Routes</span>
              <p className="font-bold text-foreground">{state.routes.length}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Services</span>
              <p className="font-bold text-foreground">{state.services.length}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">User</span>
              <p className="font-bold text-foreground truncate">{authUser?.displayName || 'None'}</p>
            </div>
          </div>
        </SectionCard>

        {/* Switch User */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Switch User</h2>
          </div>
          <div className="space-y-2">
            {MOCK_USER_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => switchUser(preset)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  activePreset === preset.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${planColor[preset.planId]}`}>
                  {preset.planId === 'free' ? <User className="w-4 h-4" /> :
                   preset.planId === 'pro' ? <Crown className="w-4 h-4" /> :
                   <CreditCard className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{preset.description}</p>
                </div>
                {activePreset === preset.id && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">Active</Badge>
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* QA Quick Links */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-services" />
            <h2 className="text-sm font-bold text-foreground">QA Checklist</h2>
          </div>
          <div className="space-y-1">
            {qaLinks.map(link => (
              <button
                key={link.route}
                onClick={() => navigate(link.route)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <span className={`text-sm font-medium ${link.color}`}>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
          <Button
            onClick={testPublishToMap}
            className="w-full h-11 rounded-xl mt-3 gap-2 bg-events hover:bg-events/90 text-white"
          >
            <MapPin className="w-4 h-4" />
            Test Publish → Map Pin
          </Button>
        </SectionCard>

        {/* Reset */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-bold text-foreground">Danger Zone</h2>
          </div>
          <Button
            variant="outline"
            onClick={resetMockData}
            className="w-full h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All Mock Data
          </Button>
          <Button
            variant="outline"
            onClick={() => { logout(); navigate('/auth'); }}
            className="w-full h-11 rounded-xl mt-2 border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            Log Out & Reset Session
          </Button>
        </SectionCard>
      </div>
    </div>
  );
};

export default DevTools;
