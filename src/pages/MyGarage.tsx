import { useState } from 'react';
import {
  Car, Bike, Plus, ChevronDown, ChevronUp, Eye, Users, Lock,
  Wrench, Settings, Star, Trash2, X, Sparkles, Tag, Check,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useGarage, useUserPreferences } from '@/contexts/GarageContext';
import {
  ENTHUSIAST_TAGS, TRANSMISSION_OPTIONS, DRIVETRAIN_OPTIONS,
  getRecommendationBullets,
} from '@/models/garage';
import type { GarageVehicle } from '@/models/garage';

const VIS_CONFIG = {
  public: { icon: Eye, label: 'Public' },
  friends: { icon: Users, label: 'Friends' },
  private: { icon: Lock, label: 'Private' },
} as const;

const MyGarage = () => {
  const navigate = useNavigate();
  const {
    vehicles, primaryVehicle, isLoading,
    addVehicle, updateVehicle, deleteVehicle, setPrimaryVehicle,
  } = useGarage();
  const { preferences, updatePreferences } = useUserPreferences();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  // Add vehicle form state
  const [form, setForm] = useState({
    vehicleType: 'car' as 'car' | 'motorcycle',
    make: '', model: '', year: '', trim: '', engine: '',
    transmission: '', drivetrain: '', colour: '', mileage: '',
    tags: [] as string[], modsText: '',
    visibility: 'public' as 'public' | 'friends' | 'private',
    isPrimary: false,
  });

  const resetForm = () => setForm({
    vehicleType: 'car', make: '', model: '', year: '', trim: '', engine: '',
    transmission: '', drivetrain: '', colour: '', mileage: '',
    tags: [], modsText: '', visibility: 'public', isPrimary: false,
  });

  const toggleFormTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleAdd = () => {
    if (!form.make.trim()) { toast.error('Make is required'); return; }
    addVehicle({
      userId: '',
      vehicleType: form.vehicleType,
      make: form.make, model: form.model,
      year: form.year ? parseInt(form.year) : undefined,
      trim: form.trim || undefined,
      engine: form.engine || undefined,
      transmission: (form.transmission || undefined) as GarageVehicle['transmission'],
      drivetrain: (form.drivetrain || undefined) as GarageVehicle['drivetrain'],
      colour: form.colour || undefined,
      mileage: form.mileage ? parseInt(form.mileage) : undefined,
      tags: form.tags,
      modsText: form.modsText || undefined,
      photos: [],
      visibility: form.visibility,
      isPrimary: form.isPrimary || vehicles.length === 0,
    });
    setIsAddOpen(false);
    resetForm();
    toast.success('Vehicle added to your garage!');
  };

  const handleDelete = (id: string) => {
    deleteVehicle(id);
    toast.success('Vehicle removed');
  };

  const recBullets = getRecommendationBullets(vehicles, preferences.styleTags, preferences.vehicleTypes);

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" />
            <div>
              <h1 className="text-lg font-bold text-foreground">My Garage</h1>
              <p className="text-xs text-muted-foreground">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 rounded-lg">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
        {/* Loading */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No vehicles yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first vehicle to show off your ride</p>
            <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Vehicle
            </Button>
          </div>
        ) : (
          <>
            {/* Primary vehicle first, then others */}
            {[...vehicles].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map(vehicle => {
              const VIcon = vehicle.vehicleType === 'car' ? Car : Bike;
              const VisIcon = VIS_CONFIG[vehicle.visibility].icon;
              const isExpanded = expandedId === vehicle.id;

              return (
                <div key={vehicle.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${vehicle.isPrimary ? 'border-primary/30' : 'border-border/50'}`}>
                  {vehicle.isPrimary && (
                    <div className="bg-primary/5 px-4 py-1.5 border-b border-primary/10 flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Primary Vehicle</span>
                    </div>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : vehicle.id)}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${vehicle.isPrimary ? 'bg-primary/10' : 'bg-muted/80'}`}>
                      <VIcon className={`w-7 h-7 ${vehicle.isPrimary ? 'text-primary' : 'text-foreground/70'}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="font-bold text-foreground truncate block">
                        {vehicle.year ? `${vehicle.year} ` : ''}{vehicle.make} {vehicle.model}
                      </span>
                      {vehicle.trim && <p className="text-xs text-muted-foreground truncate mt-0.5">{vehicle.trim}</p>}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge variant="outline" className="gap-1 text-[10px] py-0 h-5">
                          <VisIcon className="w-2.5 h-2.5" /> {VIS_CONFIG[vehicle.visibility].label}
                        </Badge>
                        {vehicle.tags.length > 0 && (
                          <Badge variant="secondary" className="text-[10px] py-0 h-5">
                            <Tag className="w-2 h-2 mr-0.5" />{vehicle.tags.length} tags
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground/50 shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground/50 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/20 space-y-3">
                      {/* Details */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {vehicle.engine && <div><span className="text-muted-foreground">Engine:</span> <span className="text-foreground font-medium">{vehicle.engine}</span></div>}
                        {vehicle.transmission && <div><span className="text-muted-foreground">Trans:</span> <span className="text-foreground font-medium capitalize">{vehicle.transmission}</span></div>}
                        {vehicle.drivetrain && <div><span className="text-muted-foreground">Drivetrain:</span> <span className="text-foreground font-medium uppercase">{vehicle.drivetrain}</span></div>}
                        {vehicle.colour && <div><span className="text-muted-foreground">Colour:</span> <span className="text-foreground font-medium">{vehicle.colour}</span></div>}
                        {vehicle.mileage && <div><span className="text-muted-foreground">Mileage:</span> <span className="text-foreground font-medium">{vehicle.mileage.toLocaleString()}</span></div>}
                      </div>

                      {vehicle.tags.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1.5"><Tag className="w-3 h-3" /> Tags</div>
                          <div className="flex flex-wrap gap-1.5">
                            {vehicle.tags.map((tag, i) => <Badge key={i} variant="secondary" className="text-xs font-normal">{tag}</Badge>)}
                          </div>
                        </div>
                      )}

                      {vehicle.modsText && (
                        <div>
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1.5"><Wrench className="w-3 h-3" /> Modifications</div>
                          <p className="text-sm text-foreground/80 bg-background/50 rounded-lg p-3">{vehicle.modsText}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {!vehicle.isPrimary && (
                          <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => { setPrimaryVehicle(vehicle.id); toast.success('Set as primary'); }}>
                            <Star className="w-3 h-3 mr-1" /> Set Primary
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Preferences Summary */}
        <div className="mt-4">
          <button
            onClick={() => setShowPrefs(!showPrefs)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card rounded-2xl border border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Preferences</span>
            </div>
            {showPrefs ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showPrefs && (
            <div className="mt-2 bg-card rounded-2xl border border-border/50 p-4 space-y-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Vehicle Types</span>
                <div className="flex gap-1.5 mt-1">
                  {preferences.vehicleTypes.length > 0
                    ? preferences.vehicleTypes.map(t => <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>)
                    : <span className="text-xs text-muted-foreground/60">Not set</span>
                  }
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Style Tags</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {preferences.styleTags.length > 0
                    ? preferences.styleTags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)
                    : <span className="text-xs text-muted-foreground/60">Not set</span>
                  }
                </div>
              </div>

              {/* Recommendation preview */}
              {recBullets.length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">Recommendations based on your garage:</span>
                  </div>
                  <ul className="space-y-1">
                    {recBullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/onboarding/vehicle')}
              >
                Edit Preferences
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Vehicle Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
          <SheetHeader className="pb-4 border-b border-border/30">
            <SheetTitle className="text-lg font-bold">Add Vehicle</SheetTitle>
          </SheetHeader>
          <div className="py-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Type */}
            <div className="grid grid-cols-2 gap-3">
              {(['car', 'motorcycle'] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, vehicleType: t }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${form.vehicleType === t ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}>
                  {t === 'car' ? <Car className={`w-6 h-6 ${form.vehicleType === t ? 'text-primary' : 'text-muted-foreground'}`} /> : <Bike className={`w-6 h-6 ${form.vehicleType === t ? 'text-primary' : 'text-muted-foreground'}`} />}
                  <span className={`font-semibold ${form.vehicleType === t ? 'text-primary' : 'text-foreground'}`}>{t === 'car' ? 'Car' : 'Motorcycle'}</span>
                </button>
              ))}
            </div>

            {/* Required */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-medium">Make *</Label><Input placeholder="e.g. BMW" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Model</Label><Input placeholder="e.g. M3" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-medium">Year</Label><Input type="number" placeholder="2024" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Trim</Label><Input placeholder="M Sport" value={form.trim} onChange={e => setForm(f => ({ ...f, trim: e.target.value }))} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Engine</Label><Input placeholder="3.0L" value={form.engine} onChange={e => setForm(f => ({ ...f, engine: e.target.value }))} className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Transmission</Label>
                <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))} className="w-full rounded-xl h-10 text-sm bg-card border border-input px-3 text-foreground">
                  <option value="">Select</option>
                  {TRANSMISSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Drivetrain</Label>
                <select value={form.drivetrain} onChange={e => setForm(f => ({ ...f, drivetrain: e.target.value }))} className="w-full rounded-xl h-10 text-sm bg-background border border-input px-3 text-foreground">
                  <option value="">Select</option>
                  {DRIVETRAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-medium">Colour</Label><Input placeholder="Silver" value={form.colour} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Mileage</Label><Input type="number" placeholder="50000" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} className="rounded-xl" /></div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Enthusiast Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {ENTHUSIAST_TAGS.map(tag => {
                  const active = form.tags.includes(tag);
                  return (
                    <button key={tag} onClick={() => toggleFormTag(tag)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground'}`}>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mods */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Modifications</Label>
              <Textarea placeholder="List your mods..." value={form.modsText} onChange={e => setForm(f => ({ ...f, modsText: e.target.value }))} className="rounded-xl min-h-[60px]" />
            </div>

            {/* Visibility */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Visibility</Label>
              <div className="flex gap-2">
                {(['public', 'friends', 'private'] as const).map(vis => (
                  <button key={vis} onClick={() => setForm(f => ({ ...f, visibility: vis }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize ${form.visibility === vis ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 text-muted-foreground'}`}>
                    {vis}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPrimary} onChange={e => setForm(f => ({ ...f, isPrimary: e.target.checked }))} className="sr-only" />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.isPrimary ? 'border-primary bg-primary' : 'border-border'}`}>
                {form.isPrimary && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className="text-sm font-medium text-foreground">Set as primary vehicle</span>
            </label>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border/30 safe-bottom">
            <Button onClick={handleAdd} className="w-full h-12 text-base font-semibold">Add to Garage</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyGarage;
