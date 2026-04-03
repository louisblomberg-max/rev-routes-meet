import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  searchMakes,
  searchModels,
  getVariantsByModel,
  getYearsByModel,
  type VehicleMake,
  type VehicleModel,
} from '@/data/vehicles';

const VEHICLE_TYPES = [
  { id: 'car', label: 'Car', icon: '🚗' },
  { id: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { id: 'van', label: 'Van', icon: '🚐' },
  { id: 'truck', label: 'Truck', icon: '🚛' },
  { id: 'classic', label: 'Classic', icon: '🏆' },
  { id: 'other', label: 'Other', icon: '🚙' },
] as const;

const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'semi-auto', label: 'Semi-Automatic' },
  { value: 'dct', label: 'DCT' },
  { value: 'cvt', label: 'CVT' },
];

const DRIVETRAIN_OPTIONS = [
  { value: 'rwd', label: 'RWD' },
  { value: 'fwd', label: 'FWD' },
  { value: 'awd', label: 'AWD' },
  { value: '4wd', label: '4WD' },
];

const AddVehicle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Vehicle type
  const [vehicleType, setVehicleType] = useState('car');

  // Make
  const [makeQuery, setMakeQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const makeRef = useRef<HTMLDivElement>(null);

  // Model
  const [modelQuery, setModelQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  // Variant, Year
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Other fields
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('');
  const [drivetrain, setDrivetrain] = useState('');
  const [colour, setColour] = useState('');
  const [numberPlate, setNumberPlate] = useState('');
  const [details, setDetails] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [isPrimary, setIsPrimary] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (makeRef.current && !makeRef.current.contains(e.target as Node)) {
        setShowMakeSuggestions(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setShowModelSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredMakes = useMemo(() => {
    const type =
      vehicleType === 'motorcycle' ? 'motorcycle' :
      vehicleType === 'car' || vehicleType === 'classic' || vehicleType === 'van' || vehicleType === 'truck'
        ? 'car' : 'all';
    return searchMakes(makeQuery, type as 'car' | 'motorcycle' | 'all');
  }, [makeQuery, vehicleType]);

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

  const handleVehicleTypeChange = (id: string) => {
    setVehicleType(id);
    setSelectedMake(null);
    setMakeQuery('');
    setSelectedModel(null);
    setModelQuery('');
    setSelectedVariant('');
    setSelectedYear('');
  };

  const handleSave = async () => {
    if (!selectedMake) { toast.error('Please select a make'); return; }
    if (!selectedModel) { toast.error('Please select a model'); return; }
    if (!selectedYear) { toast.error('Please select a year'); return; }
    if (!user?.id) { toast.error('Please sign in'); return; }

    setSaving(true);
    try {
      // year is stored as TEXT in the database — do not convert to number
      const payload: Record<string, any> = {
        user_id: user.id,
        make: selectedMake.name,
        model: selectedModel.name,
        year: String(selectedYear),
        vehicle_type: vehicleType || 'car',
        visibility: visibility || 'public',
        is_primary: isPrimary || false,
        photos: [],
        tags: [],
      };

      // Only add optional columns if they have values
      // These are the ONLY optional columns that exist in the vehicles table:
      // variant, engine, transmission, drivetrain, colour, number_plate, details, mods_text
      if (selectedVariant?.trim()) payload.variant = selectedVariant.trim();
      if (engine?.trim()) payload.engine = engine.trim();
      if (transmission?.trim()) payload.transmission = transmission.trim();
      if (drivetrain?.trim()) payload.drivetrain = drivetrain.trim();
      if (colour?.trim()) payload.colour = colour.trim();
      if (numberPlate?.trim()) payload.number_plate = numberPlate.trim();
      if (details?.trim()) payload.details = details.trim();

      const { data, error } = await supabase
        .from('vehicles')
        .insert(payload as any)
        .select()
        .single();

      if (error) {
        toast.error('Could not save: ' + error.message);
        return;
      }

      toast.success(`${selectedMake.name} ${selectedModel.name} added to your garage!`);
      navigate(-1);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = !!selectedMake && !!selectedModel && !!selectedYear;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 safe-top">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Add Vehicle</h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 gap-6 pb-32">
        {/* Vehicle Type */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Vehicle Type
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {VEHICLE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleVehicleTypeChange(t.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                  vehicleType === t.id
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border/50 bg-card text-muted-foreground hover:border-foreground/30'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Make */}
        <div ref={makeRef}>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Make *
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={selectedMake ? selectedMake.name : makeQuery}
              onChange={(e) => {
                setMakeQuery(e.target.value);
                setSelectedMake(null);
                setSelectedModel(null);
                setModelQuery('');
                setSelectedVariant('');
                setSelectedYear('');
                setShowMakeSuggestions(true);
              }}
              onFocus={() => { if (!selectedMake) setShowMakeSuggestions(true); }}
              placeholder="Search make e.g. Porsche, BMW..."
              className="pl-10 h-12 rounded-xl bg-card border-border text-foreground"
            />
            {selectedMake && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          {selectedMake && (
            <button
              onClick={() => { setSelectedMake(null); setMakeQuery(''); setSelectedModel(null); setModelQuery(''); setSelectedVariant(''); setSelectedYear(''); setShowMakeSuggestions(true); }}
              className="mt-2 text-xs text-primary font-medium"
            >
              Change make
            </button>
          )}
          {showMakeSuggestions && filteredMakes.length > 0 && !selectedMake && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
              {filteredMakes.slice(0, 10).map((make) => (
                <button
                  key={make.id}
                  onClick={() => {
                    setSelectedMake(make);
                    setMakeQuery(make.name);
                    setSelectedModel(null);
                    setModelQuery('');
                    setSelectedVariant('');
                    setSelectedYear('');
                    setShowMakeSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none flex items-center justify-between"
                >
                  <span className="text-foreground">{make.name}</span>
                  <span className="text-xs text-muted-foreground">{make.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model */}
        {selectedMake && (
          <div ref={modelRef}>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
              Model *
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={selectedModel ? selectedModel.name : modelQuery}
                onChange={(e) => {
                  setModelQuery(e.target.value);
                  setSelectedModel(null);
                  setSelectedVariant('');
                  setSelectedYear('');
                  setShowModelSuggestions(true);
                }}
                onFocus={() => { if (!selectedModel) setShowModelSuggestions(true); }}
                placeholder={`Search ${selectedMake.name} model...`}
                className="pl-10 h-12 rounded-xl bg-card border-border text-foreground"
              />
              {selectedModel && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            {selectedModel && (
              <button
                onClick={() => { setSelectedModel(null); setModelQuery(''); setSelectedVariant(''); setSelectedYear(''); setShowModelSuggestions(true); }}
                className="mt-2 text-xs text-primary font-medium"
              >
                Change model
              </button>
            )}
            {showModelSuggestions && filteredModels.length > 0 && !selectedModel && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                {filteredModels.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => {
                      setSelectedModel(model);
                      setModelQuery(model.name);
                      setSelectedVariant('');
                      setSelectedYear('');
                      setShowModelSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none flex items-center justify-between"
                  >
                    <span className="text-foreground">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.yearStart}–{model.yearEnd}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Variant */}
        {selectedModel && variants.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
              Variant (optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant}
                  onClick={() => setSelectedVariant(selectedVariant === variant ? '' : variant)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedVariant === variant
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-foreground/30'
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year */}
        {selectedModel && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
              Year *
            </Label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-card text-foreground"
            >
              <option value="">Select year</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {/* Engine */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Engine</Label>
          <Input
            placeholder="e.g. 3.0L Twin Turbo"
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="h-12 rounded-xl bg-card border-border text-foreground"
          />
        </div>

        {/* Transmission & Drivetrain */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Transmission</Label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-card text-foreground"
            >
              <option value="">Select</option>
              {TRANSMISSION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Drivetrain</Label>
            <select
              value={drivetrain}
              onChange={(e) => setDrivetrain(e.target.value)}
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-card text-foreground"
            >
              <option value="">Select</option>
              {DRIVETRAIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Colour & Number Plate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Colour</Label>
            <Input
              placeholder="e.g. Black"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              className="h-12 rounded-xl bg-card border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Number Plate</Label>
            <Input
              placeholder="AB12 CDE"
              value={numberPlate}
              onChange={(e) => setNumberPlate(e.target.value)}
              className="h-12 rounded-xl bg-card border-border text-foreground"
            />
          </div>
        </div>

        {/* Details */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Details</Label>
          <Textarea
            placeholder="Add further details about your vehicle..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="rounded-xl min-h-[80px] bg-card border-border text-foreground"
          />
        </div>

        {/* Visibility */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Visibility</Label>
          <div className="flex gap-2">
            {(['public', 'friends', 'private'] as const).map((vis) => (
              <button
                key={vis}
                onClick={() => setVisibility(vis)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                  visibility === vis
                    ? 'border-2 border-primary text-primary'
                    : 'border-border/50 text-muted-foreground bg-card'
                }`}
              >
                {vis}
              </button>
            ))}
          </div>
        </div>

        {/* Primary toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="sr-only" />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isPrimary ? 'border-primary bg-primary' : 'border-border'}`}>
            {isPrimary && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          <span className="text-sm font-medium text-foreground">Set as primary vehicle</span>
        </label>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border/30 safe-bottom">
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className={`w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
            canSave && !saving
              ? 'bg-primary text-primary-foreground shadow-lg hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Add to Garage'}
          {!saving && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default AddVehicle;
