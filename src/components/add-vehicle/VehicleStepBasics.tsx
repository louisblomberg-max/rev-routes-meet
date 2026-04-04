import { useState, useMemo, useRef } from 'react';
import { Car, Bike, Search, ChevronRight, Calendar, ImagePlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VehicleFormData } from '@/models/vehicle';
import { CAR_BRANDS, MOTORCYCLE_BRANDS } from '@/models/vehicle';
import { validateImageFile } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  data: VehicleFormData;
  onChange: (patch: Partial<VehicleFormData>) => void;
  onNext: () => void;
}

const VehicleStepBasics = ({ data, onChange, onNext }: Props) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [showBrands, setShowBrands] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brands = data.vehicle_type === 'motorcycle' ? MOTORCYCLE_BRANDS : CAR_BRANDS;
  const filteredBrands = useMemo(
    () => brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase())),
    [brands, brandSearch]
  );

  const canContinue = data.brand.length > 0;
  const currentYear = new Date().getFullYear();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const validationError = validateImageFile(file); if (validationError) { toast.error(validationError); e.target.value = ''; return; }
    }
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onChange({ images: [...data.images, reader.result as string] });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    onChange({ images: data.images.filter((_, i) => i !== idx) });
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 gap-7 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Photos */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Photos
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {data.images.map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border flex-shrink-0">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {data.images.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex-shrink-0"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[9px] font-medium">Add</span>
            </button>
          )}
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={String(currentYear)}
            value={data.year ?? ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              onChange({ year: val ? Number(val) : null });
            }}
            className="pl-10 h-12 rounded-xl bg-card border-border text-foreground [appearance:textfield]"
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
