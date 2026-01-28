import { ArrowLeft, Route, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AddRoute = () => {
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
          <h1 className="text-xl font-bold text-foreground">Add Route</h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 space-y-6 pb-8">
        <div className="space-y-2">
          <Label htmlFor="name">Route Name</Label>
          <Input id="name" placeholder="e.g. South Downs Scenic" />
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
          <Label>Route Type</Label>
          <div className="flex gap-2">
            {['Scenic', 'Twisty', 'Mixed'].map((type) => (
              <button
                key={type}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:border-routes hover:text-routes transition-colors"
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full bg-routes hover:bg-routes/90 text-routes-foreground">
          Save Route
        </Button>
      </div>
    </div>
  );
};

export default AddRoute;
