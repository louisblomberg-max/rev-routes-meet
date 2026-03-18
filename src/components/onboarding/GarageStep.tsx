import { useState } from 'react';
import { Car, Bike, Plus, Trash2, ChevronRight, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboarding, type OnboardingVehicle } from '@/contexts/OnboardingContext';

const emptyVehicle = (): OnboardingVehicle => ({
  id: crypto.randomUUID(),
  vehicleType: 'car',
  make: '', model: '', year: '', engine: '',
  modifications: '', horsepower: '', drivetrain: '', colour: '',
  imageUrl: null
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

  const updateVehicle = (id: string, field: keyof OnboardingVehicle, value: string) => {
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleNext = () => {
    updateData({ vehicles });
    next();
  };

  const handleSkip = () => {
    updateData({ vehicles: [] });
    next();
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) =>
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= 2 ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto pb-40 bg-[#f3f3e8] text-black">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2 animate-fade-up text-black">
          Add Your Vehicles
        </h1>
        <p className="text-sm text-center mb-8 animate-fade-up text-black">
          Your vehicles help us personalise events, routes and recommendations.
        </p>

        <div className="space-y-3">
          {vehicles.map((vehicle, idx) => {
            const isExpanded = expanded === vehicle.id;
            return (
              <div key={vehicle.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-fade-up">
                {/* Header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : vehicle.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      {vehicle.vehicleType === 'motorcycle' ?
                      <Bike className="w-4.5 h-4.5 text-foreground" /> :

                      <Car className="w-4.5 h-4.5 text-foreground" />
                      }
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {vehicle.make && vehicle.model ?
                      `${vehicle.make} ${vehicle.model}` :
                      `Vehicle ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {e.stopPropagation();removeVehicle(vehicle.id);}}
                      className="text-muted-foreground hover:text-destructive p-1">
                      
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded &&
                <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                    {/* Type toggle */}
                    <div className="flex gap-2">
                      {(['car', 'motorcycle'] as const).map((t) =>
                    <button
                      key={t}
                      onClick={() => updateVehicle(vehicle.id, 'vehicleType', t)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      vehicle.vehicleType === t ?
                      'border-primary bg-primary/10 text-primary' :
                      'border-border/50 text-muted-foreground'}`
                      }>
                      
                          {t === 'car' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                          {t === 'car' ? 'Car' : 'Motorcycle'}
                        </button>
                    )}
                    </div>

                    {/* Core fields */}
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Make *" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.make} onChange={(e) => updateVehicle(vehicle.id, 'make', e.target.value)} />
                      <Input placeholder="Model" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.model} onChange={(e) => updateVehicle(vehicle.id, 'model', e.target.value)} />
                    </div>
                    <Input placeholder="Year" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.year} onChange={(e) => updateVehicle(vehicle.id, 'year', e.target.value)} />

                    {/* Optional fields */}
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Engine" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.engine} onChange={(e) => updateVehicle(vehicle.id, 'engine', e.target.value)} />
                      <Input placeholder="Horsepower" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.horsepower} onChange={(e) => updateVehicle(vehicle.id, 'horsepower', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Drivetrain" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.drivetrain} onChange={(e) => updateVehicle(vehicle.id, 'drivetrain', e.target.value)} />
                      <Input placeholder="Colour" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.colour} onChange={(e) => updateVehicle(vehicle.id, 'colour', e.target.value)} />
                    </div>
                    <Input placeholder="Modifications" className="rounded-xl h-11 text-sm bg-background border-border/50" value={vehicle.modifications} onChange={(e) => updateVehicle(vehicle.id, 'modifications', e.target.value)} />

                    {/* Image placeholder */}
                    <button className="w-full py-3 rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground flex items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                      <Camera className="w-4 h-4" /> Add Photo
                    </button>
                  </div>
                }
              </div>);

          })}

          {vehicles.length < 5 &&
          <button
            onClick={addVehicle}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-border/50 text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors">
            
              <Plus className="w-4 h-4" />
              {vehicles.length === 0 ? 'Add Vehicle' : 'Add another vehicle'}
            </button>
          }
        </div>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button onClick={handleNext} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={handleSkip} className="w-full text-sm text-muted-foreground mt-2 py-2">
          Skip for now
        </button>
        <button onClick={back} className="w-full text-xs text-muted-foreground/60 py-1">Back</button>
      </div>
    </div>);

};

export default GarageStep;