import { ArrowLeft, Building, MapPin, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AddService = () => {
  const navigate = useNavigate();

  const categories = ['Garage', 'Specialist', 'Parts', 'Detailing', 'Other'];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 safe-top">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Add Service</h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 space-y-6 pb-8">
        <div className="space-y-2">
          <Label htmlFor="name">Business Name</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input id="name" placeholder="e.g. Euro Specialists Ltd" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:border-services hover:text-services transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input id="location" placeholder="Search for address" className="pl-10" />
          </div>
          {/* Map Preview Placeholder */}
          <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Map picker</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" placeholder="Phone number" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input id="website" type="url" placeholder="https://" />
        </div>

        <Button className="w-full bg-services hover:bg-services/90 text-services-foreground">
          Submit Service
        </Button>
      </div>
    </div>
  );
};

export default AddService;
