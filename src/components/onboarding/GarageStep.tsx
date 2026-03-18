import { useState } from 'react';
import { Car, Bike, Plus, Trash2, ChevronRight, ChevronDown, ChevronUp, Check, Tag, Eye, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOnboarding, type OnboardingVehicle } from '@/contexts/OnboardingContext';
import { ENTHUSIAST_TAGS, TRANSMISSION_OPTIONS, DRIVETRAIN_OPTIONS } from '@/models/garage';

const emptyVehicle = (): OnboardingVehicle => ({
  id: crypto.randomUUID(),
  vehicleType: 'car',
  make: '', model: '', year: '', trim: '', engine: '',
  transmission: '', drivetrain: '', colour: '', mileage: '',
  tags: [], modsText: '',
  visibility: 'public', isPrimary: false,
});

const GarageStep = () => {
  const { data, updateData, next, back } = useOnboarding();
  const [vehicles, setVehicles] = useState<OnboardingVehicle[]>(data.vehicles.length ? data.vehicles : []);
  const [expanded, setExpanded] = useState<string | null>(null);

  const addVehicle = () => {
    if (vehicles.length >= 5) return;
    const v = emptyVehicle();
    setVehicles((prev) => [...prev, v]);
    setExpanded(v.id);
  };

  const removeVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const updateVehicle = (id: string, field: keyof OnboardingVehicle, value: any) => {
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, [field]: value } : v));
  };

  const toggleTag = (vehicleId: string, tag: string) => {
    setVehicles((prev) => prev.map((v) => {
      if (v.id !== vehicleId) return v;
      const tags = v.tags.includes(tag) ? v.tags.filter(t => t !== tag) : [...v.tags, tag];
      return { ...v, tags };
    }));
  };

  const handleNext = () => {
    // Auto-set first vehicle as primary if none selected
    const updated = vehicles.map((v, i) => ({
      ...v,
      isPrimary: vehicles.some(veh => veh.isPrimary) ? v.isPrimary : i === 0,
    }));
    updateData({ vehicles: updated });
    next();
  };

  const handleSkip = () => {
    updateData({ vehicles: [] });
    next();
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) =>
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= 2 ? 'bg-primary' : 'bg-black/10'}`} />
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto pb-40">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2 animate-fade-up text-black">
          Add Your Vehicles
        </h1>
        <p className="text-sm text-center mb-8 animate-fade-up text-black/60">
          Your vehicles help us personalise events, routes and recommendations.
        </p>

        <div className="space-y-3">
          {vehicles.map((vehicle, idx) => {
            const isExpanded = expanded === vehicle.id;
            return (
              <div key={vehicle.id} className="bg-white rounded-2xl border border-black/10 overflow-hidden animate-fade-up">
                <button
                  onClick={() => setExpanded(isExpanded ? null : vehicle.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      {vehicle.vehicleType === 'motorcycle' ?
                        <Bike className="w-4.5 h-4.5 text-black" /> :
                        <Car className="w-4.5 h-4.5 text-black" />
                      }
                    </div>
                    <span className="text-sm font-semibold text-black">
                      {vehicle.make && vehicle.model ?
                        `${vehicle.make} ${vehicle.model}` :
                        `Vehicle ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeVehicle(vehicle.id); }}
                      className="text-black/40 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-black/40" /> : <ChevronDown className="w-4 h-4 text-black/40" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-black/10 pt-4">
                    {/* Vehicle Type */}
                    <div className="grid grid-cols-2 gap-3">
                      {(['car', 'motorcycle'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => updateVehicle(vehicle.id, 'vehicleType', t)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            vehicle.vehicleType === t
                              ? 'border-primary bg-primary/5'
                              : 'border-black/10'
                          }`}>
                          {t === 'car' ? <Car className={`w-5 h-5 ${vehicle.vehicleType === t ? 'text-primary' : 'text-black/40'}`} /> : <Bike className={`w-5 h-5 ${vehicle.vehicleType === t ? 'text-primary' : 'text-black/40'}`} />}
                          <span className={`font-semibold text-sm ${vehicle.vehicleType === t ? 'text-primary' : 'text-black/60'}`}>{t === 'car' ? 'Car' : 'Motorcycle'}</span>
                        </button>
                      ))}
                    </div>

                    {/* Make & Model */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Make *</Label>
                        <Input placeholder="e.g. BMW" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.make} onChange={(e) => updateVehicle(vehicle.id, 'make', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Model</Label>
                        <Input placeholder="e.g. M3" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.model} onChange={(e) => updateVehicle(vehicle.id, 'model', e.target.value)} />
                      </div>
                    </div>

                    {/* Year, Trim, Engine */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Year</Label>
                        <Input type="number" placeholder="2024" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.year} onChange={(e) => updateVehicle(vehicle.id, 'year', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Trim</Label>
                        <Input placeholder="M Sport" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.trim} onChange={(e) => updateVehicle(vehicle.id, 'trim', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Engine</Label>
                        <Input placeholder="3.0L" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.engine} onChange={(e) => updateVehicle(vehicle.id, 'engine', e.target.value)} />
                      </div>
                    </div>

                    {/* Transmission & Drivetrain */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Transmission</Label>
                        <select value={vehicle.transmission} onChange={(e) => updateVehicle(vehicle.id, 'transmission', e.target.value)} className="w-full rounded-xl h-11 text-sm bg-white border border-black/10 px-3 text-black">
                          <option value="">Select</option>
                          {TRANSMISSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Drivetrain</Label>
                        <select value={vehicle.drivetrain} onChange={(e) => updateVehicle(vehicle.id, 'drivetrain', e.target.value)} className="w-full rounded-xl h-11 text-sm bg-white border border-black/10 px-3 text-black">
                          <option value="">Select</option>
                          {DRIVETRAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Colour & Mileage */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Colour</Label>
                        <Input placeholder="Silver" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.colour} onChange={(e) => updateVehicle(vehicle.id, 'colour', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-black/70">Mileage</Label>
                        <Input type="number" placeholder="50000" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.mileage} onChange={(e) => updateVehicle(vehicle.id, 'mileage', e.target.value)} />
                      </div>
                    </div>

                    {/* Enthusiast Tags */}
                    <div>
                      <Label className="text-xs font-medium text-black/70 mb-2 block">Enthusiast Tags</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {ENTHUSIAST_TAGS.map(tag => {
                          const active = vehicle.tags.includes(tag);
                          return (
                            <button key={tag} onClick={() => toggleTag(vehicle.id, tag)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${active ? 'border-primary bg-primary/10 text-primary' : 'border-black/10 text-black/40'}`}>
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modifications */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-black/70">Modifications</Label>
                      <Textarea placeholder="List your mods..." value={vehicle.modsText} onChange={(e) => updateVehicle(vehicle.id, 'modsText', e.target.value)} className="rounded-xl min-h-[60px] text-sm bg-white text-black border-black/10" />
                    </div>

                    {/* Visibility */}
                    <div>
                      <Label className="text-xs font-medium text-black/70 mb-2 block">Visibility</Label>
                      <div className="flex gap-2">
                        {(['public', 'friends', 'private'] as const).map(vis => (
                          <button key={vis} onClick={() => updateVehicle(vehicle.id, 'visibility', vis)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize ${vehicle.visibility === vis ? 'border-primary bg-primary/5 text-primary' : 'border-black/10 text-black/40'}`}>
                            {vis}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={vehicle.isPrimary} onChange={(e) => {
                        // Unset others if setting this as primary
                        if (e.target.checked) {
                          setVehicles(prev => prev.map(v => ({ ...v, isPrimary: v.id === vehicle.id })));
                        } else {
                          updateVehicle(vehicle.id, 'isPrimary', false);
                        }
                      }} className="sr-only" />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${vehicle.isPrimary ? 'border-primary bg-primary' : 'border-black/20'}`}>
                        {vehicle.isPrimary && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-black">Set as primary vehicle</span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}

          {vehicles.length < 5 && (
            <button
              onClick={addVehicle}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-black/20 text-sm font-semibold text-black/50 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors">
              <Plus className="w-4 h-4" />
              {vehicles.length === 0 ? 'Add Vehicle' : 'Add another vehicle'}
            </button>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={handleNext} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={handleSkip} className="w-full text-sm text-black/50 mt-2 py-2">
          Skip for now
        </button>
        <button onClick={back} className="w-full text-xs text-black/40 py-1">Back</button>
      </div>
    </div>
  );
};

export default GarageStep;
