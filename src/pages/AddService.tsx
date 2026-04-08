import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Building, Phone, Globe, Camera, X, Clock, MapPin, Image, Upload, Star, Copy, AlertCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
// TODO: Add validateImageFile from '@/lib/utils' when cover upload is connected to real file input
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from '@/components/LocationPicker';
import CreationPaywallSheet from '@/components/CreationPaywallSheet';

const SERVICE_CATEGORIES = [
  'Garages & Mechanics',
  'Vehicle Servicing',
  'Tyres & Wheels',
  'Bodywork & Paint',
  'Detailing & Car Care',
  'Tuning & Performance',
  'Parts & Accessories',
  'Recovery & Roadside Assistance',
  'Storage & Parking',
  'Fuel & Petrol',
  'EV Charging',
  'Mobile Services',
  'Shipping & Transportation',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const COUNTRY_CODES = [
  { code: '+44', label: '+44 UK' },
  { code: '+353', label: '+353 IE' },
  { code: '+33', label: '+33 FR' },
  { code: '+49', label: '+49 DE' },
  { code: '+34', label: '+34 ES' },
  { code: '+39', label: '+39 IT' },
  { code: '+31', label: '+31 NL' },
  { code: '+32', label: '+32 BE' },
  { code: '+41', label: '+41 CH' },
  { code: '+43', label: '+43 AT' },
  { code: '+351', label: '+351 PT' },
  { code: '+30', label: '+30 GR' },
  { code: '+46', label: '+46 SE' },
  { code: '+47', label: '+47 NO' },
  { code: '+45', label: '+45 DK' },
  { code: '+358', label: '+358 FI' },
  { code: '+48', label: '+48 PL' },
  { code: '+420', label: '+420 CZ' },
  { code: '+36', label: '+36 HU' },
  { code: '+40', label: '+40 RO' },
  { code: '+359', label: '+359 BG' },
  { code: '+385', label: '+385 HR' },
  { code: '+386', label: '+386 SI' },
  { code: '+421', label: '+421 SK' },
  { code: '+370', label: '+370 LT' },
  { code: '+371', label: '+371 LV' },
  { code: '+372', label: '+372 EE' },
  { code: '+352', label: '+352 LU' },
  { code: '+356', label: '+356 MT' },
  { code: '+357', label: '+357 CY' },
  { code: '+1', label: '+1 US' },
  { code: '+61', label: '+61 AU' },
  { code: '+64', label: '+64 NZ' },
  { code: '+27', label: '+27 ZA' },
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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEdit);
  const { services: servicesRepo, state } = useData();
  const { user: authUser } = useAuth();
  const currentUser = authUser;
  const [showPaywall, setShowPaywall] = useState(false);

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
    is24h: false,
    isEmergency: false,
    hideAddress: false,
    serviceType: 'fixed' as 'fixed' | 'mobile',
    serviceRadius: 15,
    priceRange: '',
  });
  const [dayHours, setDayHours] = useState<Record<string, DayHours>>(defaultDayHours);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing service data for edit mode
  useEffect(() => {
    if (!editId || !currentUser?.id) { setIsLoadingEdit(false); return; }
    (async () => {
      const { data } = await supabase.from('services').select('*').eq('id', editId).single();
      if (!data) { toast.error('Service not found'); navigate(-1); setIsLoadingEdit(false); return; }
      if (data.created_by !== currentUser.id) { toast.error('Not your service'); navigate(-1); setIsLoadingEdit(false); return; }
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        tagline: data.tagline || '',
        description: data.description || '',
        categories: data.types || [],
        location: data.address || '',
        locationCoords: data.lat && data.lng ? { lat: data.lat, lng: data.lng } : undefined,
        phone: data.phone?.replace(/^\+\d+\s/, '') || '',
        website: data.website || '',
        is24h: data.is_24_7 || false,
        isEmergency: data.is_emergency || false,
        hideAddress: data.hide_exact_address || false,
        serviceType: (data.service_type as any) || 'fixed',
      }));
      if (data.cover_url) setCoverImage(data.cover_url);
      if (data.hours && typeof data.hours === 'object' && !(data.hours as any)['24/7']) {
        setDayHours(data.hours as any);
      }
      setIsLoadingEdit(false);
    })();
  }, [editId, currentUser?.id]);

  // Plan check is now done on submit via paywall

  const isFormValid = formData.name.trim() && formData.categories.length > 0 && formData.location.trim() && formData.phone.trim();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Business name is required';
    if (formData.categories.length === 0) errs.category = 'Select at least one category';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setCoverFile(file);
    setCoverImage(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, cover: '' }));
    e.target.value = '';
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

  const geocodeLocation = async (text: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=gb&limit=1`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
    } catch (err) {
      // geocoding failed
    }
    return null;
  };

  const saveService = async () => {
    setIsSubmitting(true);
    try {
      let lat = formData.locationCoords?.lat ?? null;
      let lng = formData.locationCoords?.lng ?? null;

      if ((!lat || !lng) && formData.location.trim()) {
        const coords = await geocodeLocation(formData.location.trim());
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      if (!lat || !lng) {
        toast.error('Please enter a valid location so your service appears on the map');
        setIsSubmitting(false);
        return;
      }

      // Upload cover image if present
      let coverUrl: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split('.').pop();
        const path = `${currentUser!.id}/${Date.now()}-cover.${ext}`;
        const { error: ue } = await supabase.storage.from('services').upload(path, coverFile, { upsert: true, contentType: coverFile.type || 'image/heic' });
        if (!ue) {
          const { data: u } = supabase.storage.from('services').getPublicUrl(path);
          coverUrl = u.publicUrl;
        }
      }

      // Edit mode — update existing service
      if (isEdit && editId) {
        const { error: updateError } = await supabase.from('services').update({
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          tagline: formData.tagline?.trim() || null,
          lat: Number(lat), lng: Number(lng),
          address: formData.location.trim() || null,
          phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : null,
          website: formData.website?.trim() || null,
          types: formData.categories,
          service_type: formData.categories[0] || 'fixed',
          is_24_7: formData.is24h, is_emergency: formData.isEmergency,
          hide_exact_address: formData.hideAddress,
          hours: formData.is24h ? { '24/7': true } : dayHours as any,
          cover_url: coverUrl || (coverImage?.startsWith('http') ? coverImage : null),
        }).eq('id', editId).eq('created_by', currentUser!.id);
        if (updateError) { toast.error('Failed to update: ' + updateError.message); setIsSubmitting(false); return; }
        toast.success('Service updated!');
        navigate(-1);
        return;
      }

      const payload = {
        created_by: currentUser!.id,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        tagline: formData.tagline?.trim() || null,
        lat: Number(lat),
        lng: Number(lng),
        address: formData.location.trim() || null,
        phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : null,
        website: formData.website?.trim() || null,
        types: formData.categories,
        service_type: formData.serviceType || 'fixed',
        is_24_7: formData.is24h,
        is_emergency: formData.isEmergency,
        hide_exact_address: formData.hideAddress,
        hours: formData.is24h ? { '24/7': true } : dayHours as any,
        cover_url: coverUrl,
        status: 'active',
        visibility: 'public',
      };

      const { data, error } = await supabase
        .from('services')
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error('Could not create listing: ' + error.message);
        return;
      }

      toast.success('Service listing created!', { description: `${formData.name} is now listed.` });
      navigate('/', { replace: true, state: { refreshMap: true, centerOn: { lat: Number(lat), lng: Number(lng) } } });
    } catch (err: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!currentUser) {
      toast.error('You must be logged in to add a service');
      return;
    }

    // Plan check — allow all authenticated users for now
    // TODO: re-enable plan gate when billing is confirmed working
    if (!currentUser?.id) {
      toast.error('Please sign in');
      setIsSubmitting(false);
      return;
    }

    await saveService();
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
          <h1 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Service' : 'Add Service'}</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-28">

        {/* ── 2. COVER IMAGE ── */}
        <SectionCard>
          <SectionTitle icon={Camera}>Cover Image</SectionTitle>
          <div className="flex justify-center">
            {coverImage ? (
              <div style={{ width: '160px', aspectRatio: '9/16', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img src={coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                <button
                  onClick={() => { setCoverImage(null); setCoverFile(null); }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                >x</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '160px', aspectRatio: '9/16', borderRadius: '16px', border: '2px dashed rgba(0,0,0,0.15)', background: 'rgba(0,0,0,0.03)', cursor: 'pointer' }}>
                <Camera style={{ width: 24, height: 24, color: '#999', marginBottom: 8 }} />
                <span style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>Add cover photo</span>
                <span style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>Portrait (9:16)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" className="hidden" onChange={handleCoverUpload} />
              </label>
            )}
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
          <SectionTitle icon={Star}>Services Offered</SectionTitle>
          <p className="text-xs text-muted-foreground -mt-2 mb-3">Select all that apply to your business</p>
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
          {formData.categories.length > 0 && (
            <p className="text-[11px] text-services mt-2 font-medium">{formData.categories.length} selected</p>
          )}
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
              <div className="space-y-3 animate-fade-up">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Service Radius</Label>
                  <span className="text-xs font-semibold text-services">
                    {formData.serviceRadius >= 500 ? 'Nationwide' : `${formData.serviceRadius} miles`}
                  </span>
                </div>
                <Slider
                  value={[formData.serviceRadius]}
                  onValueChange={([v]) => update('serviceRadius', v)}
                  min={5}
                  max={500}
                  step={5}
                  className="py-2"
                />
                <div className="flex gap-1.5">
                  {[25, 50, 100, 250].map(r => (
                    <button
                      key={r}
                      onClick={() => update('serviceRadius', r)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        formData.serviceRadius === r
                          ? 'bg-services text-services-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-services/10'
                      }`}
                    >
                      {r} mi
                    </button>
                  ))}
                  <button
                    onClick={() => update('serviceRadius', 500)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      formData.serviceRadius >= 500
                        ? 'bg-services text-services-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-services/10'
                    }`}
                  >
                    National
                  </button>
                </div>
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
              <Label className="text-xs text-muted-foreground">Phone *</Label>
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
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            {/* Website */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="url" placeholder="https://" className="pl-10 rounded-xl h-11" value={formData.website} onChange={e => update('website', e.target.value)} />
              </div>
              {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
            </div>
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
            {isSubmitting ? (isEdit ? 'Saving...' : 'Submitting...') : isEdit ? 'Save Changes' : 'Submit Service'}
          </Button>
        </div>
      </div>

      <CreationPaywallSheet
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        type="service"
      />
    </div>
  );
};

export default AddService;
