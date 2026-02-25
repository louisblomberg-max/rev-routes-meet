import { useState } from 'react';
import { ArrowLeft, Building, Phone, Globe, Camera, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import LocationPicker from '@/components/LocationPicker';

const SERVICE_CATEGORIES = ['Mechanic', 'Detailing', 'Parts', 'Tyres', 'MOT', 'Tuning', 'Bodywork', 'Car Wash', 'Fuel', 'EV Charging'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const COUNTRY_CODES = [
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+353', label: '🇮🇪 +353' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+34', label: '🇪🇸 +34' },
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+31', label: '🇳🇱 +31' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+81', label: '🇯🇵 +81' },
];

interface DayHours {
  open: boolean;
  openTime: string;
  closeTime: string;
}

const defaultDayHours = (): Record<string, DayHours> => {
  const hours: Record<string, DayHours> = {};
  DAYS.forEach(day => {
    hours[day] = {
      open: day !== 'Sunday',
      openTime: '09:00',
      closeTime: '17:30',
    };
  });
  return hours;
};

const AddService = () => {
  const navigate = useNavigate();
  const { services: servicesRepo, state } = useData();
  const currentUser = state.currentUser;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    phone: '',
    countryCode: '+44',
    website: '',
    is24h: false,
  });
  const [dayHours, setDayHours] = useState<Record<string, DayHours>>(defaultDayHours);
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

  const formatOpeningHours = (): string => {
    if (formData.is24h) return '24 Hours';
    return DAYS
      .map(day => {
        const h = dayHours[day];
        return `${day.slice(0, 3)}: ${h.open ? `${h.openTime}-${h.closeTime}` : 'Closed'}`;
      })
      .join(', ');
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
        openingHours: formatOpeningHours(),
        phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : '',
        address: formData.location.trim(),
        isOpen: true,
        priceRange: '$$',
        lat: formData.locationCoords?.lat,
        lng: formData.locationCoords?.lng,
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

  const update = (field: string, value: string | boolean | { lat: number; lng: number } | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateDayHours = (day: string, field: keyof DayHours, value: string | boolean) => {
    setDayHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
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

        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Business Name *</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="name" placeholder="e.g. Euro Specialists Ltd" className="pl-10" value={formData.name} onChange={e => update('name', e.target.value)} />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Description */}
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

        {/* Location - using LocationPicker */}
        <div className="space-y-2">
          <Label>Location *</Label>
          <LocationPicker
            value={formData.location}
            onChange={(loc, coords) => {
              update('location', loc);
              update('locationCoords', coords);
            }}
            error={errors.location}
          />
        </div>

        {/* Opening Hours */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Opening Hours
            </Label>
          </div>

          {/* 24h toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
            <p className="text-sm font-medium text-foreground">Open 24 Hours</p>
            <Switch checked={formData.is24h} onCheckedChange={v => update('is24h', v)} />
          </div>

          {/* Day-by-day hours */}
          {!formData.is24h && (
            <div className="space-y-1.5">
              {DAYS.map(day => {
                const h = dayHours[day];
                return (
                  <div key={day} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-card">
                    <div className="w-10 flex-shrink-0">
                      <span className="text-xs font-semibold text-foreground">{day.slice(0, 3)}</span>
                    </div>
                    <Switch
                      checked={h.open}
                      onCheckedChange={v => updateDayHours(day, 'open', v)}
                      className="scale-75"
                    />
                    {h.open ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <Input
                          type="time"
                          value={h.openTime}
                          onChange={e => updateDayHours(day, 'openTime', e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                        <span className="text-xs text-muted-foreground">–</span>
                        <Input
                          type="time"
                          value={h.closeTime}
                          onChange={e => updateDayHours(day, 'closeTime', e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phone with country code */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="flex gap-2">
            <Select value={formData.countryCode} onValueChange={v => update('countryCode', v)}>
              <SelectTrigger className="w-28 flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map(cc => (
                  <SelectItem key={cc.code} value={cc.code}>
                    {cc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                className="pl-10"
                value={formData.phone}
                onChange={e => update('phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Website */}
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
