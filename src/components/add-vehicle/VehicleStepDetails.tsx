import { Cog, CircleDot, Gauge, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VehicleFormData } from '@/models/vehicle';
import {
  TRANSMISSION_TYPES, DRIVETRAIN_TYPES,
  CAR_CATEGORIES, MOTORCYCLE_CATEGORIES,
} from '@/models/vehicle';

interface Props {
  data: VehicleFormData;
  onChange: (patch: Partial<VehicleFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SelectChips = ({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: readonly { value: string; label: string }[] | readonly string[];
  value: string | string[];
  onChange: (v: any) => void;
  multi?: boolean;
}) => {
  const items = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  const selected = Array.isArray(value) ? value : [value];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ value: v, label }) => {
        const active = selected.includes(v);
        return (
          <button
            key={v}
            onClick={() => {
              if (multi) {
                const next = active ? selected.filter(s => s !== v) : [...selected, v];
                onChange(next);
              } else {
                onChange(active ? '' : v);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground/40'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

const VehicleStepDetails = ({ data, onChange, onNext, onBack }: Props) => {
  const categories = data.vehicle_type === 'motorcycle'
    ? MOTORCYCLE_CATEGORIES.map(c => ({ value: c, label: c }))
    : CAR_CATEGORIES.map(c => ({ value: c, label: c }));

  return (
    <div className="flex-1 flex flex-col px-5 py-6 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Transmission */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Cog className="w-3.5 h-3.5" /> Transmission
        </Label>
        <SelectChips options={TRANSMISSION_TYPES} value={data.transmission} onChange={(v: string) => onChange({ transmission: v })} />
      </div>

      {/* Drivetrain (car only) */}
      {data.vehicle_type === 'car' && (
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5" /> Drivetrain
          </Label>
          <SelectChips options={DRIVETRAIN_TYPES} value={data.drivetrain} onChange={(v: string) => onChange({ drivetrain: v })} />
        </div>
      )}

      {/* Engine */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5" /> Engine
        </Label>
        <Input
          placeholder="e.g. 2.0L Turbo, V8, Electric"
          value={data.engine}
          onChange={(e) => onChange({ engine: e.target.value })}
          className="h-12 rounded-xl bg-card border-border text-foreground"
        />
      </div>

      {/* Category / Style */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Category / Style
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          This helps personalise events, routes and services for you
        </p>
        <SelectChips
          options={categories}
          value={data.category}
          onChange={(v: string[]) => onChange({ category: v })}
          multi
        />
      </div>

      <div className="flex-1" />

      {/* Bottom buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 h-14 rounded-2xl font-semibold text-sm border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] h-14 rounded-2xl font-semibold text-base bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          Continue <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VehicleStepDetails;
