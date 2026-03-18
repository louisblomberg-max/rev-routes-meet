import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Bike, Plus, Trash2, ChevronRight, ChevronDown, ChevronUp,
  Check, Star, Sparkles, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage, useUserPreferences } from '@/contexts/GarageContext';
import { ENTHUSIAST_TAGS, TRANSMISSION_OPTIONS, DRIVETRAIN_OPTIONS, getRecommendationBullets } from '@/models/garage';
import type { GarageVehicle } from '@/models/garage';
import BackButton from '@/components/BackButton';

interface VehicleForm {
  id: string;
  vehicleType: 'car' | 'motorcycle';
  make: string;
  model: string;
  year: string;
  trim: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  colour: string;
  mileage: string;
  tags: string[];
  modsText: string;
  visibility: 'public' | 'friends' | 'private';
  isPrimary: boolean;
  showMore: boolean;
}

const emptyVehicle = (): VehicleForm => ({
  id: crypto.randomUUID(),
  vehicleType: 'car',
  make: '', model: '', year: '', trim: '', engine: '',
  transmission: '', drivetrain: '', colour: '', mileage: '',
  tags: [], modsText: '',
  visibility: 'public', isPrimary: false, showMore: false,
});

const VEHICLE_TYPES = [
  { id: 'car', label: 'Cars', icon: Car },
  { id: 'motorcycle', label: 'Motorcycles', icon: Bike },
] as const;

const OnboardingVehicle = () => {
  const navigate = useNavigate();
  const { setOnboardingStep } = useAuth();
  const { addVehicle: addToGarage } = useGarage();
  const { preferences, updatePreferences } = useUserPreferences();

  const [vehicleTypes, setVehicleTypes] = useState<string[]>(preferences.vehicleTypes);
  const [selectedTags, setSelectedTags] = useState<string[]>(preferences.styleTags);
  const [vehicles, setVehicles] = useState<VehicleForm[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  const toggleType = (t: string) =>
    setVehicleTypes(prev => prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t]);

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const updateVehicle = (id: string, field: keyof VehicleForm, value: any) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const toggleVehicleTag = (vehicleId: string, tag: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      const tags = v.tags.includes(tag) ? v.tags.filter(t => t !== tag) : [...v.tags, tag];
      return { ...v, tags };
    }));
  };

  const addVehicle = () => {
    if (vehicles.length >= 5) return;
    setVehicles(prev => [...prev, emptyVehicle()]);
    setShowVehicleForm(true);
  };

  const removeVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const handleSaveAndContinue = () => {
    updatePreferences({
      vehicleTypes,
      styleTags: selectedTags,
    });

    const filled = vehicles.filter(v => v.make.trim());
    filled.forEach((v, idx) => {
      addToGarage({
        userId: '',
        vehicleType: v.vehicleType,
        make: v.make,
        model: v.model,
        year: v.year ? parseInt(v.year) : undefined,
        trim: v.trim || undefined,
        engine: v.engine || undefined,
        transmission: (v.transmission || undefined) as GarageVehicle['transmission'],
        drivetrain: (v.drivetrain || undefined) as GarageVehicle['drivetrain'],
        colour: v.colour || undefined,
        mileage: v.mileage ? parseInt(v.mileage) : undefined,
        tags: [...selectedTags, ...v.tags],
        modsText: v.modsText || undefined,
        photos: [],
        visibility: v.visibility,
        isPrimary: idx === 0,
      });
    });

    setOnboardingStep(2);
    navigate('/onboarding/notifications');
  };

  const handleSkip = () => {
    setOnboardingStep(2);
    navigate('/onboarding/notifications');
  };

  const previewVehicles = vehicles.filter(v => v.make.trim()).map(v => ({
    make: v.make, model: v.model,
  })) as any[];
  const recBullets = getRecommendationBullets(
    previewVehicles,
    selectedTags,
    vehicleTypes,
  );

  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/features" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 1 ? 'bg-primary' : 'bg-black/10'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 overflow-y-auto pb-44">
        <h1 className="text-2xl font-bold text-black text-center mb-1">Set up your Garage</h1>
        <p className="text-sm text-black/50 text-center mb-4">Tell us what you drive.</p>

        {/* Info Banner */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 mb-5">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-black font-medium leading-relaxed">
                Your Garage sets your preferences. We'll use your vehicles to recommend events, routes, services, clubs and marketplace listings that match what you drive.
              </p>
              <p className="text-xs text-black/50 mt-1.5">
                These preferences are saved to your account and can be changed anytime in Settings.
              </p>
            </div>
          </div>
        </div>

        {/* Section A: Vehicle Type */}
        <h3 className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-3">
          What do you drive? <span className="text-primary">*</span>
        </h3>
        <div className="flex gap-3 mb-6">
          {VEHICLE_TYPES.map(vt => {
            const Icon = vt.icon;
            const active = vehicleTypes.includes(vt.id);
            return (
              <button
                key={vt.id}
                onClick={() => toggleType(vt.id)}
                className={`flex-1 py-5 rounded-2xl flex flex-col items-center gap-2.5 border-2 transition-all ${
                  active
                    ? 'border-primary bg-white shadow-md'
                    : 'border-black/10 bg-white hover:border-black/20'
                }`}
              >
                <Icon className={`w-7 h-7 ${active ? 'text-primary' : 'text-black/50'}`} />
                <span className={`text-sm font-semibold ${active ? 'text-black' : 'text-black/50'}`}>
                  {vt.label}
                </span>
                {active && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Section B: Add Vehicles */}
        <h3 className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-3">
          Add your vehicles <span className="text-black/30">(recommended)</span>
        </h3>

        {!showVehicleForm && vehicles.length === 0 ? (
          <button
            onClick={() => { addVehicle(); }}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-black/20 text-sm font-semibold text-black/50 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle, idx) => (
              <div key={vehicle.id} className="bg-white rounded-2xl border border-black/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                  <span className="text-xs font-semibold text-black/50">
                    Vehicle {idx + 1}
                    {idx === 0 && <Star className="w-3 h-3 text-primary inline ml-1.5 -mt-0.5" />}
                  </span>
                  <button onClick={() => removeVehicle(vehicle.id)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    {(['car', 'motorcycle'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => updateVehicle(vehicle.id, 'vehicleType', t)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          vehicle.vehicleType === t
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-black/10 text-black/50'
                        }`}
                      >
                        {t === 'car' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                        {t === 'car' ? 'Car' : 'Motorcycle'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Make *" className="rounded-xl h-11 text-sm bg-white text-black border-black/10 placeholder:text-black/40" value={vehicle.make} onChange={e => updateVehicle(vehicle.id, 'make', e.target.value)} />
                    <Input placeholder="Model" className="rounded-xl h-11 text-sm bg-white text-black border-black/10 placeholder:text-black/40" value={vehicle.model} onChange={e => updateVehicle(vehicle.id, 'model', e.target.value)} />
                  </div>
                  <Input placeholder="Year" type="number" className="rounded-xl h-11 text-sm bg-white text-black border-black/10 placeholder:text-black/40" value={vehicle.year} onChange={e => updateVehicle(vehicle.id, 'year', e.target.value)} />

                  <button
                    onClick={() => updateVehicle(vehicle.id, 'showMore', !vehicle.showMore)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary"
                  >
                    {vehicle.showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {vehicle.showMore ? 'Less details' : 'More details'}
                  </button>

                  {vehicle.showMore && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Trim / Variant" className="rounded-xl h-11 text-sm bg-white text-black border-black/10 placeholder:text-black/40" value={vehicle.trim} onChange={e => updateVehicle(vehicle.id, 'trim', e.target.value)} />
                        <Input placeholder="Engine" className="rounded-xl h-11 text-sm bg-white text-black border-black/10 placeholder:text-black/40" value={vehicle.engine} onChange={e => updateVehicle(vehicle.id, 'engine', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={vehicle.transmission}
                          onChange={e => updateVehicle(vehicle.id, 'transmission', e.target.value)}
                          className="rounded-xl h-11 text-sm bg-white text-black border border-black/10 px-3"
                        >
                          <option value="">Transmission</option>
                          {TRANSMISSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <select
                          value={vehicle.drivetrain}
                          onChange={e => updateVehicle(vehicle.id, 'drivetrain', e.target.value)}
                          className="rounded-xl h-11 text-sm bg-white text-black border border-black/10 px-3"
                        >
                          <option value="">Drivetrain</option>
                          {DRIVETRAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Colour" className="rounded-xl h-11 text-sm bg-white text-black border-black/10 placeholder:text-black/40" value={vehicle.colour} onChange={e => updateVehicle(vehicle.id, 'colour', e.target.value)} />
                        <Input placeholder="Mileage" type="number" className="rounded-xl h-11 text-sm bg-white text-black border-black/10 placeholder:text-black/40" value={vehicle.mileage} onChange={e => updateVehicle(vehicle.id, 'mileage', e.target.value)} />
                      </div>

                      <div>
                        <span className="text-xs font-medium text-black/50 mb-2 block">Tags</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ENTHUSIAST_TAGS.map(tag => {
                            const active = vehicle.tags.includes(tag);
                            return (
                              <button
                                key={tag}
                                onClick={() => toggleVehicleTag(vehicle.id, tag)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                  active
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-black/10 text-black/50 hover:border-black/20'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Textarea
                        placeholder="Modifications (optional)"
                        className="rounded-xl text-sm bg-white text-black border-black/10 min-h-[60px] placeholder:text-black/40"
                        value={vehicle.modsText}
                        onChange={e => updateVehicle(vehicle.id, 'modsText', e.target.value)}
                      />

                      <div>
                        <span className="text-xs font-medium text-black/50 mb-2 block">Visibility</span>
                        <div className="flex gap-2">
                          {(['public', 'friends', 'private'] as const).map(vis => (
                            <button
                              key={vis}
                              onClick={() => updateVehicle(vehicle.id, 'visibility', vis)}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                                vehicle.visibility === vis
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-black/10 text-black/50'
                              }`}
                            >
                              {vis}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {vehicles.length < 5 && (
              <button
                onClick={addVehicle}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-black/20 text-sm font-semibold text-black/50 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" /> Add another vehicle
              </button>
            )}
          </div>
        )}

        {/* Style Tags (global) */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-3">
            Style preferences <span className="text-black/30">(optional)</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {ENTHUSIAST_TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-black/10 bg-white text-black/50 hover:border-black/20'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section C: Recommendations Preview */}
        {(selectedTags.length > 0 || vehicles.some(v => v.make.trim())) && (
          <div className="mt-6 bg-white rounded-2xl border border-black/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-black">Based on your garage we'll prioritise:</span>
            </div>
            <ul className="space-y-2">
              {recBullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-black/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button
          onClick={handleSaveAndContinue}
          disabled={vehicleTypes.length === 0}
          className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10 disabled:opacity-50"
        >
          Save Garage & Continue <ChevronRight className="w-5 h-5" />
        </Button>
        <button
          onClick={handleSkip}
          className="w-full text-sm text-black/50 mt-2 py-1"
        >
          Skip for now — recommendations will be less accurate
        </button>
      </div>
    </div>
  );
};

export default OnboardingVehicle;
