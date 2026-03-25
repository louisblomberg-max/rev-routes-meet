import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Settings, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useGarage } from '@/contexts/GarageContext';
import type { VehicleFormData } from '@/models/vehicle';
import { EMPTY_VEHICLE } from '@/models/vehicle';
import VehicleStepBasics from '@/components/add-vehicle/VehicleStepBasics';
import VehicleStepDetails from '@/components/add-vehicle/VehicleStepDetails';
import VehicleStepPersonalise from '@/components/add-vehicle/VehicleStepPersonalise';

const STEPS = [
  { label: 'Basics', Icon: Car },
  { label: 'Details', Icon: Settings },
  { label: 'Personalise', Icon: Sparkles },
] as const;

const AddVehicle = () => {
  const navigate = useNavigate();
  const { addVehicle } = useGarage();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<VehicleFormData>({ ...EMPTY_VEHICLE });
  const [isSaving, setIsSaving] = useState(false);

  const update = useCallback((patch: Partial<VehicleFormData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    // Map to GarageVehicle shape for existing context
    const vehicle = {
      userId: '',
      vehicleType: data.vehicle_type,
      make: data.brand,
      model: data.model,
      year: data.year ?? undefined,
      engine: data.engine || undefined,
      transmission: data.transmission as any,
      drivetrain: data.drivetrain as any,
      colour: '',
      mileage: undefined,
      tags: [...data.category, ...data.modifications],
      modsText: data.mods_text || data.modifications.join(', '),
      details: data.details || undefined,
      photos: data.images,
      visibility: data.visibility,
      isPrimary: data.is_active,
    };

    try {
      addVehicle(vehicle);
      toast.success('Vehicle added to your garage!');
      navigate('/my-garage');
    } catch {
      toast.error('Failed to save vehicle');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 safe-top">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Add Vehicle</h1>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-full h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-border'
              }`} />
              <div className="flex items-center gap-1">
                <s.Icon className={`w-3 h-3 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-semibold ${
                  i <= step ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step counter */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {step === 0 && (
          <VehicleStepBasics data={data} onChange={update} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <VehicleStepDetails data={data} onChange={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <VehicleStepPersonalise data={data} onChange={update} onSave={handleSave} onBack={() => setStep(1)} isSaving={isSaving} />
        )}
      </div>
    </div>
  );
};

export default AddVehicle;
