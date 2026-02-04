import { useState } from 'react';
import { ArrowLeft, Building, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AddService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Garage', 'Specialist', 'Parts', 'Detailing', 'Other'];

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a business name');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate saving
    setTimeout(() => {
      toast.success('Service submitted successfully!', {
        description: `${formData.name} is now pending review.`,
      });
      setIsSubmitting(false);
      navigate(-1);
    }, 500);
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Add Service</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-5 space-y-5 pb-8">
        <div className="space-y-2">
          <Label htmlFor="name">Business Name *</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              id="name" 
              placeholder="e.g. Euro Specialists Ltd" 
              className="pl-10" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category *</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  formData.category === cat
                    ? 'border-services bg-services/10 text-services'
                    : 'border-border hover:border-services hover:text-services'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              id="location" 
              placeholder="Search for address" 
              className="pl-10" 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          {/* Map Preview Placeholder */}
          <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Map picker</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="Phone number" 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input 
            id="website" 
            type="url" 
            placeholder="https://" 
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-services hover:bg-services/90 text-white h-12 text-base font-semibold"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Service'}
        </Button>
      </div>
    </div>
  );
};

export default AddService;
