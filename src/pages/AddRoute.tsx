import { useState } from 'react';
import { ArrowLeft, Route, Ruler, Camera, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ROUTE_TYPES = ['Scenic', 'Coastal', 'Off-road', 'Twisty', 'Urban', 'Track', 'Mixed'];
const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const SURFACE_TYPES = ['Paved', 'Gravel', 'Dirt', 'Mixed'];

const AddRoute = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    difficulty: '',
    surface: '',
    estimatedDuration: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Route name is required';
    if (!formData.type) errs.type = 'Select a route type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = () => {
    toast.info('Image upload will connect to storage');
    setImages(prev => [...prev, `placeholder-${prev.length + 1}`]);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Route saved successfully!', { description: formData.name });
      setIsSubmitting(false);
      navigate(-1);
    }, 500);
  };

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Add Route</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-8">
        {/* Photos */}
        <div className="space-y-2">
          <Label>Photos</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((_, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button onClick={handleImageUpload} className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex-shrink-0 flex flex-col items-center justify-center gap-1 hover:border-routes/50 transition-colors">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Route Name *</Label>
          <Input id="name" placeholder="e.g. South Downs Scenic" value={formData.name} onChange={e => update('name', e.target.value)} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe the route, highlights, and tips..." rows={3} value={formData.description} onChange={e => update('description', e.target.value)} />
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

        {/* Distance */}
        <div className="space-y-2">
          <Label>Distance</Label>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Ruler className="w-5 h-5 text-routes" />
            <span className="text-muted-foreground text-sm">Calculated automatically from drawn route</span>
          </div>
        </div>

        {/* Route Type */}
        <div className="space-y-2">
          <Label>Route Type *</Label>
          <div className="flex flex-wrap gap-2">
            {ROUTE_TYPES.map(type => (
              <button key={type} onClick={() => update('type', type)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  formData.type === type ? 'border-routes bg-routes/10 text-routes' : 'border-border hover:border-routes/50'
                }`}>
                {type}
              </button>
            ))}
          </div>
          {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map(level => (
              <button key={level} onClick={() => update('difficulty', level)}
                className={`flex-1 px-2 py-2 rounded-lg border text-xs font-medium transition-colors text-center ${
                  formData.difficulty === level ? 'border-routes bg-routes/10 text-routes' : 'border-border hover:border-routes/50'
                }`}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Surface */}
        <div className="space-y-2">
          <Label>Surface</Label>
          <div className="flex gap-2">
            {SURFACE_TYPES.map(type => (
              <button key={type} onClick={() => update('surface', type)}
                className={`flex-1 px-2 py-2 rounded-lg border text-xs font-medium transition-colors text-center ${
                  formData.surface === type ? 'border-routes bg-routes/10 text-routes' : 'border-border hover:border-routes/50'
                }`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Estimated Duration</Label>
          <div className="flex gap-2">
            {['< 1h', '1-2h', '2-4h', '4+ h'].map(d => (
              <button key={d} onClick={() => update('estimatedDuration', d)}
                className={`flex-1 px-2 py-2 rounded-lg border text-xs font-medium transition-colors text-center ${
                  formData.estimatedDuration === d ? 'border-routes bg-routes/10 text-routes' : 'border-border hover:border-routes/50'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-routes hover:bg-routes/90 text-routes-foreground h-12 text-base font-semibold">
          {isSubmitting ? 'Saving...' : 'Save Route'}
        </Button>
      </div>
    </div>
  );
};

export default AddRoute;
