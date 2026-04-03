import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Map, Navigation, Compass, Car, Bike, Database, Trash2, AlertCircle, RotateCcw } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AppPreferencesSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState(localStorage.getItem('revnet-theme') || 'system');
  const [mapStyle, setMapStyle] = useState('standard');
  const [defaultView, setDefaultView] = useState('last_used');
  const [distanceUnits, setDistanceUnits] = useState('miles');
  const [autoRefreshMap, setAutoRefreshMap] = useState(true);
  const [showSelectedOnly, setShowSelectedOnly] = useState(true);
  const [drivingMode, setDrivingMode] = useState('off');
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [routeRecalculation, setRouteRecalculation] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [vehicleInterests, setVehicleInterests] = useState<string[]>(['cars', 'motorbikes']);
  const [routeTypes, setRouteTypes] = useState<string[]>(['scenic', 'twisties', 'coastal']);
  const [eventTypes, setEventTypes] = useState<string[]>(['meets', 'shows', 'drive_outs']);
  const [dataSaver, setDataSaver] = useState(false);

  const fetchPrefs = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single();
    if (err) { setError(err.message); setIsLoading(false); return; }
    if (data) {
      setTheme(data.theme || 'system');
      setMapStyle(data.map_style || 'standard');
      setDefaultView(data.default_discovery_view || 'last_used');
      setDistanceUnits(data.distance_units || 'miles');
      setAutoRefreshMap(data.auto_refresh_map ?? true);
      setShowSelectedOnly(data.show_only_selected_categories ?? true);
      setDrivingMode(data.driving_mode || 'off');
      setVoiceGuidance(data.voice_guidance ?? true);
      setRouteRecalculation(data.route_recalculation ?? true);
      setShowTraffic(data.show_traffic ?? true);
      setVehicleInterests(data.vehicle_interests || ['cars', 'motorbikes']);
      setRouteTypes(data.route_types_shown || ['scenic', 'twisties', 'coastal']);
      setEventTypes(data.event_types_shown || ['meets', 'shows', 'drive_outs']);
      setDataSaver(data.data_saver_mode ?? false);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchPrefs(); }, [user?.id]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
    localStorage.setItem('revnet-theme', theme);
  }, [theme]);

  const update = async (field: string, value: unknown) => {
    if (!user?.id) return;
    await supabase.from('user_preferences').update({ [field]: value }).eq('user_id', user.id);
  };

  const handleTheme = (v: string) => { setTheme(v); update('theme', v); };
  const handleMapStyle = (v: string) => { setMapStyle(v); update('map_style', v); };
  const handleDefaultView = (v: string) => { setDefaultView(v); update('default_discovery_view', v); };
  const handleDistanceUnits = (v: string) => { setDistanceUnits(v); update('distance_units', v); };
  const handleAutoRefresh = (v: boolean) => { setAutoRefreshMap(v); update('auto_refresh_map', v); };
  const handleShowSelected = (v: boolean) => { setShowSelectedOnly(v); update('show_only_selected_categories', v); };
  const handleDrivingMode = (v: string) => { setDrivingMode(v); update('driving_mode', v); };
  const handleVoice = (v: boolean) => { setVoiceGuidance(v); update('voice_guidance', v); };
  const handleRouteRecalc = (v: boolean) => { setRouteRecalculation(v); update('route_recalculation', v); };
  const handleTraffic = (v: boolean) => { setShowTraffic(v); update('show_traffic', v); };
  const handleDataSaver = (v: boolean) => { setDataSaver(v); update('data_saver_mode', v); };

  const handleVehicleInterestChange = (interest: string, checked: boolean) => {
    const next = checked ? [...vehicleInterests, interest] : vehicleInterests.filter(i => i !== interest);
    setVehicleInterests(next);
    update('vehicle_interests', next);
  };
  const handleRouteTypeChange = (type: string, checked: boolean) => {
    const next = checked ? [...routeTypes, type] : routeTypes.filter(t => t !== type);
    setRouteTypes(next);
    update('route_types_shown', next);
  };
  const handleEventTypeChange = (type: string, checked: boolean) => {
    const next = checked ? [...eventTypes, type] : eventTypes.filter(t => t !== type);
    setEventTypes(next);
    update('event_types_shown', next);
  };

  const handleClearCache = () => { toast.success('Map cache cleared successfully'); };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen pb-8">
        <div className="px-4 pt-4 pb-2 safe-top">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
            <div><h1 className="text-lg font-bold text-foreground">App Preferences</h1></div>
          </div>
        </div>
        <div className="px-4 pt-3 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border/30 p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-container bg-background min-h-screen pb-8">
        <div className="px-4 pt-4 pb-2 safe-top">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
            <div><h1 className="text-lg font-bold text-foreground">App Preferences</h1></div>
          </div>
        </div>
        <div className="px-4 pt-8">
          <div className="bg-card rounded-xl border border-border/30 p-6 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPrefs} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen pb-8">
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
          <div>
            <h1 className="text-lg font-bold text-foreground">App Preferences</h1>
            <p className="text-xs text-muted-foreground">Customize how RevNet looks and behaves</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-4">
        {/* 1. Appearance */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1"><Sun className="w-4 h-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Appearance</h2></div>
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Theme</span>
            <RadioGroup value={theme} onValueChange={handleTheme} className="mt-2 space-y-2">
              <div className="flex items-center gap-3"><RadioGroupItem value="light" id="theme-light" /><Label htmlFor="theme-light" className="flex items-center gap-2 text-sm font-normal cursor-pointer"><Sun className="w-4 h-4 text-muted-foreground" />Light</Label></div>
              <div className="flex items-center gap-3"><RadioGroupItem value="dark" id="theme-dark" /><Label htmlFor="theme-dark" className="flex items-center gap-2 text-sm font-normal cursor-pointer"><Moon className="w-4 h-4 text-muted-foreground" />Dark</Label></div>
              <div className="flex items-center gap-3"><RadioGroupItem value="system" id="theme-system" /><Label htmlFor="theme-system" className="flex items-center gap-2 text-sm font-normal cursor-pointer"><Monitor className="w-4 h-4 text-muted-foreground" />System</Label></div>
            </RadioGroup>
          </div>
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Map style</span>
            <p className="text-xs text-muted-foreground mt-0.5">Choose how your map looks</p>
            <RadioGroup value={mapStyle} onValueChange={handleMapStyle} className="mt-2 space-y-2">
              {['standard', 'clean', 'night', 'satellite'].map(v => (
                <div key={v} className="flex items-center gap-3"><RadioGroupItem value={v} id={`map-${v}`} /><Label htmlFor={`map-${v}`} className="text-sm font-normal cursor-pointer capitalize">{v}</Label></div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* 2. Map & Discovery */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1"><Map className="w-4 h-4 text-routes" /><h2 className="text-sm font-semibold text-foreground">Map & Discovery</h2></div>
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Default discovery view</span>
            <RadioGroup value={defaultView} onValueChange={handleDefaultView} className="mt-2 space-y-2">
              {[{ v: 'last_used', l: 'Last used (recommended)' }, { v: 'events', l: 'Meets & Events' }, { v: 'routes', l: 'Routes' }, { v: 'services', l: 'Services' }].map(o => (
                <div key={o.v} className="flex items-center gap-3"><RadioGroupItem value={o.v} id={`view-${o.v}`} /><Label htmlFor={`view-${o.v}`} className="text-sm font-normal cursor-pointer">{o.l}</Label></div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Distance units</span>
            <RadioGroup value={distanceUnits} onValueChange={handleDistanceUnits} className="mt-2 space-y-2">
              <div className="flex items-center gap-3"><RadioGroupItem value="miles" id="units-miles" /><Label htmlFor="units-miles" className="text-sm font-normal cursor-pointer">Miles (UK default)</Label></div>
              <div className="flex items-center gap-3"><RadioGroupItem value="km" id="units-km" /><Label htmlFor="units-km" className="text-sm font-normal cursor-pointer">Kilometres</Label></div>
            </RadioGroup>
          </div>
          <div className="mt-5 pt-4 border-t border-border/30 space-y-4">
            <div><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">Auto-refresh map results</span><Switch checked={autoRefreshMap} onCheckedChange={handleAutoRefresh} /></div><p className="text-xs text-muted-foreground mt-0.5">Update results as you move the map</p></div>
            <div><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">Show only selected categories</span><Switch checked={showSelectedOnly} onCheckedChange={handleShowSelected} /></div><p className="text-xs text-muted-foreground mt-0.5">Only show pins for categories you've selected</p></div>
          </div>
        </div>

        {/* 3. Navigation & Driving */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1"><Navigation className="w-4 h-4 text-events" /><h2 className="text-sm font-semibold text-foreground">Navigation & Driving</h2></div>
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Driving mode</span>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between solo navigation and shared driving</p>
            <RadioGroup value={drivingMode} onValueChange={handleDrivingMode} className="mt-2 space-y-2">
              {['off', 'navigation', 'group'].map(v => (
                <div key={v} className="flex items-center gap-3"><RadioGroupItem value={v} id={`drive-${v}`} /><Label htmlFor={`drive-${v}`} className="text-sm font-normal cursor-pointer capitalize">{v === 'group' ? 'Group drive' : v === 'navigation' ? 'Navigation' : 'Off'}</Label></div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-5 pt-4 border-t border-border/30 space-y-4">
            <div><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">Voice guidance</span><Switch checked={voiceGuidance} onCheckedChange={handleVoice} /></div><p className="text-xs text-muted-foreground mt-0.5">Spoken directions while navigating</p></div>
            <div><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">Route re-calculation</span><Switch checked={routeRecalculation} onCheckedChange={handleRouteRecalc} /></div><p className="text-xs text-muted-foreground mt-0.5">Automatically update route if you go off course</p></div>
            <div><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">Show traffic</span><Switch checked={showTraffic} onCheckedChange={handleTraffic} /></div><p className="text-xs text-muted-foreground mt-0.5">Display live traffic on the map</p></div>
          </div>
        </div>

        {/* 4. Content Preferences */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1"><Compass className="w-4 h-4 text-clubs" /><h2 className="text-sm font-semibold text-foreground">Content Preferences</h2></div>
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Vehicle interest</span>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-3"><Checkbox id="vehicle-cars" checked={vehicleInterests.includes('cars')} onCheckedChange={(c) => handleVehicleInterestChange('cars', c as boolean)} /><Label htmlFor="vehicle-cars" className="flex items-center gap-2 text-sm font-normal cursor-pointer"><Car className="w-4 h-4 text-muted-foreground" />Cars</Label></div>
              <div className="flex items-center gap-3"><Checkbox id="vehicle-bikes" checked={vehicleInterests.includes('motorbikes')} onCheckedChange={(c) => handleVehicleInterestChange('motorbikes', c as boolean)} /><Label htmlFor="vehicle-bikes" className="flex items-center gap-2 text-sm font-normal cursor-pointer"><Bike className="w-4 h-4 text-muted-foreground" />Motorbikes</Label></div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Route types shown</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['scenic', 'twisties', 'coastal', 'urban', 'off_road', 'track'].map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox id={`route-${type}`} checked={routeTypes.includes(type)} onCheckedChange={(c) => handleRouteTypeChange(type, c as boolean)} />
                  <Label htmlFor={`route-${type}`} className="text-sm font-normal cursor-pointer capitalize">{type.replace('_', '-')}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Event types shown</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['meets', 'shows', 'drive_outs', 'track_days', 'club_events'].map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox id={`event-${type}`} checked={eventTypes.includes(type)} onCheckedChange={(c) => handleEventTypeChange(type, c as boolean)} />
                  <Label htmlFor={`event-${type}`} className="text-sm font-normal cursor-pointer capitalize">{type.replace('_', ' ')}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Storage */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1"><Database className="w-4 h-4 text-services" /><h2 className="text-sm font-semibold text-foreground">Storage & Performance</h2></div>
          <div className="mt-4 space-y-4">
            <div><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">Data saver mode</span><Switch checked={dataSaver} onCheckedChange={handleDataSaver} /></div><p className="text-xs text-muted-foreground mt-0.5">Reduce image quality and map refresh rate</p></div>
            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline" className="w-full justify-start gap-2"><Trash2 className="w-4 h-4" />Clear map cache</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Clear cached maps and images?</AlertDialogTitle><AlertDialogDescription>This will clear all cached map tiles and images. They will be re-downloaded as needed.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearCache}>Clear Cache</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPreferencesSettings;
