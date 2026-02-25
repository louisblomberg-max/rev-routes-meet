import { useState } from 'react';
import { ArrowLeft, Building, MapPin, Phone, Globe, Camera, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

const SERVICE_CATEGORIES = ['Mechanic', 'Detailing', 'Parts', 'Tyres', 'MOT', 'Tuning', 'Bodywork', 'Car Wash', 'Fuel', 'EV Charging'];

const AddService = () => {
  const navigate = useNavigate();
  const { services: servicesRepo, state } = useData();
  const currentUser = state.currentUser;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    phone: '',
    website: '',
    openingHours: '',
    is24h: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Business name is required';
    if (!formData.category) errs.category = 'Select a category';
    if (!formData.location.trim()) errs.location = 'Location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = () => {
    toast.info('Image upload will connect to storage');
    setImages(prev => [...prev, `placeholder-${prev.length + 1}`]);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (!currentUser) {
      toast.error('You must be logged in to add a service');
      return;
    }

    setIsSubmitting(true);

    try {
      servicesRepo.create({
        name: formData.name.trim(),
        category: formData.category,
        serviceTypes: [formData.category],
        rating: 0,
        distance: '0 mi',
        reviewCount: 0,
        openingHours: formData.is24h ? '24 Hours' : (formData.openingHours || 'Not specified'),
        phone: formData.phone || '',
        address: formData.location.trim(),
        isOpen: true,
        priceRange: '$$',
        createdBy: currentUser.id,
      });

      toast.success('Service added successfully!', { description: `${formData.name} is now listed.` });
      navigate('/services');
    } catch {
      toast.error('Failed to add service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: string | boolean) => {
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
          <h1 className="text-lg font-bold text-foreground">Add Service</h1>
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
            <button onClick={handleImageUpload} className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex-shrink-0 flex flex-col items-center justify-center gap-1 hover:border-services/50 transition-colors">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Business Name *</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="name" placeholder="e.g. Euro Specialists Ltd" className="pl-10" value={formData.name} onChange={e => update('name', e.target.value)} />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="What services do you offer?" rows={3} value={formData.description} onChange={e => update('description', e.target.value)} />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => update('category', cat)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  formData.category === cat ? 'border-services bg-services/10 text-services' : 'border-border hover:border-services/50'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="location" placeholder="Search for address" className="pl-10" value={formData.location} onChange={e => update('location', e.target.value)} />
          </div>
          {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
          <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Map picker</span>
          </div>
        </div>

        {/* Opening hours */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Open 24 Hours</p>
            </div>
          </div>
          <Switch checked={formData.is24h} onCheckedChange={v => update('is24h', v)} />
        </div>
        {!formData.is24h && (
          <div className="space-y-2">
            <Label htmlFor="hours">Opening Hours</Label>
            <Input id="hours" placeholder="e.g. Mon-Fri 8am-6pm" value={formData.openingHours} onChange={e => update('openingHours', e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="phone" type="tel" placeholder="Phone number" className="pl-10" value={formData.phone} onChange={e => update('phone', e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="website" type="url" placeholder="https://" className="pl-10" value={formData.website} onChange={e => update('website', e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-services hover:bg-services/90 text-services-foreground h-12 text-base font-semibold">
          {isSubmitting ? 'Submitting...' : 'Submit Service'}
        </Button>
      </div>
    </div>
  );
};

export default AddService;
