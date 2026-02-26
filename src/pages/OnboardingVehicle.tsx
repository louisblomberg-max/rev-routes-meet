import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Bike, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth, type AuthVehicle } from '@/contexts/AuthContext';

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-sm p-5 ${className}`}>{children}</div>
);

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

const OnboardingVehicle = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();
  const [vehicles, setVehicles] = useState<AuthVehicle[]>([emptyVehicle()]);

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
    updateProfile({ vehicles: filled } as any);
    setOnboardingStep(2);
    navigate('/onboarding/interests');
  };

  const handleSkip = () => {
    setOnboardingStep(2);
    navigate('/onboarding/interests');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 1 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-caption mt-1.5">Step 2 of 5 — Vehicle</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-5 overflow-y-auto pb-28">
        <div>
          <h1 className="heading-lg text-foreground mb-1">Add your ride</h1>
          <p className="text-sm text-muted-foreground">Show off what you drive (you can add more later)</p>
        </div>

        {vehicles.map((vehicle, idx) => (
          <SectionCard key={vehicle.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Vehicle {idx + 1}</h3>
              {vehicles.length > 1 && (
                <button onClick={() => removeVehicle(vehicle.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              )}
            </div>

            {/* Type toggle */}
            <div className="flex bg-muted rounded-xl p-1 mb-4">
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

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Make *</Label>
                  <Input placeholder="e.g. BMW" className="rounded-xl h-11" value={vehicle.make} onChange={e => updateVehicle(vehicle.id, 'make', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Model *</Label>
                  <Input placeholder="e.g. M3" className="rounded-xl h-11" value={vehicle.model} onChange={e => updateVehicle(vehicle.id, 'model', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <Input placeholder="2024" className="rounded-xl h-11" value={vehicle.year} onChange={e => updateVehicle(vehicle.id, 'year', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Trim</Label>
                  <Input placeholder="Competition" className="rounded-xl h-11" value={vehicle.trim} onChange={e => updateVehicle(vehicle.id, 'trim', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <Input placeholder="Black" className="rounded-xl h-11" value={vehicle.color} onChange={e => updateVehicle(vehicle.id, 'color', e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground font-medium">Primary vehicle</span>
                <Switch checked={vehicle.isPrimary} onCheckedChange={v => {
                  setVehicles(prev => prev.map(ve => ({ ...ve, isPrimary: ve.id === vehicle.id ? v : false })));
                }} />
              </div>
            </div>
          </SectionCard>
        ))}

        {vehicles.length < 5 && (
          <button onClick={addVehicle} className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2 hover:border-primary/40 transition-colors">
            <Plus className="w-4 h-4" /> Add Another Vehicle
          </button>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/30 px-6 py-4 safe-bottom space-y-2">
        <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold">
          Continue
        </Button>
        <button onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5">
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default OnboardingVehicle;
