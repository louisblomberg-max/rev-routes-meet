import { Sun, Moon, Monitor, Map, Navigation, Compass, Car, Bike, Database, Trash2 } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

const AppPreferencesSettings = () => {
  const navigate = useNavigate();

  // Appearance
  const [theme, setTheme] = useState('system');
  const [mapStyle, setMapStyle] = useState('standard');

  // Map & Discovery
  const [defaultView, setDefaultView] = useState('last-used');
  const [distanceUnits, setDistanceUnits] = useState('miles');
  const [autoRefreshMap, setAutoRefreshMap] = useState(true);
  const [showSelectedOnly, setShowSelectedOnly] = useState(true);

  // Navigation & Driving
  const [drivingMode, setDrivingMode] = useState('off');
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [routeRecalculation, setRouteRecalculation] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);

  // Content Preferences
  const [vehicleInterests, setVehicleInterests] = useState(['cars', 'motorbikes']);
  const [routeTypes, setRouteTypes] = useState(['scenic', 'twisties', 'coastal']);
  const [eventTypes, setEventTypes] = useState(['meets', 'shows', 'drive-outs']);

  // Storage & Performance
  const [dataSaver, setDataSaver] = useState(false);

  const handleVehicleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setVehicleInterests([...vehicleInterests, interest]);
    } else {
      setVehicleInterests(vehicleInterests.filter(i => i !== interest));
    }
  };

  const handleRouteTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setRouteTypes([...routeTypes, type]);
    } else {
      setRouteTypes(routeTypes.filter(t => t !== type));
    }
  };

  const handleEventTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setEventTypes([...eventTypes, type]);
    } else {
      setEventTypes(eventTypes.filter(t => t !== type));
    }
  };

  const handleClearCache = () => {
    toast({
      title: "Cache cleared",
      description: "Map cache and images have been cleared.",
    });
  };

  return (
    <div className="mobile-container bg-background min-h-screen pb-8">
      {/* Header */}
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
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          </div>

          {/* Theme */}
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Theme</span>
            <RadioGroup value={theme} onValueChange={setTheme} className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  Light
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Map Style */}
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Map style</span>
            <p className="text-xs text-muted-foreground mt-0.5">Choose how your map looks</p>
            <RadioGroup value={mapStyle} onValueChange={setMapStyle} className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="standard" id="map-standard" />
                <Label htmlFor="map-standard" className="text-sm font-normal cursor-pointer">Standard</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="clean" id="map-clean" />
                <Label htmlFor="map-clean" className="text-sm font-normal cursor-pointer">Clean</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="night" id="map-night" />
                <Label htmlFor="map-night" className="text-sm font-normal cursor-pointer">Night</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="satellite" id="map-satellite" />
                <Label htmlFor="map-satellite" className="text-sm font-normal cursor-pointer">Satellite</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* 2. Map & Discovery */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Map className="w-4 h-4 text-routes" />
            <h2 className="text-sm font-semibold text-foreground">Map & Discovery</h2>
          </div>

          {/* Default discovery view */}
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Default discovery view</span>
            <RadioGroup value={defaultView} onValueChange={setDefaultView} className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="last-used" id="view-last" />
                <Label htmlFor="view-last" className="text-sm font-normal cursor-pointer">Last used (recommended)</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="events" id="view-events" />
                <Label htmlFor="view-events" className="text-sm font-normal cursor-pointer">Meets & Events</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="routes" id="view-routes" />
                <Label htmlFor="view-routes" className="text-sm font-normal cursor-pointer">Routes</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="services" id="view-services" />
                <Label htmlFor="view-services" className="text-sm font-normal cursor-pointer">Services</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Distance units */}
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Distance units</span>
            <RadioGroup value={distanceUnits} onValueChange={setDistanceUnits} className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="miles" id="units-miles" />
                <Label htmlFor="units-miles" className="text-sm font-normal cursor-pointer">Miles (UK default)</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="km" id="units-km" />
                <Label htmlFor="units-km" className="text-sm font-normal cursor-pointer">Kilometres</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Toggles */}
          <div className="mt-5 pt-4 border-t border-border/30 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Auto-refresh map results</span>
                <Switch checked={autoRefreshMap} onCheckedChange={setAutoRefreshMap} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Update results as you move the map</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Show only selected categories</span>
                <Switch checked={showSelectedOnly} onCheckedChange={setShowSelectedOnly} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Only show pins for categories you've selected</p>
            </div>
          </div>
        </div>

        {/* 3. Navigation & Driving */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-4 h-4 text-events" />
            <h2 className="text-sm font-semibold text-foreground">Navigation & Driving</h2>
          </div>

          {/* Driving mode */}
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Driving mode</span>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between solo navigation and shared driving</p>
            <RadioGroup value={drivingMode} onValueChange={setDrivingMode} className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="off" id="drive-off" />
                <Label htmlFor="drive-off" className="text-sm font-normal cursor-pointer">Off</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="navigation" id="drive-nav" />
                <Label htmlFor="drive-nav" className="text-sm font-normal cursor-pointer">Navigation</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="group" id="drive-group" />
                <Label htmlFor="drive-group" className="text-sm font-normal cursor-pointer">Group drive</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Toggles */}
          <div className="mt-5 pt-4 border-t border-border/30 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Voice guidance</span>
                <Switch checked={voiceGuidance} onCheckedChange={setVoiceGuidance} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Spoken directions while navigating</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Route re-calculation</span>
                <Switch checked={routeRecalculation} onCheckedChange={setRouteRecalculation} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Automatically update route if you go off course</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Show traffic</span>
                <Switch checked={showTraffic} onCheckedChange={setShowTraffic} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Display live traffic on the map</p>
            </div>
          </div>
        </div>

        {/* 4. Content Preferences */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-clubs" />
            <h2 className="text-sm font-semibold text-foreground">Content Preferences</h2>
          </div>

          {/* Vehicle interest */}
          <div className="mt-4">
            <span className="text-sm font-medium text-foreground">Vehicle interest</span>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="vehicle-cars" 
                  checked={vehicleInterests.includes('cars')}
                  onCheckedChange={(checked) => handleVehicleInterestChange('cars', checked as boolean)}
                />
                <Label htmlFor="vehicle-cars" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  Cars
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="vehicle-bikes" 
                  checked={vehicleInterests.includes('motorbikes')}
                  onCheckedChange={(checked) => handleVehicleInterestChange('motorbikes', checked as boolean)}
                />
                <Label htmlFor="vehicle-bikes" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                  <Bike className="w-4 h-4 text-muted-foreground" />
                  Motorbikes
                </Label>
              </div>
            </div>
          </div>

          {/* Route types */}
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Route types shown</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['Scenic', 'Twisties', 'Coastal', 'Urban', 'Off-road', 'Track'].map((type) => {
                const typeValue = type.toLowerCase().replace('-', '');
                return (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox 
                      id={`route-${typeValue}`}
                      checked={routeTypes.includes(typeValue)}
                      onCheckedChange={(checked) => handleRouteTypeChange(typeValue, checked as boolean)}
                    />
                    <Label htmlFor={`route-${typeValue}`} className="text-sm font-normal cursor-pointer">{type}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event types */}
          <div className="mt-5 pt-4 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">Event types shown</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['Meets', 'Shows', 'Drive-outs', 'Track days', 'Club events'].map((type) => {
                const typeValue = type.toLowerCase().replace(' ', '-');
                return (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox 
                      id={`event-${typeValue}`}
                      checked={eventTypes.includes(typeValue)}
                      onCheckedChange={(checked) => handleEventTypeChange(typeValue, checked as boolean)}
                    />
                    <Label htmlFor={`event-${typeValue}`} className="text-sm font-normal cursor-pointer">{type}</Label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Storage & Performance */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-services" />
            <h2 className="text-sm font-semibold text-foreground">Storage & Performance</h2>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Data saver mode</span>
                <Switch checked={dataSaver} onCheckedChange={setDataSaver} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Reduce image quality and map refresh rate</p>
            </div>

            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Trash2 className="w-4 h-4" />
                    Clear map cache
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear cached maps and images?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all cached map tiles and images from your device. They will be re-downloaded as needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearCache}>Clear cache</AlertDialogAction>
                  </AlertDialogFooter>
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
