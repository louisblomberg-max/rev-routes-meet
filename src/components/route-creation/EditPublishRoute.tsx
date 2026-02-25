/**
 * Edit & Publish Route — premium SectionCard layout matching Add Event/Service.
 */
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, X, Route, Car, Mountain, Eye, Globe, Users, UsersRound, Lock, MapPin, ImagePlus, AlertTriangle, Layers, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRouteDistance, formatRouteDuration, reverseGeocode } from '@/services/routeService';
import type { RouteDraft, PublishRouteFormData, RouteVisibility } from '@/models/route';
import { toast } from 'sonner';
import { mockClubs } from '@/data/mockData';

const VEHICLE_TYPES = ['Cars', 'Motorcycles'];
const ROUTE_TYPES = ['Scenic', 'Coastal', 'Off-road', 'Twisties', 'Urban', 'Track'];
const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const SURFACE_TYPES = ['Tarmac', 'Gravel', 'Mixed', 'Dirt'];
const SAFETY_TAGS = ['Narrow roads', 'Low-car warning', 'Avoid at night', 'High traffic', 'Seasonal closures risk'];

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: 'Public', description: 'Visible to everyone', icon: Globe },
  { value: 'friends' as const, label: 'Friends', description: 'Visible to friends', icon: Users },
  { value: 'club' as const, label: 'Club Only', description: 'Choose a club', icon: UsersRound },
  { value: 'private' as const, label: 'Private', description: 'Only me', icon: Lock },
];

// ── Shared layout components (matching Add Event) ──
const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-card p-5 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-xl bg-routes/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-routes" />
    </div>
    <h2 className="text-base font-bold text-foreground">{children}</h2>
  </div>
);

interface Props {
  draft: RouteDraft;
  onPublish: (data: PublishRouteFormData) => void;
  onSaveDraft: (data: PublishRouteFormData) => void;
  onBack: () => void;
}

const EditPublishRoute = ({ draft, onPublish, onSaveDraft, onBack }: Props) => {
  const [name, setName] = useState(draft.name || '');
  const [description, setDescription] = useState(draft.description || '');
  const [bestTime, setBestTime] = useState(draft.bestTime || '');
  const [tips, setTips] = useState(draft.tips || '');
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(draft.vehicleTypes || []);
  const [routeType, setRouteType] = useState(draft.routeType || '');
  const [difficulty, setDifficulty] = useState(draft.difficulty || '');
  const [surfaceType, setSurfaceType] = useState(draft.surfaceType || '');
  const [safetyTags, setSafetyTags] = useState<string[]>(draft.safetyTags || []);
  const [visibility, setVisibility] = useState<RouteVisibility>(
    draft.visibility || { level: 'public' }
  );
  const [photos, setPhotos] = useState<string[]>(draft.media?.photoUrls || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startLabel, setStartLabel] = useState('');
  const [endLabel, setEndLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reverse geocode start/end
  useEffect(() => {
    reverseGeocode(draft.startLng, draft.startLat).then(setStartLabel);
    reverseGeocode(draft.endLng, draft.endLat).then(setEndLabel);
  }, [draft.startLat, draft.startLng, draft.endLat, draft.endLng]);

  const toggleChip = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Route name is required';
    if (!routeType) errs.routeType = 'Select a route type';
    // Vehicle types are optional — user can select both, one, or none
    if (visibility.level === 'club' && !visibility.clubId) errs.club = 'Select a club';
    if (!draft.geometry?.coordinates || draft.geometry.coordinates.length < 2) errs.draft = 'Route must have at least 2 points';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildData = (): PublishRouteFormData => ({
    name, description, bestTime, tips,
    vehicleTypeMode: vehicleTypes.length > 0 ? 'selected' : 'all', vehicleTypes,
    routeType, difficulty, surfaceType, safetyTags,
    visibility, photos, draft,
  });

  const handlePublish = () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    onPublish(buildData());
  };

  const handleSaveDraft = () => onSaveDraft(buildData());

  const handleAddPhoto = () => {
    if (photos.length >= 5) { toast.info('Maximum 5 photos'); return; }
    toast.info('Photo upload will connect to storage');
    setPhotos(prev => [...prev, `photo-${prev.length + 1}`]);
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Edit & Publish Route</h1>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={() => handleAddPhoto()} />

      <div className="px-4 py-6 space-y-6 pb-28">

        {/* ── ROUTE OVERVIEW ── */}
        <SectionCard>
          <SectionTitle icon={Compass}>Route Overview</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-xl bg-muted/40">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">Distance</p>
              <p className="text-lg font-bold text-foreground">{formatRouteDistance(draft.stats.distanceMeters)}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">Duration</p>
              <p className="text-lg font-bold text-foreground">{formatRouteDuration(draft.stats.durationSeconds)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
              <MapPin className="w-3.5 h-3.5 text-services flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">Start</p>
                <p className="text-xs text-foreground truncate">{startLabel || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
              <MapPin className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">End</p>
                <p className="text-xs text-foreground truncate">{endLabel || 'Loading...'}</p>
              </div>
            </div>
          </div>
          {errors.draft && <p className="text-xs text-destructive mt-2">{errors.draft}</p>}
        </SectionCard>

        {/* ── PHOTOS ── */}
        <SectionCard>
          <SectionTitle icon={Camera}>Photos</SectionTitle>
          <Label className="text-xs text-muted-foreground mb-2 block">Up to 5 photos</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((_, i) => (
              <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-border/50 bg-muted flex items-center justify-center">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button onClick={handleAddPhoto} className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex-shrink-0 flex flex-col items-center justify-center gap-1.5 hover:border-routes/50 transition-colors bg-muted/30">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        </SectionCard>

        {/* ── ROUTE INFO ── */}
        <SectionCard>
          <SectionTitle icon={Route}>Route Info</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="routeName" className="text-xs text-muted-foreground">Route Name *</Label>
              <Input id="routeName" placeholder="e.g. South Downs Scenic" value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                className="rounded-xl h-11" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="routeDesc" className="text-xs text-muted-foreground">Description</Label>
              <Textarea id="routeDesc" placeholder="Describe the route, highlights, stops..." rows={3} value={description}
                onChange={e => setDescription(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bestTime" className="text-xs text-muted-foreground">Best Time to Drive</Label>
              <Input id="bestTime" placeholder="e.g. Early morning, sunset" value={bestTime}
                onChange={e => setBestTime(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tips" className="text-xs text-muted-foreground">Tips / Hazards</Label>
              <Textarea id="tips" placeholder="Any warnings or tips for this route..." rows={2} value={tips}
                onChange={e => setTips(e.target.value)} className="rounded-xl" />
            </div>
          </div>
        </SectionCard>

        {/* ── VEHICLE TYPES ── */}
        <SectionCard>
          <SectionTitle icon={Car}>Vehicle Types</SectionTitle>
          <p className="text-xs text-muted-foreground mb-3">Select one, both, or none</p>
          <div className="flex gap-2">
            {VEHICLE_TYPES.map(type => (
              <button key={type} onClick={() => toggleChip(vehicleTypes, setVehicleTypes, type)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  vehicleTypes.includes(type)
                    ? 'bg-routes text-routes-foreground border-routes shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-routes/40'
                }`}>
                {type}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── ROUTE TYPE ── */}
        <SectionCard>
          <SectionTitle icon={Route}>Route Type</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {ROUTE_TYPES.map(type => (
              <button key={type} onClick={() => { setRouteType(type); setErrors(p => ({ ...p, routeType: '' })); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  routeType === type
                    ? 'bg-routes text-routes-foreground border-routes shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-routes/40'
                }`}>
                {type}
              </button>
            ))}
          </div>
          {errors.routeType && <p className="text-xs text-destructive mt-2">{errors.routeType}</p>}
        </SectionCard>

        {/* ── DIFFICULTY ── */}
        <SectionCard>
          <SectionTitle icon={Mountain}>Difficulty</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_LEVELS.map(level => (
              <button key={level} onClick={() => setDifficulty(level)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  difficulty === level
                    ? 'bg-routes text-routes-foreground border-routes shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-routes/40'
                }`}>
                {level}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── SURFACE TYPE ── */}
        <SectionCard>
          <SectionTitle icon={Layers}>Surface Type</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {SURFACE_TYPES.map(type => (
              <button key={type} onClick={() => setSurfaceType(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  surfaceType === type
                    ? 'bg-routes text-routes-foreground border-routes shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-routes/40'
                }`}>
                {type}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── VISIBILITY ── */}
        <SectionCard>
          <SectionTitle icon={Eye}>Visibility</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {VISIBILITY_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setVisibility({ level: opt.value, ...(opt.value !== 'club' ? {} : { clubId: visibility.clubId, clubName: visibility.clubName }) });
                    if (opt.value !== 'club') setVisibility({ level: opt.value });
                    setErrors(p => ({ ...p, club: '' }));
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200 border ${
                    visibility.level === opt.value
                      ? 'bg-routes/10 border-routes shadow-sm'
                      : 'bg-muted/30 border-border/50 hover:border-routes/40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    visibility.level === opt.value ? 'bg-routes text-routes-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${visibility.level === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {visibility.level === 'club' && (
            <div className="mt-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Choose Club *</Label>
              <Select value={visibility.clubId || ''} onValueChange={(v) => {
                const club = mockClubs.find(c => c.id === v);
                setVisibility({ level: 'club', clubId: v, clubName: club?.name });
                setErrors(p => ({ ...p, club: '' }));
              }}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {mockClubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.club && <p className="text-xs text-destructive mt-1">{errors.club}</p>}
            </div>
          )}
        </SectionCard>

        {/* ── SAFETY TAGS ── */}
        <SectionCard>
          <SectionTitle icon={AlertTriangle}>Safety Tags</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {SAFETY_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleChip(safetyTags, setSafetyTags, tag)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  safetyTags.includes(tag)
                    ? 'bg-amber-500/15 text-amber-700 border-amber-500/40 shadow-sm dark:text-amber-400'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-amber-500/40'
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── STICKY SUBMIT ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background to-background/0">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft} className="flex-1 h-12 font-semibold rounded-2xl">
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={isSubmitting}
              className="flex-1 bg-routes hover:bg-routes/90 text-routes-foreground h-12 font-semibold rounded-2xl shadow-elevated">
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPublishRoute;
