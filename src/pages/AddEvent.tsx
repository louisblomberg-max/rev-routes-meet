import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AddEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    vehicleType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an event name');
      return;
    }
    if (!formData.date) {
      toast.error('Please select a date and time');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate saving
    setTimeout(() => {
      toast.success('Event created successfully!', {
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
            <h1 className="text-lg font-bold text-foreground">Add Event</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-5 space-y-5 pb-8">
        <div className="space-y-2">
          <Label htmlFor="name">Event Name *</Label>
          <Input 
            id="name" 
            placeholder="e.g. Monthly Porsche Meet" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date & Time *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              id="date" 
              type="datetime-local" 
              className="pl-10" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              id="location" 
              placeholder="Search for a location" 
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
          <Label htmlFor="vehicle">Vehicle Type</Label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              id="vehicle" 
              placeholder="e.g. All vehicles, Porsche Only" 
              className="pl-10" 
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-events hover:bg-events/90 text-white h-12 text-base font-semibold"
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
};

export default AddEvent;
