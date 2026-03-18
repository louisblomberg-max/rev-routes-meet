import { useState, useMemo } from 'react';
import { Car, Bike, Search, ChevronRight, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VehicleFormData } from '@/models/vehicle';
import { CAR_BRANDS, MOTORCYCLE_BRANDS } from '@/models/vehicle';

interface Props {
  data: VehicleFormData;
  onChange: (patch: Partial<VehicleFormData>) => void;
  onNext: () => void;
}

const VehicleStepBasics = ({ data, onChange, onNext }: Props) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [showBrands, setShowBrands] = useState(false);

  const brands = data.vehicle_type === 'motorcycle' ? MOTORCYCLE_BRANDS : CAR_BRANDS;
  const filteredBrands = useMemo(
    () => brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase())),
    [brands, brandSearch]
  );

  const canContinue = data.brand.length > 0;

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex-1 flex flex-col px-5 py-6 gap-7 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Vehicle Type */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Vehicle Type
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'car' as const, label: 'Car', Icon: Car },
            { value: 'motorcycle' as const, label: 'Motorcycle', Icon: Bike },
          ]).map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => {
                onChange({ vehicle_type: value, brand: '', category: [] });
                setBrandSearch('');
              }}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                data.vehicle_type === value
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                data.vehicle_type === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`font-semibold text-sm ${
                data.vehicle_type === value ? 'text-foreground' : 'text-muted-foreground'
              }`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Brand
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search brand..."
            value={data.brand || brandSearch}
            onChange={(e) => {
              setBrandSearch(e.target.value);
              onChange({ brand: '' });
              setShowBrands(true);
            }}
            onFocus={() => setShowBrands(true)}
            className="pl-10 h-12 rounded-xl bg-card border-border text-foreground"
          />
        </div>
        {showBrands && !data.brand && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
            {filteredBrands.map(brand => (
              <button
                key={brand}
                onClick={() => { onChange({ brand }); setBrandSearch(''); setShowBrands(false); }}
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50 last:border-0"
              >
                {brand}
              </button>
            ))}
            {filteredBrands.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">No results</div>
            )}
          </div>
        )}
        {data.brand && (
          <button
            onClick={() => { onChange({ brand: '' }); setShowBrands(true); }}
            className="mt-2 text-xs text-primary font-medium"
          >
            Change brand
          </button>
        )}
      </div>

      {/* Model */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Model
        </Label>
        <Input
          placeholder={data.vehicle_type === 'motorcycle' ? 'e.g. MT-07' : 'e.g. M3 Competition'}
          value={data.model}
          onChange={(e) => onChange({ model: e.target.value })}
          className="h-12 rounded-xl bg-card border-border text-foreground"
        />
      </div>

      {/* Year */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Year
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="number"
            placeholder={String(currentYear)}
            min={1900}
            max={currentYear + 1}
            value={data.year ?? ''}
            onChange={(e) => onChange({ year: e.target.value ? Number(e.target.value) : null })}
            className="pl-10 h-12 rounded-xl bg-card border-border text-foreground"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!canContinue}
        className={`w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
          canContinue
            ? 'bg-primary text-primary-foreground shadow-lg hover:opacity-90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        Continue <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default VehicleStepBasics;
