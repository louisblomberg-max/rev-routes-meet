import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike, Plus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, type AuthVehicle } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';

const emptyVehicle = (): AuthVehicle => ({
  id: crypto.randomUUID(),
  type: 'car',
  make: '',
  model: '',
  year: '',
  trim: '',
  color: '',
  isPrimary: false,
});

const VEHICLE_TYPES = [
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'motorcycles', label: 'Motorcycles', icon: Bike },
];

const STYLE_TAGS = [
  'Classic', 'Supercars', 'JDM', 'Euro', 'American', 'Off-road', 'Track-focused', 'EV',
];

const OnboardingVehicle = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<AuthVehicle[]>([emptyVehicle()]);
  const [showVehicles, setShowVehicles] = useState(false);

  const toggleType = (t: string) => setVehicleTypes(prev => prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t]);
  const toggleTag = (t: string) => setStyleTags(prev => prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t]);

  const updateVehicle = (id: string, field: keyof AuthVehicle, value: any) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addVehicle = () => {
    if (vehicles.length >= 5) return;
    setVehicles(prev => [...prev, emptyVehicle()]);
  };

  const removeVehicle = (id: string) => {
    if (vehicles.length <= 1) return;
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const handleContinue = () => {
    const filled = vehicles.filter(v => v.make.trim() && v.model.trim());
    updateProfile({
      vehicleTypes,
      vehicleTags: styleTags,
      vehicles: filled,
    } as any);
    setOnboardingStep(3);
    navigate('/onboarding/location');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/interests" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 2 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">Vehicle preferences</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Step 3 of 6 — Tell us what you drive</p>

        {/* Vehicle type selection */}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What do you ride?</h3>
        <div className="flex gap-3 mb-6">
          {VEHICLE_TYPES.map(vt => {
            const Icon = vt.icon;
            const active = vehicleTypes.includes(vt.id);
            return (
              <button
                key={vt.id}
                onClick={() => toggleType(vt.id)}
                className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                  active ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-foreground'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold">{vt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Style tags */}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Style tags (optional)</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {STYLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                styleTags.includes(tag) ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Add vehicle */}
        {!showVehicles ? (
          <button
            onClick={() => setShowVehicles(true)}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" /> Add your vehicle(s)
          </button>
        ) : (
          <>
            {vehicles.map((vehicle, idx) => (
              <div key={vehicle.id} className="bg-muted rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">Vehicle {idx + 1}</span>
                  {vehicles.length > 1 && (
                    <button onClick={() => removeVehicle(vehicle.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex bg-background rounded-xl p-1 mb-3">
                  <button
                    onClick={() => updateVehicle(vehicle.id, 'type', 'car')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${vehicle.type === 'car' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    <Car className="w-4 h-4" /> Car
                  </button>
                  <button
                    onClick={() => updateVehicle(vehicle.id, 'type', 'motorcycle')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${vehicle.type === 'motorcycle' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    <Bike className="w-4 h-4" /> Motorcycle
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input placeholder="Make *" className="rounded-xl h-11 bg-background border-0 text-sm" value={vehicle.make} onChange={e => updateVehicle(vehicle.id, 'make', e.target.value)} />
                  <Input placeholder="Model *" className="rounded-xl h-11 bg-background border-0 text-sm" value={vehicle.model} onChange={e => updateVehicle(vehicle.id, 'model', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Year" className="rounded-xl h-11 bg-background border-0 text-sm" value={vehicle.year} onChange={e => updateVehicle(vehicle.id, 'year', e.target.value)} />
                  <Input placeholder="Trim" className="rounded-xl h-11 bg-background border-0 text-sm" value={vehicle.trim} onChange={e => updateVehicle(vehicle.id, 'trim', e.target.value)} />
                  <Input placeholder="Color" className="rounded-xl h-11 bg-background border-0 text-sm" value={vehicle.color} onChange={e => updateVehicle(vehicle.id, 'color', e.target.value)} />
                </div>
              </div>
            ))}
            {vehicles.length < 5 && (
              <button onClick={addVehicle} className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Another
              </button>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button onClick={handleContinue} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button
          onClick={() => { setOnboardingStep(3); navigate('/onboarding/location'); }}
          className="w-full text-sm text-muted-foreground mt-2 py-1"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default OnboardingVehicle;
