import { useRef } from 'react';
import { Plus, Trash2, ChevronRight, Check, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOnboarding, type OnboardingVehicle, TOTAL_ONBOARDING_STEPS } from '@/contexts/OnboardingContext';
import { TRANSMISSION_OPTIONS, DRIVETRAIN_OPTIONS } from '@/models/garage';

const emptyVehicle = (): OnboardingVehicle => ({
  id: crypto.randomUUID(),
  vehicleType: 'car',
  make: '', model: '', year: '', trim: '', engine: '',
  transmission: '', drivetrain: '', colour: '', mileage: '',
  numberPlate: '',
  tags: [], modsText: '',
  photos: [],
  visibility: 'public', isPrimary: false,
});

const GarageStep = () => {
  const { data, addVehicle, removeVehicle, updateVehicle, next, back } = useOnboarding();
  const photoRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Vehicles come directly from context — no local state
  const vehicles = data.vehicles;

  const handleAddVehicle = () => {
    if (vehicles.length >= 5) return;
    addVehicle(emptyVehicle());
  };

  const handleRemoveVehicle = (id: string) => removeVehicle(id);

  const handleUpdateVehicle = (id: string, field: keyof OnboardingVehicle, value: any) => {
    updateVehicle(id, field, value);
  };

  const compressImage = (file: File, maxSize = 400): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = url;
    });
  };

  const handlePhotoUpload = async (vehicleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    const newPhotos = [...vehicle.photos];
    for (const file of Array.from(files)) {
      const compressed = await compressImage(file);
      newPhotos.push(compressed);
    }
    updateVehicle(vehicleId, 'photos', newPhotos);
    e.target.value = '';
  };

  const removePhoto = (vehicleId: string, idx: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    updateVehicle(vehicleId, 'photos', vehicle.photos.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    console.log('[GarageStep] Proceeding with vehicles:', vehicles.length, vehicles.map(v => ({ make: v.make, model: v.model })));
    next();
  };

  const handleSkip = () => {
    // Clear vehicles if skipping
    next();
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) =>
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
          {vehicles.map((vehicle, idx) => (
            <div key={vehicle.id} className="bg-white rounded-2xl border border-black/10 overflow-hidden animate-fade-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                <span className="text-xs font-semibold text-black/50">Vehicle {idx + 1}</span>
                <button onClick={() => handleRemoveVehicle(vehicle.id)} className="text-red-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Photos */}
                <div>
                  <Label className="text-xs font-medium text-black/70 mb-2 block">Photos</Label>
                  <input ref={(el) => { photoRefs.current[vehicle.id] = el; }} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(vehicle.id, e)} />
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {vehicle.photos.map((img, pidx) => (
                      <div key={pidx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 flex-shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(vehicle.id, pidx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {vehicle.photos.length < 6 && (
                      <button onClick={() => photoRefs.current[vehicle.id]?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center gap-0.5 text-black/40 hover:border-primary/50 hover:text-primary transition-colors flex-shrink-0">
                        <ImagePlus className="w-5 h-5" />
                        <span className="text-[9px] font-medium">Add</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Make *</Label>
                    <Input placeholder="e.g. Porsche" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.make} onChange={(e) => handleUpdateVehicle(vehicle.id, 'make', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Model</Label>
                    <Input placeholder="e.g. 993 Turbo" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.model} onChange={(e) => handleUpdateVehicle(vehicle.id, 'model', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Year</Label>
                    <Input type="number" placeholder="1995" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.year} onChange={(e) => handleUpdateVehicle(vehicle.id, 'year', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Engine</Label>
                    <Input placeholder="3.6L" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.engine} onChange={(e) => handleUpdateVehicle(vehicle.id, 'engine', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Transmission</Label>
                    <select value={vehicle.transmission} onChange={(e) => handleUpdateVehicle(vehicle.id, 'transmission', e.target.value)} className="w-full rounded-xl h-11 text-sm bg-white border border-black/10 px-3 text-black">
                      <option value="">Select</option>
                      {TRANSMISSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Drivetrain</Label>
                    <select value={vehicle.drivetrain} onChange={(e) => handleUpdateVehicle(vehicle.id, 'drivetrain', e.target.value)} className="w-full rounded-xl h-11 text-sm bg-white border border-black/10 px-3 text-black">
                      <option value="">Select</option>
                      {DRIVETRAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Colour</Label>
                    <Input placeholder="Black" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.colour} onChange={(e) => handleUpdateVehicle(vehicle.id, 'colour', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/70">Number Plate</Label>
                    <Input placeholder="AB12 CDE" className="rounded-xl h-11 text-sm bg-white text-black border-black/10" value={vehicle.numberPlate} onChange={(e) => handleUpdateVehicle(vehicle.id, 'numberPlate', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-black/70">Details</Label>
                  <Textarea placeholder="Add further details..." value={vehicle.modsText} onChange={(e) => handleUpdateVehicle(vehicle.id, 'modsText', e.target.value)} className="rounded-xl min-h-[60px] text-sm bg-white text-black border-black/10" />
                </div>

                <div>
                  <Label className="text-xs font-medium text-black/70 mb-2 block">Visibility</Label>
                  <div className="flex gap-2 px-1">
                    {(['public', 'friends', 'private'] as const).map(vis => (
                      <button key={vis} onClick={() => handleUpdateVehicle(vehicle.id, 'visibility', vis)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize bg-white ${vehicle.visibility === vis ? 'border-2 border-primary text-primary' : 'border-black/10 text-black/40'}`}>
                        {vis}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={vehicle.isPrimary} onChange={(e) => {
                    if (e.target.checked) {
                      handleUpdateVehicle(vehicle.id, 'isPrimary', true);
                    } else {
                      handleUpdateVehicle(vehicle.id, 'isPrimary', false);
                    }
                  }} className="sr-only" />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${vehicle.isPrimary ? 'border-primary bg-primary' : 'border-black/20'}`}>
                    {vehicle.isPrimary && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-black">Set as primary vehicle</span>
                </label>
              </div>
            </div>
          ))}

          {vehicles.length < 5 && (
            <button onClick={handleAddVehicle} className="w-full py-4 rounded-2xl border-2 border-dashed border-black/20 text-sm font-semibold text-black/50 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors">
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
        <button onClick={handleSkip} className="w-full text-sm text-black/50 mt-2 py-2">Skip for now</button>
        <button onClick={back} className="w-full text-xs text-black/40 py-1">Back</button>
      </div>
    </div>
  );
};

export default GarageStep;
