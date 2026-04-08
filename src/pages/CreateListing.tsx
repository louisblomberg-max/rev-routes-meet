import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const CATEGORIES = ['Cars', 'Bikes', 'Parts', 'Wheels', 'Gear', 'Accessories'];
const CONDITIONS = ['New', 'Excellent', 'Good', 'Fair', 'Poor'];

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photoFiles.length + files.length > 8) { toast.error('Maximum 8 photos'); return; }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB per photo'); return; }
      const reader = new FileReader();
      reader.onload = (r) => setPhotoPreviews(p => [...p, r.target?.result as string]);
      reader.readAsDataURL(file);
      setPhotoFiles(p => [...p, file]);
    }
    e.target.value = '';
  };

  const removePhoto = (i: number) => {
    setPhotoFiles(p => p.filter((_, idx) => idx !== i));
    setPhotoPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category || !price) { toast.error('Please fill in title, category, and price'); return; }
    if (!user?.id) return;
    setSaving(true);

    // Upload photos
    const photoUrls: string[] = [];
    for (const file of photoFiles) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: ue } = await supabase.storage.from('marketplace').upload(path, file, { upsert: true, contentType: file.type || 'image/heic' });
      if (!ue) {
        const { data: u } = supabase.storage.from('marketplace').getPublicUrl(path);
        photoUrls.push(u.publicUrl);
      }
    }

    const { error } = await supabase.from('marketplace_listings').insert({
      user_id: user.id, title: title.trim(), category, price: parseFloat(price),
      condition: condition || null, description: description.trim() || null,
      photos: photoUrls.length > 0 ? photoUrls : null,
      status: 'active',
    });
    if (error) { toast.error('Failed to create listing'); setSaving(false); return; }
    toast.success('Listing created!');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-3 safe-top flex items-center gap-3 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="font-bold">Sell Something</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {/* Photos */}
        <div>
          <Label>Photos (up to 8)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {photoPreviews.map((preview, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/50">
                <img src={preview} className="w-full h-full object-cover" alt="" />
                <button onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white text-xs"><X className="w-3 h-3" /></button>
              </div>
            ))}
            {photoPreviews.length < 8 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" /><span className="text-[9px] text-muted-foreground mt-1">Add</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple className="hidden" onChange={handlePhotos} />
              </label>
            )}
          </div>
        </div>

        <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you selling?" /></div>
        <div><Label>Category *</Label>
          <div className="flex flex-wrap gap-2 mt-1">{CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${category === c ? 'bg-foreground text-background border-foreground' : 'border-border/50'}`}>{c}</button>
          ))}</div>
        </div>
        <div><Label>Price (£) *</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" min="0" /></div>
        <div><Label>Condition</Label>
          <div className="flex flex-wrap gap-2 mt-1">{CONDITIONS.map(c => (
            <button key={c} onClick={() => setCondition(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${condition === c ? 'bg-foreground text-background border-foreground' : 'border-border/50'}`}>{c}</button>
          ))}</div>
        </div>
        <div><Label>Description</Label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your item..." className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-background min-h-[100px] resize-none" /></div>
        <Button onClick={handleSubmit} disabled={saving} className="w-full h-11 rounded-xl" style={{ backgroundColor: '#d30d37' }}>
          {saving ? 'Creating...' : 'Publish Listing'}
        </Button>
      </div>
    </div>
  );
};

export default CreateListing;
