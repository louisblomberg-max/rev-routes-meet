import { ArrowLeft, Calendar, MapPin, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AddEvent = () => {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold text-foreground">Add Event</h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 space-y-6 pb-8">
        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input id="name" placeholder="e.g. Monthly Porsche Meet" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date & Time</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input id="date" type="datetime-local" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input id="location" placeholder="Search for a location" className="pl-10" />
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
            <Input id="vehicle" placeholder="e.g. All vehicles, Porsche Only" className="pl-10" />
          </div>
        </div>

        <Button className="w-full bg-events hover:bg-events/90 text-events-foreground">
          Create Event
        </Button>
      </div>
    </div>
  );
};

export default AddEvent;
