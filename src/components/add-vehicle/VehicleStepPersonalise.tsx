import { useState, useRef } from 'react';
import {
  Camera, X, Plus, Eye, Users, Lock, Check, Sparkles,
  Tag, ImagePlus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VehicleFormData } from '@/models/vehicle';
import { MOD_PRESETS, USAGE_OPTIONS } from '@/models/vehicle';

interface Props {
  data: VehicleFormData;
  onChange: (patch: Partial<VehicleFormData>) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
}

const VIS_OPTIONS = [
  { value: 'public' as const, label: 'Public', Icon: Eye },
  { value: 'friends' as const, label: 'Friends', Icon: Users },
  { value: 'private' as const, label: 'Private', Icon: Lock },
];

const VehicleStepPersonalise = ({ data, onChange, onSave, onBack, isSaving }: Props) => {
  const [customMod, setCustomMod] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleMod = (mod: string) => {
    const mods = data.modifications.includes(mod)
      ? data.modifications.filter(m => m !== mod)
      : [...data.modifications, mod];
    onChange({ modifications: mods });
  };

  const addCustomMod = () => {
    const trimmed = customMod.trim();
    if (trimmed && !data.modifications.includes(trimmed)) {
      onChange({ modifications: [...data.modifications, trimmed] });
    }
    setCustomMod('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
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
    <div className="flex-1 flex flex-col px-5 py-6 gap-7 animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
      {/* Nickname */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Nickname
        </Label>
        <Input
          placeholder='e.g. "Black Beast"'
          value={data.nickname}
          onChange={(e) => onChange({ nickname: e.target.value })}
          className="h-12 rounded-xl bg-card border-border text-foreground"
        />
      </div>

      {/* Description */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Description
        </Label>
        <Textarea
          placeholder="Tell the community about your build..."
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="min-h-[80px] rounded-xl bg-card border-border text-foreground resize-none"
        />
      </div>

      {/* Photos */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> Photos
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Show off your ride — add up to 6 photos
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
        <div className="grid grid-cols-3 gap-2">
          {data.images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
          {data.images.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px] font-medium">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Modifications */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" /> Modifications
        </Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {MOD_PRESETS.map(mod => {
            const active = data.modifications.includes(mod);
            return (
              <button
                key={mod}
                onClick={() => toggleMod(mod)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                }`}
              >
                {mod}
              </button>
            );
          })}
          {/* Custom mods added */}
          {data.modifications
            .filter(m => !MOD_PRESETS.includes(m as any))
            .map(mod => (
              <button
                key={mod}
                onClick={() => toggleMod(mod)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-primary bg-primary/10 text-primary transition-all flex items-center gap-1"
              >
                {mod} <X className="w-3 h-3" />
              </button>
            ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Custom mod..."
            value={customMod}
            onChange={(e) => setCustomMod(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomMod()}
            className="h-10 rounded-xl bg-card border-border text-foreground text-sm flex-1"
          />
          <button
            onClick={addCustomMod}
            disabled={!customMod.trim()}
            className="h-10 px-4 rounded-xl bg-muted text-foreground text-sm font-medium disabled:opacity-40 hover:bg-muted/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Usage */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Usage
        </Label>
        <div className="flex flex-wrap gap-2">
          {USAGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ usage: data.usage === value ? '' : value })}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                data.usage === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Visibility
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {VIS_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => onChange({ visibility: value })}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 ${
                data.visibility === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${data.visibility === value ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-semibold ${data.visibility === value ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Vehicle Toggle */}
      <div
        onClick={() => onChange({ is_active: !data.is_active })}
        className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card cursor-pointer"
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          data.is_active ? 'border-primary bg-primary' : 'border-muted-foreground/30'
        }`}>
          {data.is_active && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-foreground block">Set as active vehicle</span>
          <span className="text-xs text-muted-foreground">This will personalise your experience across RevNet</span>
        </div>
      </div>

      {/* Bottom buttons (sticky) */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background/95 backdrop-blur-sm border-t border-border z-20 safe-bottom">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 h-14 rounded-2xl font-semibold text-sm border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Back
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-[2] h-14 rounded-2xl font-semibold text-base bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleStepPersonalise;
