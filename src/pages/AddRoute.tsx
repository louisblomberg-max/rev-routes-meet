import { useState } from 'react';
import { ArrowLeft, Route, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AddRoute = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a route name');
      return;
    }
    if (!formData.type) {
      toast.error('Please select a route type');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate saving
    setTimeout(() => {
      toast.success('Route saved successfully!', {
        description: formData.name,
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
            <h1 className="text-lg font-bold text-foreground">Add Route</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-5 space-y-5 pb-8">
        <div className="space-y-2">
          <Label htmlFor="name">Route Name *</Label>
          <Input 
            id="name" 
            placeholder="e.g. South Downs Scenic" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Map Drawing Area */}
        <div className="space-y-2">
          <Label>Draw Route</Label>
          <div className="h-64 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
            <Route className="w-10 h-10 text-muted-foreground/50" />
            <span className="text-muted-foreground text-sm">Tap to draw your route on the map</span>
            <span className="text-muted-foreground text-xs">Routes auto-snap to roads</span>
          </div>
        </div>

        {/* Distance (auto-calculated) */}
        <div className="space-y-2">
          <Label>Distance</Label>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Ruler className="w-5 h-5 text-routes" />
            <span className="text-muted-foreground">Distance will be calculated automatically</span>
          </div>
        </div>

        {/* Route Type */}
        <div className="space-y-2">
          <Label>Route Type *</Label>
          <div className="flex gap-2">
            {['Scenic', 'Twisty', 'Mixed'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  formData.type === type
                    ? 'border-routes bg-routes/10 text-routes'
                    : 'border-border hover:border-routes hover:text-routes'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-routes hover:bg-routes/90 text-white h-12 text-base font-semibold"
        >
          {isSubmitting ? 'Saving...' : 'Save Route'}
        </Button>
      </div>
    </div>
  );
};

export default AddRoute;
