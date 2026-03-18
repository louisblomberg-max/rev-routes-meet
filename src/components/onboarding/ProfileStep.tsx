import { useRef } from 'react';
import { Camera, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOnboarding } from '@/contexts/OnboardingContext';

const ProfileStep = () => {
  const { data, updateData, next, back } = useOnboarding();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateData({ avatarUrl: url });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) =>
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-10 flex flex-col items-center bg-[#f3f3e8] text-black">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2 animate-fade-up text-black">
          Set Up Your RevNet Profile
        </h1>
        <p className="text-sm text-center mb-10 animate-fade-up text-black">
          Tell the community a little about you.
        </p>

        {/* Avatar Upload */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-28 h-28 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center mb-8 relative group transition-all hover:border-primary/50 animate-scale-up bg-white">
          
          {data.avatarUrl ?
          <img src={data.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" /> :

          <User className="w-10 h-10 bg-primary text-primary" />
          }
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

        {/* Bio */}
        <div className="w-full max-w-sm">
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-secondary">
            Short bio <span className="text-secondary">(optional)</span>
          </label>
          <Textarea
            placeholder="Car enthusiast. Weekend drives and track days."
            className="rounded-2xl bg-card border-border/50 text-sm min-h-[100px] resize-none"
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            maxLength={160} />
          
          <p className="text-xs text-muted-foreground/50 text-right mt-1">{data.bio.length}/160</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8 safe-bottom space-y-3">
        <Button onClick={next} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={back} className="w-full text-sm text-muted-foreground py-2">Back</button>
      </div>
    </div>);

};

export default ProfileStep;