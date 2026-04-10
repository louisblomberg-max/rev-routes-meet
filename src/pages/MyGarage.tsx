import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Car, Bike, Plus, ChevronDown, ChevronUp, Eye, Users, Lock,
  Wrench, Settings, Star, Trash2, X, Sparkles, Tag, Check, ImagePlus, Pencil, Search
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage, useUserPreferences } from '@/contexts/GarageContext';
import {
  ENTHUSIAST_TAGS, TRANSMISSION_OPTIONS, DRIVETRAIN_OPTIONS,
  getRecommendationBullets,
} from '@/models/garage';
import type { GarageVehicle } from '@/models/garage';
import {
  searchMakes,
  searchModels,
  getVariantsByModel,
  getYearsByModel,
  type VehicleMake,
  type VehicleModel,
} from '@/data/vehicles';

const VIS_CONFIG = {
  public: { icon: Eye, label: 'Public' },
  friends: { icon: Users, label: 'Friends' },
  private: { icon: Lock, label: 'Private' },
} as const;

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  car: '🚗', motorcycle: '🏍️', van: '🚐', truck: '🚛', classic: '🏆', other: '🚙',
};

const MyGarage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const {
    vehicles, primaryVehicle, isLoading,
    addVehicle, updateVehicle, deleteVehicle, setPrimaryVehicle,
  } = useGarage();
  const { preferences, updatePreferences } = useUserPreferences();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<GarageVehicle | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);

  // Form state
  const photoInputRef = useRef<HTMLInputElement>(null);
  const makeRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const [formVehicleType, setFormVehicleType] = useState('car');
  const [makeQuery, setMakeQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [modelQuery, setModelQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [form, setForm] = useState({
    engine: '', transmission: '', drivetrain: '',
    colour: '', numberPlate: '', modsText: '',
    visibility: 'public' as 'public' | 'friends' | 'private',
    isPrimary: false, photos: [] as string[],
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (makeRef.current && !makeRef.current.contains(e.target as Node)) setShowMakeSuggestions(false);
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setShowModelSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredMakes = useMemo(() => {
    const type = formVehicleType === 'motorcycle' ? 'motorcycle' : formVehicleType === 'car' || formVehicleType === 'classic' ? 'car' : 'all';
    return searchMakes(makeQuery, type as 'car' | 'motorcycle' | 'all');
  }, [makeQuery, formVehicleType]);

  const filteredModels = useMemo(() => {
    if (!selectedMake) return [];
    return searchModels(selectedMake.id, modelQuery);
  }, [selectedMake, modelQuery]);

  const variants = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    return getVariantsByModel(selectedMake.id, selectedModel.name);
  }, [selectedMake, selectedModel]);

  const years = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    return getYearsByModel(selectedMake.id, selectedModel.name);
  }, [selectedMake, selectedModel]);

  const resetForm = () => {
    setFormVehicleType('car');
    setMakeQuery(''); setSelectedMake(null); setShowMakeSuggestions(false);
    setModelQuery(''); setSelectedModel(null); setShowModelSuggestions(false);
    setSelectedVariant(''); setSelectedYear('');
    setForm({
      engine: '', transmission: '', drivetrain: '',
      colour: '', numberPlate: '', modsText: '',
      visibility: 'public', isPrimary: false, photos: [],
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (form.photos.length + files.length > 6) {
      toast.error('Maximum 6 photos');
      e.target.value = '';
      return;
    }
    if (!authUser?.id) {
      toast.error('Please sign in to upload photos');
      e.target.value = '';
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Each photo must be under 10MB');
        continue;
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${authUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Uploads to existing 'vehicles' Supabase storage bucket (defined in supabase/migrations)
      const { error: uploadError } = await supabase.storage
        .from('vehicles')
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        toast.error('Failed to upload photo');
        continue;
      }

      const { data: urlData } = supabase.storage.from('vehicles').getPublicUrl(path);
      setForm(prev => ({ ...prev, photos: [...prev.photos, urlData.publicUrl] }));
    }
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  };

  const handleEdit = (vehicle: GarageVehicle) => {
    setEditingVehicle(vehicle);
    setFormVehicleType(vehicle.vehicleType || 'car');
    // Try to find make in DB
    const makes = searchMakes(vehicle.make, 'all');
    const foundMake = makes.find(m => m.name === vehicle.make) || null;
    setSelectedMake(foundMake);
    setMakeQuery(vehicle.make);
    if (foundMake) {
      const models = searchModels(foundMake.id, vehicle.model);
      const foundModel = models.find(m => m.name === vehicle.model) || null;
      setSelectedModel(foundModel);
      setModelQuery(vehicle.model);
      setSelectedVariant(vehicle.trim || '');
    } else {
      setSelectedModel(null);
      setModelQuery(vehicle.model);
      setSelectedVariant('');
    }
    setSelectedYear(vehicle.year?.toString() || '');
    setForm({
      engine: vehicle.engine || '',
      transmission: vehicle.transmission || '',
      drivetrain: vehicle.drivetrain || '',
      colour: vehicle.colour || '',
      numberPlate: vehicle.numberPlate || '',
      modsText: vehicle.modsText || '',
      visibility: vehicle.visibility,
      isPrimary: vehicle.isPrimary,
      photos: [...vehicle.photos],
    });
    setIsAddOpen(true);
  };

  const handleSave = () => {
    const makeName = selectedMake?.name || makeQuery.trim();
    const modelName = selectedModel?.name || modelQuery.trim();
    if (!makeName) { toast.error('Make is required'); return; }

    try {
      const vehicleData = {
        vehicleType: formVehicleType as 'car' | 'motorcycle',
        make: makeName,
        model: modelName,
        year: selectedYear ? parseInt(selectedYear) : undefined,
        trim: selectedVariant || undefined,
        engine: form.engine || undefined,
        transmission: (form.transmission || undefined) as GarageVehicle['transmission'],
        drivetrain: (form.drivetrain || undefined) as GarageVehicle['drivetrain'],
        colour: form.colour || undefined,
        numberPlate: form.numberPlate || undefined,
        mileage: undefined,
        tags: [] as string[],
        modsText: form.modsText || undefined,
        photos: form.photos,
        visibility: form.visibility,
        isPrimary: form.isPrimary || vehicles.length === 0,
      };

      if (editingVehicle) {
        updateVehicle(editingVehicle.id, vehicleData);
        setEditingVehicle(null);
        setIsAddOpen(false);
        resetForm();
        toast.success('Vehicle updated!');
      } else {
        addVehicle({ ...vehicleData, userId: '' });
        setIsAddOpen(false);
        resetForm();
        toast.success('Vehicle added to your garage!');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        toast.error('Storage full — try removing some photos');
      } else {
        toast.error('Failed to save vehicle');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle(id);
      toast.success('Vehicle removed');
    } catch {
      toast.error('Failed to remove vehicle');
    }
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
            {[1, 2].map((i) => (
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
            {[...vehicles].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((vehicle) => {
              const typeIcon = VEHICLE_TYPE_ICONS[vehicle.vehicleType] || '🚗';
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
                    {vehicle.photos.length > 0 ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={vehicle.photos[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${vehicle.isPrimary ? 'bg-primary/10' : 'bg-muted/80'}`}>
                        {typeIcon}
                      </div>
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate">
                          {vehicle.make} {vehicle.model}
                        </span>
                        {vehicle.year && (
                          <Badge variant="secondary" className="text-[10px] py-0 h-5 shrink-0">
                            {vehicle.year}
                          </Badge>
                        )}
                      </div>
                      {vehicle.trim && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{vehicle.trim}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {vehicle.colour && (
                          <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full border border-border/50" style={{ backgroundColor: vehicle.colour.toLowerCase() }} />
                            <span className="text-[10px] text-muted-foreground">{vehicle.colour}</span>
                          </div>
                        )}
                        <Badge variant="outline" className="gap-1 text-[10px] py-0 h-5">
                          <VisIcon className="w-2.5 h-2.5" /> {VIS_CONFIG[vehicle.visibility].label}
                        </Badge>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground/50 shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground/50 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/20 space-y-3">
                      {vehicle.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {vehicle.photos.map((img, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-border flex-shrink-0">
                              <img src={img} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {vehicle.engine && <div><span className="text-muted-foreground">Engine:</span> <span className="text-foreground font-medium">{vehicle.engine}</span></div>}
                        {vehicle.transmission && <div><span className="text-muted-foreground">Trans:</span> <span className="text-foreground font-medium capitalize">{vehicle.transmission}</span></div>}
                        {vehicle.drivetrain && <div><span className="text-muted-foreground">Drivetrain:</span> <span className="text-foreground font-medium uppercase">{vehicle.drivetrain}</span></div>}
                        {vehicle.colour && <div><span className="text-muted-foreground">Colour:</span> <span className="text-foreground font-medium">{vehicle.colour}</span></div>}
                        {vehicle.mileage && <div><span className="text-muted-foreground">Mileage:</span> <span className="text-foreground font-medium">{vehicle.mileage.toLocaleString()}</span></div>}
                      </div>

                      {vehicle.modsText && (
                        <div>
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1.5"><Wrench className="w-3 h-3" /> Details</div>
                          <p className="text-sm text-foreground/80 bg-background/50 rounded-lg p-3">{vehicle.modsText}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => handleEdit(vehicle)}>
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
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
                    ? preferences.vehicleTypes.map((t) => <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>)
                    : <span className="text-xs text-muted-foreground/60">Not set</span>
                  }
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Style Tags</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {preferences.styleTags.length > 0
                    ? preferences.styleTags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)
                    : <span className="text-xs text-muted-foreground/60">Not set</span>
                  }
                </div>
              </div>

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

              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/add/vehicle')}>
                Add Vehicle
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Vehicle Sheet */}
      <Sheet open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { setEditingVehicle(null); resetForm(); } }}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
          <SheetHeader className="px-2 pb-4 border-b border-border/30">
            <SheetTitle className="text-lg font-bold">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</SheetTitle>
          </SheetHeader>
          <div className="py-5 px-2 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Vehicle Type */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'car', label: 'Car', icon: '🚗' },
                { id: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
                { id: 'other', label: 'Other', icon: '🚙' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setFormVehicleType(t.id);
                    setSelectedMake(null); setMakeQuery('');
                    setSelectedModel(null); setModelQuery('');
                    setSelectedVariant(''); setSelectedYear('');
                  }}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formVehicleType === t.id
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border/50 bg-card text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-[10px]">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Photos */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Photos</Label>
              <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {form.photos.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border flex-shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {form.photos.length < 6 && (
                  <button onClick={() => photoInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex-shrink-0">
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[9px] font-medium">Add</span>
                  </button>
                )}
              </div>
            </div>

            {/* Make - searchable */}
            <div ref={makeRef}>
              <Label className="text-xs font-medium mb-1.5 block">Make *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={selectedMake ? selectedMake.name : makeQuery}
                  onChange={(e) => {
                    setMakeQuery(e.target.value);
                    setSelectedMake(null); setSelectedModel(null); setModelQuery('');
                    setSelectedVariant(''); setSelectedYear('');
                    setShowMakeSuggestions(true);
                  }}
                  onFocus={() => { if (!selectedMake) setShowMakeSuggestions(true); }}
                  placeholder="Search make..."
                  className="pl-10 rounded-xl"
                />
                {selectedMake && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              {selectedMake && (
                <button onClick={() => { setSelectedMake(null); setMakeQuery(''); setSelectedModel(null); setModelQuery(''); setSelectedVariant(''); setSelectedYear(''); setShowMakeSuggestions(true); }} className="mt-1 text-xs text-primary font-medium">
                  Change make
                </button>
              )}
              {showMakeSuggestions && filteredMakes.length > 0 && !selectedMake && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                  {filteredMakes.slice(0, 10).map((make) => (
                    <button
                      key={make.id}
                      onClick={() => {
                        setSelectedMake(make); setMakeQuery(make.name);
                        setSelectedModel(null); setModelQuery('');
                        setSelectedVariant(''); setSelectedYear('');
                        setShowMakeSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none flex items-center justify-between"
                    >
                      <span className="text-foreground">{make.name}</span>
                      <span className="text-[10px] text-muted-foreground">{make.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model - searchable */}
            {selectedMake && (
              <div ref={modelRef}>
                <Label className="text-xs font-medium mb-1.5 block">Model</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={selectedModel ? selectedModel.name : modelQuery}
                    onChange={(e) => {
                      setModelQuery(e.target.value);
                      setSelectedModel(null); setSelectedVariant(''); setSelectedYear('');
                      setShowModelSuggestions(true);
                    }}
                    onFocus={() => { if (!selectedModel) setShowModelSuggestions(true); }}
                    placeholder={`Search ${selectedMake.name} model...`}
                    className="pl-10 rounded-xl"
                  />
                  {selectedModel && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                {selectedModel && (
                  <button onClick={() => { setSelectedModel(null); setModelQuery(''); setSelectedVariant(''); setSelectedYear(''); setShowModelSuggestions(true); }} className="mt-1 text-xs text-primary font-medium">
                    Change model
                  </button>
                )}
                {showModelSuggestions && filteredModels.length > 0 && !selectedModel && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                    {filteredModels.map((model) => (
                      <button
                        key={model.name}
                        onClick={() => {
                          setSelectedModel(model); setModelQuery(model.name);
                          setSelectedVariant(''); setSelectedYear('');
                          setShowModelSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none flex items-center justify-between"
                      >
                        <span className="text-foreground">{model.name}</span>
                        <span className="text-[10px] text-muted-foreground">{model.yearStart}–{model.yearEnd}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Variant chips */}
            {selectedModel && variants.length > 0 && (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Variant</Label>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(selectedVariant === v ? '' : v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        selectedVariant === v
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-foreground/30'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year */}
            {selectedModel && (
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Year</Label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full rounded-xl h-10 text-sm bg-card border border-input px-3 text-foreground"
                >
                  <option value="">Select year</option>
                  {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                </select>
              </div>
            )}

            {/* Remaining fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Engine</Label>
                <Input placeholder="e.g. 3.6L" value={form.engine} onChange={(e) => setForm(f => ({ ...f, engine: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Colour</Label>
                <Input placeholder="Black" value={form.colour} onChange={(e) => setForm(f => ({ ...f, colour: e.target.value }))} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Transmission</Label>
                <select value={form.transmission} onChange={(e) => setForm(f => ({ ...f, transmission: e.target.value }))} className="w-full rounded-xl h-10 text-sm bg-card border border-input px-3 text-foreground">
                  <option value="">Select</option>
                  {TRANSMISSION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Drivetrain</Label>
                <select value={form.drivetrain} onChange={(e) => setForm(f => ({ ...f, drivetrain: e.target.value }))} className="w-full rounded-xl h-10 text-sm bg-card border border-input px-3 text-foreground">
                  <option value="">Select</option>
                  {DRIVETRAIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Number Plate</Label>
              <Input placeholder="AB12 CDE" value={form.numberPlate} onChange={(e) => setForm(f => ({ ...f, numberPlate: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Details</Label>
              <Textarea placeholder="Add further details..." value={form.modsText} onChange={(e) => setForm(f => ({ ...f, modsText: e.target.value }))} className="rounded-xl min-h-[60px]" />
            </div>

            {/* Visibility */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Visibility</Label>
              <div className="flex gap-2 px-5">
                {(['public', 'friends', 'private'] as const).map((vis) => (
                  <button key={vis} onClick={() => setForm(f => ({ ...f, visibility: vis }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize ${form.visibility === vis ? 'border-2 border-primary text-primary' : 'border-border/50 text-muted-foreground bg-card'}`}>
                    {vis}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm(f => ({ ...f, isPrimary: e.target.checked }))} className="sr-only" />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.isPrimary ? 'border-primary bg-primary' : 'border-border'}`}>
                {form.isPrimary && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className="text-sm font-medium text-foreground">Set as primary vehicle</span>
            </label>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border/30 safe-bottom">
            <Button onClick={handleSave} className="w-full h-12 text-base font-semibold">{editingVehicle ? 'Save Changes' : 'Add to Garage'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyGarage;
