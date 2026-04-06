import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
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
  const [negotiable, setNegotiable] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !category || !price) { toast.error('Please fill in title, category, and price'); return; }
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('marketplace_listings').insert({
      user_id: user.id, title: title.trim(), category, price: parseFloat(price),
      condition: condition || null, description: description.trim() || null,
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
