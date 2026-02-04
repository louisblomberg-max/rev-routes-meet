import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AddClub = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    type: '',
    brand: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a club name');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please add a description');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate saving
    setTimeout(() => {
      toast.success('Club created successfully!', {
        description: formData.name,
      });
      setIsSubmitting(false);
      navigate('/clubs');
    }, 500);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Create Club</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Cover Photo Placeholder */}
        <div className="aspect-[21/9] bg-clubs-light rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-clubs/30 cursor-pointer hover:bg-clubs-light/80 transition-colors">
          <Camera className="w-8 h-8 text-clubs" />
          <span className="text-sm text-clubs font-medium">Add Cover Photo</span>
        </div>

        {/* Club Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Club Name</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="e.g., Porsche Enthusiasts UK"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Textarea
            placeholder="Tell people what your club is about..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="e.g., London, UK"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Club Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Club Type</label>
          <div className="flex gap-2 flex-wrap">
            {['Local', 'Regional', 'Nationwide'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.type === type
                    ? 'bg-clubs text-clubs-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Focus */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Brand Focus (optional)</label>
          <div className="flex gap-2 flex-wrap">
            {['Porsche', 'BMW', 'Mercedes', 'JDM', 'Classic', 'All Brands'].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setFormData({ ...formData, brand })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  formData.brand === brand
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-clubs hover:bg-clubs/90 text-white h-12 text-base font-semibold"
          >
            {isSubmitting ? 'Creating...' : 'Create Club'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddClub;
