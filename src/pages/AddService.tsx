import { useState } from 'react';
import { ArrowLeft, Building, Phone, Globe, Camera, X, Clock, MapPin, Image, Upload, Instagram, Facebook, ChevronDown, Lock, Star, Zap, Shield, Copy, AlertCircle, Crown } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { usePlan } from '@/contexts/PlanContext';
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

const PRICE_RANGES = ['£', '££', '£££', '££££'];

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

// ── Section Card wrapper ──
const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-card p-5 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-xl bg-services/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-services" />
    </div>
    <h2 className="text-base font-bold text-foreground">{children}</h2>
  </div>
);

const AddService = () => {
  const navigate = useNavigate();
  const { services: servicesRepo, state } = useData();
  const { hasAccess, getPlanLabel } = usePlan();
  const currentUser = state.currentUser;

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    categories: [] as string[],
    location: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    phone: '',
    countryCode: '+44',
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    bookingLink: '',
    is24h: false,
    isEmergency: false,
    hideAddress: false,
    serviceType: 'fixed' as 'fixed' | 'mobile',
    serviceRadius: 15,
    priceRange: '',
    vatRegistered: false,
    companyNumber: '',
    insuranceVerified: false,
  });
  const [dayHours, setDayHours] = useState<Record<string, DayHours>>(defaultDayHours);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Plan gate: require Club / Business plan
  if (!hasAccess('create_services')) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
          <div className="px-4 py-3 flex items-center gap-3">
            <BackButton className="w-10 h-10 rounded-xl bg-muted/80 hover:bg-muted" />
            <h1 className="text-lg font-bold text-foreground">Add Service</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-services/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-services" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Club / Business Plan Required</h2>
          <p className="text-sm text-muted-foreground">
            Publishing service listings requires the {getPlanLabel('club')} plan (£6.99/mo).
          </p>
          <Button onClick={() => navigate('/upgrade')} className="mt-2 gap-2">
            <Crown className="w-4 h-4" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  const isFormValid = formData.name.trim() && formData.categories.length > 0 && formData.location.trim() && logoImage;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Business name is required';
    if (formData.categories.length === 0) errs.category = 'Select at least one category';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!logoImage) errs.logo = 'Business logo is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogoUpload = () => {
    toast.info('Logo upload will connect to storage');
    setLogoImage('logo-placeholder');
    setErrors(prev => ({ ...prev, logo: '' }));
  };

  const handleCoverUpload = () => {
    toast.info('Cover upload will connect to storage');
    setCoverImage('cover-placeholder');
  };

  const handleGalleryUpload = () => {
    toast.info('Image upload will connect to storage');
    setGalleryImages(prev => [...prev, `gallery-${prev.length + 1}`]);
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

  const copyMondayToWeekdays = () => {
    const mon = dayHours['Monday'];
    setDayHours(prev => {
      const updated = { ...prev };
      ['Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        updated[day] = { ...mon };
      });
      return updated;
    });
    toast.success('Monday hours copied to weekdays');
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
        category: formData.categories[0],
        serviceTypes: formData.categories,
        rating: 0,
        distance: '0 mi',
        reviewCount: 0,
        openingHours: formatOpeningHours(),
        phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : '',
        address: formData.location.trim(),
        isOpen: true,
        priceRange: formData.priceRange || '$$',
        lat: formData.locationCoords?.lat,
        lng: formData.locationCoords?.lng,
        createdBy: currentUser.id,
        visibility: (formData as any).visibility || 'public',
        tags: formData.categories.map((c: string) => c.toLowerCase()),
      });

      toast.success('Service published — shown on map', { description: `${formData.name} is now listed.` });
      navigate('/', { state: { centerOn: { lat: formData.locationCoords?.lat, lng: formData.locationCoords?.lng }, category: 'services' } });
    } catch {
      toast.error('Failed to add service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
    setErrors(prev => ({ ...prev, category: '' }));
  };

  const updateDayHours = (day: string, field: keyof DayHours, value: string | boolean) => {
    setDayHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-10 h-10 rounded-xl bg-muted/80 hover:bg-muted" />
          <h1 className="text-lg font-bold text-foreground">Add Service</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-28">

        {/* ── 2. MEDIA SECTION ── */}
        <SectionCard>
          <SectionTitle icon={Camera}>Media</SectionTitle>
          <div className="space-y-4">
            {/* Logo */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Business Logo *</Label>
              {logoImage ? (
                <div className="relative w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                  <Building className="w-8 h-8 text-muted-foreground" />
                  <button onClick={() => { setLogoImage(null); }} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={handleLogoUpload} className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:border-services/50 transition-colors bg-muted/30">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">Add Logo</span>
                </button>
              )}
              {errors.logo && <p className="text-xs text-destructive mt-1">{errors.logo}</p>}
            </div>

            {/* Cover Image */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Cover Image</Label>
              {coverImage ? (
                <div className="relative w-full h-32 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <button onClick={() => setCoverImage(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={handleCoverUpload} className="w-full h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:border-services/50 transition-colors bg-muted/30">
                  <Image className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Add Cover Image</span>
                </button>
              )}
            </div>

            {/* Gallery */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Additional Photos</Label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((_, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center border border-border/50">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <button onClick={() => setGalleryImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                <button onClick={handleGalleryUpload} className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex-shrink-0 flex flex-col items-center justify-center gap-0.5 hover:border-services/50 transition-colors bg-muted/30">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Add</span>
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 3. BUSINESS INFO ── */}
        <SectionCard>
          <SectionTitle icon={Building}>Business Info</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">Business Name *</Label>
              <Input id="name" placeholder="e.g. Euro Specialists Ltd" value={formData.name} onChange={e => update('name', e.target.value)} className="rounded-xl h-11" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagline" className="text-xs text-muted-foreground">Tagline</Label>
              <Input id="tagline" placeholder="BMW & Audi Performance Specialists" maxLength={80} value={formData.tagline} onChange={e => update('tagline', e.target.value)} className="rounded-xl h-11" />
              <p className="text-[10px] text-muted-foreground text-right">{formData.tagline.length}/80</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
              <Textarea id="description" placeholder="What services do you offer?" rows={3} value={formData.description} onChange={e => update('description', e.target.value)} className="rounded-xl" />
            </div>
          </div>
        </SectionCard>

        {/* ── 4. CATEGORIES ── */}
        <SectionCard>
          <SectionTitle icon={Star}>Category</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  formData.categories.includes(cat)
                    ? 'bg-services text-services-foreground border-services shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-services/40'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-destructive mt-2">{errors.category}</p>}
        </SectionCard>

        {/* ── 5. LOCATION ── */}
        <SectionCard>
          <SectionTitle icon={MapPin}>Location</SectionTitle>
          <div className="space-y-3">
            <LocationPicker
              value={formData.location}
              onChange={(loc, coords) => {
                update('location', loc);
                update('locationCoords', coords);
              }}
              error={errors.location}
            />
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Hide exact address (mobile service)</span>
              </div>
              <Switch checked={formData.hideAddress} onCheckedChange={v => update('hideAddress', v)} />
            </div>
          </div>
        </SectionCard>

        {/* ── 6. SERVICE TYPE ── */}
        <SectionCard>
          <SectionTitle icon={Building}>Service Type</SectionTitle>
          <div className="space-y-4">
            <div className="flex rounded-xl border border-border/50 overflow-hidden">
              <button
                onClick={() => update('serviceType', 'fixed')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                  formData.serviceType === 'fixed'
                    ? 'bg-services text-services-foreground'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Fixed Location
              </button>
              <button
                onClick={() => update('serviceType', 'mobile')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                  formData.serviceType === 'mobile'
                    ? 'bg-services text-services-foreground'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Mobile Service
              </button>
            </div>
            {formData.serviceType === 'mobile' && (
              <div className="space-y-2 animate-fade-up">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Service Radius</Label>
                  <span className="text-xs font-semibold text-services">{formData.serviceRadius} miles</span>
                </div>
                <Slider
                  value={[formData.serviceRadius]}
                  onValueChange={([v]) => update('serviceRadius', v)}
                  min={5}
                  max={50}
                  step={5}
                  className="py-2"
                />
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── 7. OPENING HOURS ── */}
        <SectionCard>
          <SectionTitle icon={Clock}>Opening Hours</SectionTitle>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
              <span className="text-xs font-medium text-foreground">Open 24 Hours</span>
              <Switch checked={formData.is24h} onCheckedChange={v => update('is24h', v)} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-services" />
                <span className="text-xs font-medium text-foreground">24/7 Emergency Callout</span>
              </div>
              <Switch checked={formData.isEmergency} onCheckedChange={v => update('isEmergency', v)} />
            </div>

            {!formData.is24h && (
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={copyMondayToWeekdays} className="w-full rounded-xl text-xs gap-2 h-9">
                  <Copy className="w-3.5 h-3.5" />
                  Copy Monday to all weekdays
                </Button>
                <div className="space-y-1.5">
                  {DAYS.map(day => {
                    const h = dayHours[day];
                    return (
                      <div key={day} className="flex items-center gap-2 p-2.5 rounded-xl border border-border/30 bg-muted/20">
                        <div className="w-10 flex-shrink-0">
                          <span className="text-xs font-semibold text-foreground">{day.slice(0, 3)}</span>
                        </div>
                        <Switch checked={h.open} onCheckedChange={v => updateDayHours(day, 'open', v)} className="scale-75" />
                        {h.open ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <Input type="time" value={h.openTime} onChange={e => updateDayHours(day, 'openTime', e.target.value)} className="h-8 text-xs flex-1 rounded-lg" />
                            <span className="text-xs text-muted-foreground">–</span>
                            <Input type="time" value={h.closeTime} onChange={e => updateDayHours(day, 'closeTime', e.target.value)} className="h-8 text-xs flex-1 rounded-lg" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── 8. CONTACT INFO ── */}
        <SectionCard>
          <SectionTitle icon={Phone}>Contact Info</SectionTitle>
          <div className="space-y-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <div className="flex gap-2">
                <Select value={formData.countryCode} onValueChange={v => update('countryCode', v)}>
                  <SelectTrigger className="w-[100px] flex-shrink-0 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map(cc => (
                      <SelectItem key={cc.code} value={cc.code}>{cc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="tel" placeholder="Phone number" value={formData.phone} onChange={e => update('phone', e.target.value)} className="rounded-xl h-11" />
              </div>
            </div>
            {/* Website */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="url" placeholder="https://" className="pl-10 rounded-xl h-11" value={formData.website} onChange={e => update('website', e.target.value)} />
              </div>
            </div>
            {/* Instagram */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="@username" className="pl-10 rounded-xl h-11" value={formData.instagram} onChange={e => update('instagram', e.target.value)} />
              </div>
            </div>
            {/* Facebook */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Facebook</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Page URL" className="pl-10 rounded-xl h-11" value={formData.facebook} onChange={e => update('facebook', e.target.value)} />
              </div>
            </div>
            {/* TikTok */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">TikTok</Label>
              <Input placeholder="@username" className="rounded-xl h-11" value={formData.tiktok} onChange={e => update('tiktok', e.target.value)} />
            </div>
            {/* Booking Link */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Booking Link</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="url" placeholder="https://booking..." className="pl-10 rounded-xl h-11" value={formData.bookingLink} onChange={e => update('bookingLink', e.target.value)} />
              </div>
            </div>
          </div>
        </SectionCard>


        {/* ── 10. BUSINESS DETAILS (Collapsible) ── */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SectionCard>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <SectionTitle icon={Shield}>Business Details</SectionTitle>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
                  <span className="text-xs font-medium text-foreground">VAT Registered</span>
                  <Switch checked={formData.vatRegistered} onCheckedChange={v => update('vatRegistered', v)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Company Number</Label>
                  <Input placeholder="e.g. 12345678" value={formData.companyNumber} onChange={e => update('companyNumber', e.target.value)} className="rounded-xl h-11" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
                  <span className="text-xs font-medium text-foreground">Insurance Verified</span>
                  <Switch checked={formData.insuranceVerified} onCheckedChange={v => update('insuranceVerified', v)} />
                </div>
              </div>
            </CollapsibleContent>
          </SectionCard>
        </Collapsible>

        {/* ── 11. PRO FEATURES ── */}
        <SectionCard className="opacity-60 relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-services/10 border border-services/20">
            <span className="text-[10px] font-bold text-services">PRO</span>
          </div>
          <SectionTitle icon={Zap}>Pro Features</SectionTitle>
          <div className="space-y-3">
            {[
              { icon: Star, label: 'Featured Listing', desc: 'Appear at the top of search results' },
              { icon: Shield, label: 'Verified Badge', desc: 'Build trust with a verified checkmark' },
              { icon: Zap, label: 'Boost Listing', desc: 'Get more visibility for 30 days' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Draft auto-save message */}
        <p className="text-center text-[11px] text-muted-foreground">Draft auto-saved • Changes sync automatically</p>
      </div>

      {/* ── 12. STICKY SUBMIT ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background to-background/0">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className="w-full bg-services hover:bg-services/90 text-services-foreground h-12 text-base font-semibold rounded-2xl shadow-elevated disabled:opacity-40"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Service'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddService;
