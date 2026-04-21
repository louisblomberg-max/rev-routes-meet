import { useRef, useState } from 'react';
import { Camera, ChevronRight, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOnboarding, TOTAL_ONBOARDING_STEPS } from '@/contexts/OnboardingContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ProfileStep = () => {
  const { data, updateData, next } = useOnboarding();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(data.avatarUrl);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    // Upload to Supabase storage
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in first');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error('Could not upload photo. Please try again.');
        setAvatarPreview(data.avatarUrl);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      updateData({ avatarUrl: publicUrl });
      setAvatarPreview(publicUrl);
    } catch {
      toast.error('Upload failed. Please try again.');
      setAvatarPreview(data.avatarUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) =>
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i === 0 ? 'bg-primary' : 'bg-black/10'}`} />
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-10 flex flex-col items-center">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2 animate-fade-up text-black">
          Set Up Your Profile
        </h1>
        <p className="text-sm text-center mb-10 animate-fade-up text-black/60">
          Tell the community a little about you.
        </p>

        {/* Avatar Upload */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-28 h-28 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center mb-8 relative group transition-all hover:border-primary/50 animate-scale-up bg-white">
          {avatarPreview ?
            <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" /> :
            <User className="w-10 h-10 text-black" />
          }
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

        {/* Bio */}
        <div className="w-full max-w-sm">
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-black/60">
            Short bio <span className="text-black/40">(optional)</span>
          </label>
          <Textarea
            placeholder="Car enthusiast. Weekend drives and track days."
            className="rounded-2xl bg-white text-black border-black/10 text-sm min-h-[100px] resize-none placeholder:text-black/40"
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            maxLength={160}
          />
          <p className="text-xs text-black/40 text-right mt-1">{data.bio.length}/160</p>
        </div>

        {/* Location */}
        <div className="w-full max-w-sm">
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-black/60">
            Location <span className="text-black/40">(optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <Input
              placeholder="London, UK"
              className="pl-11 rounded-2xl h-12 bg-white text-black border-black/10 text-sm placeholder:text-black/40"
              value={data.location}
              onChange={(e) => updateData({ location: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8 safe-bottom space-y-3">
        <Button onClick={next} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileStep;
