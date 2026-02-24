/**
 * Edit & Publish Route screen — form to add metadata before publishing.
 */
import { useState } from 'react';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatRouteDistance, formatRouteDuration } from '@/services/routeService';
import type { DraftRoute } from '@/services/routeService';
import { toast } from 'sonner';

const ROUTE_TYPES = ['Scenic', 'Coastal', 'Off-road', 'Twisties', 'Urban', 'Track'];
const VEHICLE_TYPES = ['Cars', 'Motorcycles'];
const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const VISIBILITY_OPTIONS = ['Public', 'Friends', 'Club Only', 'Private'];

export interface PublishRouteData {
  name: string;
  description: string;
  vehicleTypes: string[];
  routeTypes: string[];
  difficulty: string;
  visibility: string;
  photos: string[];
  bestTime?: string;
  notes?: string;
  draft: DraftRoute;
}

interface Props {
  draft: DraftRoute;
  onPublish: (data: PublishRouteData) => void;
  onSaveDraft: (data: PublishRouteData) => void;
  onBack: () => void;
}

const EditPublishRoute = ({ draft, onPublish, onSaveDraft, onBack }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [routeTypes, setRouteTypes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [photos, setPhotos] = useState<string[]>([]);
  const [bestTime, setBestTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMulti = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Route name is required';
    if (routeTypes.length === 0) errs.routeTypes = 'Select at least one type';
    if (vehicleTypes.length === 0) errs.vehicleTypes = 'Select vehicle type';
    // Ensure draft has valid coordinates
    if (!draft?.geometry?.coordinates || draft.geometry.coordinates.length < 2) {
      errs.draft = 'Route must have at least 2 points';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildData = (): PublishRouteData => ({
    name, description, vehicleTypes, routeTypes, difficulty, visibility, photos, bestTime, notes, draft,
  });

  const handlePublish = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    onPublish(buildData());
  };

  const handleSaveDraft = () => {
    onSaveDraft(buildData());
  };

  const handleAddPhoto = () => {
    if (photos.length >= 5) { toast.info('Maximum 5 photos'); return; }
    toast.info('Photo upload will connect to storage');
    setPhotos(prev => [...prev, `photo-${prev.length + 1}`]);
  };

  const Chips = ({ items, selected, onToggle, multi = false, error }: {
    items: string[]; selected: string | string[]; onToggle: (v: string) => void; multi?: boolean; error?: string;
  }) => (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const isActive = multi ? (selected as string[]).includes(item) : selected === item;
          return (
            <button key={item} onClick={() => onToggle(item)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                isActive ? 'border-routes bg-routes/10 text-routes' : 'border-border hover:border-routes/50'
              }`}>
              {item}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Edit & Publish Route</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-8">
        {/* Route Stats */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-xl">
          <div><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Distance</p><p className="text-base font-bold text-foreground">{formatRouteDistance(draft?.distance ?? 0)}</p></div>
          <div><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Duration</p><p className="text-base font-bold text-foreground">{formatRouteDuration(draft?.duration ?? 0)}</p></div>
          <div><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Start</p><p className="text-xs text-foreground">{(draft?.startLat ?? 0).toFixed(4)}, {(draft?.startLng ?? 0).toFixed(4)}</p></div>
          <div><p className="text-[10px] uppercase text-muted-foreground tracking-wider">End</p><p className="text-xs text-foreground">{(draft?.endLat ?? 0).toFixed(4)}, {(draft?.endLng ?? 0).toFixed(4)}</p></div>
        </div>
        {errors.draft && <p className="text-xs text-destructive">{errors.draft}</p>}

        {/* Photos */}
        <div className="space-y-2">
          <Label>Photos</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((_, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button onClick={handleAddPhoto} className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex-shrink-0 flex flex-col items-center justify-center gap-1 hover:border-routes/50 transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="routeName">Route Name *</Label>
          <Input id="routeName" placeholder="e.g. South Downs Scenic" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Describe the route, highlights, tips..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        {/* Vehicle Types */}
        <div className="space-y-2">
          <Label>Vehicle Types *</Label>
          <Chips items={VEHICLE_TYPES} selected={vehicleTypes} onToggle={v => toggleMulti(vehicleTypes, v, setVehicleTypes)} multi error={errors.vehicleTypes} />
        </div>

        {/* Route Types */}
        <div className="space-y-2">
          <Label>Route Type *</Label>
          <Chips items={ROUTE_TYPES} selected={routeTypes} onToggle={v => toggleMulti(routeTypes, v, setRouteTypes)} multi error={errors.routeTypes} />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Chips items={DIFFICULTY_LEVELS} selected={difficulty} onToggle={setDifficulty} />
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <Label>Visibility</Label>
          <Chips items={VISIBILITY_OPTIONS} selected={visibility} onToggle={setVisibility} />
        </div>

        {/* Best Time */}
        <div className="space-y-2">
          <Label>Best Time to Drive</Label>
          <Input placeholder="e.g. Early morning, sunset" value={bestTime} onChange={e => setBestTime(e.target.value)} />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea placeholder="Additional notes..." rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft} className="flex-1 h-12 font-semibold">
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isSubmitting} className="flex-1 bg-routes hover:bg-routes/90 text-routes-foreground h-12 font-semibold">
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditPublishRoute;
