import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, Calendar, Camera, X, DollarSign, Users, Clock, ImagePlus, Car, MapPin, Eye, Globe, UsersRound, ChevronDown, Search, Tag, Ticket, Info, CreditCard, Banknote } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LocationPicker from '@/components/LocationPicker';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import CreationPaywallSheet from '@/components/CreationPaywallSheet';
import type { EventType, VehicleType, EntryFeeType } from '@/models';

const EVENT_TYPE_OPTIONS: { id: EventType; label: string }[] = [
  { id: 'meets', label: 'Meets' },
  { id: 'shows', label: 'Shows' },
  { id: 'drive', label: 'Drive' },
  { id: 'track_day', label: 'Track Day' },
  { id: 'motorsport', label: 'Motorsport' },
  { id: 'autojumble', label: 'Autojumble' },
  { id: 'off_road', label: 'Off-Road' },
];

const VEHICLE_TYPE_OPTIONS: { id: VehicleType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'cars', label: 'Cars' },
  { id: 'bikes', label: 'Bikes' },
  { id: 'big_stuff', label: 'Big Stuff' },
  { id: 'military', label: 'Military' },
];

const VEHICLE_CATEGORY_OPTIONS = [
  { id: 'jdm', label: 'JDM' },
  { id: 'supercars', label: 'Supercars' },
  { id: 'muscle-car', label: 'Muscle Car' },
  { id: 'american', label: 'American' },
  { id: 'european', label: 'European' },
  { id: '4x4', label: '4x4' },
  { id: 'row', label: 'ROW' },
  { id: 'modern', label: 'Modern' },
  { id: 'classics', label: 'Classics' },
  { id: 'vintage', label: 'Vintage' },
];

const VEHICLE_AGE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pre_2000', label: "Pre 00's" },
  { id: 'pre_1990', label: "Pre 90's" },
  { id: 'pre_1980', label: "Pre 80's" },
  { id: 'pre_1970', label: "Pre 70's" },
  { id: 'pre_1960', label: "Pre 60's" },
  { id: 'pre_1950', label: "Pre 50's" },
];

const CAR_BRANDS = [
  'Abarth','Alfa Romeo','Alpine','Aston Martin','Audi','Bentley','BMW','Bugatti',
  'Cadillac','Chevrolet','Chrysler','Citroën','Cupra','Dacia','Dodge','Ferrari',
  'Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep',
  'Kia','Koenigsegg','Lamborghini','Land Rover','Lexus','Lotus','Maserati',
  'Mazda','McLaren','Mercedes-Benz','Mini','Mitsubishi','Nissan','Pagani',
  'Peugeot','Polestar','Porsche','Renault','Rolls Royce','Seat','Skoda',
  'Subaru','Suzuki','Tesla','Toyota','Vauxhall','Volkswagen','Volvo',
];
const BIKE_BRANDS = [
  'Aprilia','Benelli','BMW Motorrad','CFMoto','Ducati','Harley-Davidson','Honda',
  'Husqvarna','Indian','Kawasaki','KTM','Moto Guzzi','MV Agusta','Royal Enfield',
  'Suzuki','Triumph','Yamaha','Zero Motorcycles',
];
const POPULAR_CAR_BRANDS = ['BMW','Porsche','Mercedes-Benz','Audi','Ford','Ferrari','Lamborghini','Nissan'];
const POPULAR_BIKE_BRANDS = ['Ducati','Harley-Davidson','Honda','Kawasaki','Yamaha','Triumph','KTM','BMW Motorrad'];

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: 'Public', description: 'Visible to everyone on RevNet', icon: Globe },
  { value: 'club' as const, label: 'Club', description: 'Post to your club', icon: UsersRound },
  { value: 'friends' as const, label: 'Friends Only', description: 'Visible to friends', icon: Users },
];

// ── Shared layout components ──
const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-card p-5 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-events" />
    </div>
    <h2 className="text-base font-bold text-foreground">{children}</h2>
  </div>
);

const AddEvent = () => {
  const navigate = useNavigate();
  const { events: eventsRepo, state } = useData();
  const { user: authUser } = useAuth();
  const { effectivePlan } = usePlan();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationName: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    entryFee: false,
    feeAmount: '',
    maxAttendees: '',
    firstComeFirstServe: false,
  });
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('all');
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<VehicleType[]>(['all']);
  const [vehicleCategories, setVehicleCategories] = useState<string[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);
  const [vehicleAges, setVehicleAges] = useState<string[]>(['all']);
  const [visibility, setVisibility] = useState<'public' | 'club' | 'friends'>('public');
  const [clubId, setClubId] = useState('');
  const [myOwnedClubs, setMyOwnedClubs] = useState<{ id: string; name: string }[]>([]);
  const currentUserId = authUser?.id || 'current-user';

  // Ticketing state
  const [ticketingEnabled, setTicketingEnabled] = useState(false);
  const [ticketPrice, setTicketPrice] = useState('');
  const [maxTickets, setMaxTickets] = useState('');
  const [hasStripeConnect, setHasStripeConnect] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    if (!authUser?.id) return;
    (async () => {
      const { data } = await supabase
        .from('club_memberships')
        .select('club_id, clubs(id, name)')
        .eq('user_id', authUser.id);
      if (data) {
        setMyOwnedClubs(data.map((d: any) => ({ id: d.clubs?.id || d.club_id, name: d.clubs?.name || 'Unknown Club' })));
      }
    })();
    // Check Stripe Connect status
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('stripe_connect_account_id')
        .eq('id', authUser.id)
        .single();
      if (data?.stripe_connect_account_id) {
        setHasStripeConnect(true);
      }
    })();
  }, [authUser?.id]);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('12:00');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('14:00');
  const [bannerImage, setBannerImage] = useState<{ file: File; preview: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync maxTickets with maxAttendees
  useEffect(() => {
    if (!maxTickets && formData.maxAttendees) {
      setMaxTickets(formData.maxAttendees);
    }
  }, [formData.maxAttendees]);

  // Close brand dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const availableBrands = useMemo(() => {
    const types = selectedVehicleTypes.filter(t => t !== 'all');
    if (types.length === 0) return [...CAR_BRANDS, ...BIKE_BRANDS].sort();
    const brands = new Set<string>();
    for (const vt of types) {
      if (vt === 'cars' || vt === 'big_stuff' || vt === 'military') CAR_BRANDS.forEach(b => brands.add(b));
      else if (vt === 'bikes') BIKE_BRANDS.forEach(b => brands.add(b));
    }
    return brands.size > 0 ? [...brands].sort() : [...CAR_BRANDS, ...BIKE_BRANDS].sort();
  }, [selectedVehicleTypes]);

  const popularBrands = useMemo(() => {
    const types = selectedVehicleTypes.filter(t => t !== 'all');
    if (types.length === 0) return [...POPULAR_CAR_BRANDS, ...POPULAR_BIKE_BRANDS];
    const pBrands = new Set<string>();
    for (const vt of types) {
      if (vt === 'cars' || vt === 'big_stuff' || vt === 'military') POPULAR_CAR_BRANDS.forEach(b => pBrands.add(b));
      else if (vt === 'bikes') POPULAR_BIKE_BRANDS.forEach(b => pBrands.add(b));
    }
    return pBrands.size > 0 ? [...pBrands] : [...POPULAR_CAR_BRANDS, ...POPULAR_BIKE_BRANDS];
  }, [selectedVehicleTypes]);

  const filteredBrandResults = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    if (!query) {
      const rest = availableBrands.filter(b => !popularBrands.includes(b));
      return [...popularBrands, ...rest].filter(b => !vehicleBrands.includes(b)).slice(0, 8);
    }
    return availableBrands
      .filter(b => b.toLowerCase().includes(query) && !vehicleBrands.includes(b))
      .slice(0, 8);
  }, [brandSearch, availableBrands, popularBrands, vehicleBrands]);

  // Ticketing calculations
  const ticketPriceNum = parseFloat(ticketPrice) || 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Event name is required';
    const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 15) errs.description = `Description must be at least 15 words (currently ${wordCount})`;
    if (!eventType) errs.eventType = 'Select an event type';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!formData.locationName.trim()) errs.locationName = 'Location is required';
    if (!formData.maxAttendees.trim()) errs.maxAttendees = 'Max attendees is required';
    if (formData.entryFee && !formData.feeAmount) errs.feeAmount = 'Enter fee amount';
    if (ticketingEnabled && ticketPriceNum < 1) errs.ticketPrice = 'Minimum ticket price is £1.00';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bannerImage) URL.revokeObjectURL(bannerImage.preview);
    setBannerImage({ file, preview: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const removeBanner = () => {
    if (bannerImage) {
      URL.revokeObjectURL(bannerImage.preview);
      setBannerImage(null);
    }
  };

  const geocodeLocation = async (text: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=gb&limit=1`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        console.log('[AddEvent] Geocoded location:', lat, lng);
        return { lat, lng };
      }
    } catch (err) {
      console.error('[AddEvent] Geocoding error:', err);
    }
    return null;
  };

  const saveEvent = async () => {
    setIsSubmitting(true);
    try {
      const entryFeeAmount = formData.entryFee ? parseFloat(formData.feeAmount) || 0 : 0;

      // Resolve coordinates
      let lat = formData.locationCoords?.lat ?? null;
      let lng = formData.locationCoords?.lng ?? null;

      if ((!lat || !lng) && formData.locationName.trim()) {
        const coords = await geocodeLocation(formData.locationName.trim());
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      if (!lat || !lng) {
        toast.error('Please enter a valid location so your event appears on the map');
        setIsSubmitting(false);
        return;
      }

      // Upload banner if present
      let bannerUrl: string | null = null;
      if (bannerImage?.file) {
        const fileExt = bannerImage.file.name.split('.').pop();
        const fileName = `${authUser?.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('events').upload(fileName, bannerImage.file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('events').getPublicUrl(fileName);
          bannerUrl = urlData.publicUrl;
        }
      }

      const payload = {
        created_by: authUser?.id || null,
        title: formData.name.trim(),
        description: formData.description?.trim() || null,
        banner_url: bannerUrl,
        type: eventType || 'meets',
        vehicle_types: selectedVehicleTypes.filter(t => t !== 'all'),
        vehicle_brands: vehicleBrands,
        vehicle_categories: vehicleCategories,
        vehicle_ages: vehicleAges.filter(a => a !== 'all'),
        date_start: startDate ? startDate.toISOString() : new Date().toISOString(),
        date_end: endDate?.toISOString() || null,
        location: formData.locationName.trim(),
        lat: Number(lat),
        lng: Number(lng),
        max_attendees: parseInt(formData.maxAttendees) || null,
        is_first_come_first_serve: formData.firstComeFirstServe,
        entry_fee: entryFeeAmount,
        is_free: !entryFeeAmount || entryFeeAmount === 0,
        is_ticketed: ticketingEnabled,
        ticket_price: ticketingEnabled ? ticketPriceNum : 0,
        visibility,
        club_id: visibility === 'club' ? clubId || null : null,
      };

      console.log('[AddEvent] Inserting payload:', payload);

      const { data, error } = await supabase
        .from('events')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('[AddEvent] Insert error:', error);
        toast.error('Could not create event: ' + error.message);
        return;
      }

      console.log('[AddEvent] Event created:', data);
      toast.success('Event published! 🎉', { description: formData.name });
      navigate('/', { replace: true, state: { refreshMap: true, centerOn: { lat: Number(lat), lng: Number(lng) } } });
    } catch (err: any) {
      console.error('[AddEvent] Error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!authUser?.id) { toast.error('You must be signed in'); return; }

    setIsSubmitting(true);
    try {
      // Check subscription plan from DB
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', authUser.id)
        .maybeSingle();

      const isPaid = sub?.plan === 'pro' || sub?.plan === 'club';

      if (isPaid) {
        // Pro/Club — unlimited events
        await saveEvent();
        return;
      }

      // Free user — try to use a free credit
      const { data: creditUsed, error: creditError } = await supabase
        .rpc('use_event_credit', { p_user_id: authUser.id });

      console.log('[AddEvent] Credit used:', creditUsed, creditError);

      if (creditUsed) {
        toast.success('Your free event post has been used.', {
          description: 'Future events cost £2.99 each or upgrade to Pro.',
        });
        await saveEvent();
        return;
      }

      // No credits left — show paywall
      setShowPaywall(true);
    } catch (err) {
      console.error('[AddEvent] handleSubmit error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    const { data, error } = await supabase.functions.invoke('create-stripe-connect-account');
    setConnectingStripe(false);
    if (error || !data?.url) {
      toast.error('Failed to start bank account setup.');
      return;
    }
    window.open(data.url, '_blank');
  };

  const update = (field: string, value: string | boolean | { lat: number; lng: number } | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-10 h-10 rounded-xl bg-muted/80 hover:bg-muted" />
          <h1 className="text-lg font-bold text-foreground">Add Event</h1>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFilesSelected} />

      <div className="px-4 py-6 space-y-6 pb-28">

        {/* ── BANNER IMAGE ── */}
        <SectionCard>
          <SectionTitle icon={Camera}>Event Banner</SectionTitle>
          <Label className="text-xs text-muted-foreground mb-2 block">This image appears at the top of your event detail</Label>
          {bannerImage ? (
            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-border/50">
              <img src={bannerImage.preview} alt="Event banner" className="w-full h-full object-cover" />
              <button onClick={removeBanner} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md">
                <X className="w-4 h-4" />
              </button>
              <button onClick={handleImageUpload} className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur text-xs font-medium text-foreground border border-border/50 shadow-sm">
                Change
              </button>
            </div>
          ) : (
            <button onClick={handleImageUpload} className="w-full h-40 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-events/50 transition-colors bg-muted/30">
              <ImagePlus className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Upload banner image</span>
              <span className="text-[10px] text-muted-foreground/60">Recommended: 16:9 ratio</span>
            </button>
          )}
        </SectionCard>

        {/* ── EVENT INFO ── */}
        <SectionCard>
          <SectionTitle icon={Calendar}>Event Info <span className="text-destructive">*</span></SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">Event Name *</Label>
              <Input id="name" placeholder="e.g. Monthly Porsche Meet" value={formData.name} onChange={e => update('name', e.target.value)} className="rounded-xl h-11" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-muted-foreground">Description * <span className="text-muted-foreground/60">(min 15 words)</span></Label>
              <Textarea id="description" placeholder="Tell people what to expect... (minimum 15 words)" rows={3} value={formData.description} onChange={e => update('description', e.target.value)} className="rounded-xl" />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
          </div>
        </SectionCard>

        {/* ── EVENT TYPE ── */}
        <SectionCard>
          <SectionTitle icon={Calendar}>Event Type <span className="text-destructive">*</span></SectionTitle>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPE_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => { setEventType(opt.id); setErrors(prev => ({ ...prev, eventType: '' })); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  eventType === opt.id
                    ? 'bg-events text-events-foreground border-events shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          {errors.eventType && <p className="text-xs text-destructive mt-2">{errors.eventType}</p>}
        </SectionCard>

        {/* ── VEHICLE TYPE ── */}
        <SectionCard>
          <SectionTitle icon={Car}>Vehicle Type <span className="text-destructive">*</span></SectionTitle>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (opt.id === 'all') {
                    setSelectedVehicleTypes(['all']);
                    setVehicleType('all');
                    setVehicleBrands([]);
                    setBrandSearch('');
                  } else {
                    setSelectedVehicleTypes(prev => {
                      const withoutAll = prev.filter(t => t !== 'all') as VehicleType[];
                      const newTypes: VehicleType[] = withoutAll.includes(opt.id)
                        ? withoutAll.filter(t => t !== opt.id)
                        : [...withoutAll, opt.id];
                      const result: VehicleType[] = newTypes.length === 0 ? ['all'] : newTypes;
                      setVehicleType(result[0]);
                      return result;
                    });
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  selectedVehicleTypes.includes(opt.id)
                    ? 'bg-events text-events-foreground border-events shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── VEHICLE BRAND ── */}
        <SectionCard>
          <SectionTitle icon={Tag}>
            Specific Vehicle Brand
          </SectionTitle>

          <div ref={brandRef} className="relative">
            {vehicleBrands.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {vehicleBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-events/15 text-events text-xs font-semibold border border-events/30"
                  >
                    {brand}
                    <button
                      onClick={() => setVehicleBrands(vehicleBrands.filter(b => b !== brand))}
                      className="w-4 h-4 rounded-full bg-events/20 hover:bg-events/40 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => {
                  setBrandSearch(e.target.value);
                  setIsBrandDropdownOpen(true);
                }}
                onFocus={() => setIsBrandDropdownOpen(true)}
                placeholder="Search vehicle brand..."
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-border/50 bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-events/50 focus:ring-1 focus:ring-events/30 transition-all"
              />
            </div>

            {isBrandDropdownOpen && filteredBrandResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
                {!brandSearch.trim() && (
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Popular</p>
                )}
                {filteredBrandResults.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      setVehicleBrands([...vehicleBrands, brand]);
                      setBrandSearch('');
                      setIsBrandDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-events/10 transition-colors"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── VEHICLE CATEGORY ── */}
        <SectionCard>
          <SectionTitle icon={Car}>Specific Vehicle Category</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_CATEGORY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setVehicleCategories(prev =>
                    prev.includes(opt.id) ? prev.filter(c => c !== opt.id) : [...prev, opt.id]
                  );
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  vehicleCategories.includes(opt.id)
                    ? 'bg-events text-events-foreground border-events shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── VEHICLE AGE ── */}
        <SectionCard>
          <SectionTitle icon={Clock}>Vehicle Age</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_AGE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (opt.id === 'all') {
                    setVehicleAges(['all']);
                  } else {
                    setVehicleAges(prev => {
                      const withoutAll = prev.filter(a => a !== 'all');
                      const newAges = withoutAll.includes(opt.id)
                        ? withoutAll.filter(a => a !== opt.id)
                        : [...withoutAll, opt.id];
                      return newAges.length === 0 ? ['all'] : newAges;
                    });
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  vehicleAges.includes(opt.id)
                    ? 'bg-events text-events-foreground border-events shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── DATE & TIME ── */}
        <SectionCard>
          <SectionTitle icon={Clock}>Date & Time <span className="text-destructive">*</span></SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium">Start *</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 text-xs rounded-xl", !startDate && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-3.5 w-3.5" />
                    {startDate ? format(startDate, "d MMM yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); setErrors(prev => ({ ...prev, startDate: '' })); }} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9 text-xs rounded-xl" />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium">End</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 text-xs rounded-xl", !endDate && "text-muted-foreground")}>
                    <Clock className="mr-2 h-3.5 w-3.5" />
                    {endDate ? format(endDate, "d MMM yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => date < (startDate || new Date())} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9 text-xs rounded-xl" />
            </div>
          </div>
        </SectionCard>

        {/* ── LOCATION ── */}
        <SectionCard>
          <SectionTitle icon={MapPin}>Location <span className="text-destructive">*</span></SectionTitle>
          <LocationPicker
            value={formData.locationName}
            onChange={(loc, coords) => { update('locationName', loc); update('locationCoords', coords); }}
            error={errors.locationName}
          />
        </SectionCard>

        {/* ── VISIBILITY ── */}
        <SectionCard>
          <SectionTitle icon={Eye}>Visibility <span className="text-destructive">*</span></SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {VISIBILITY_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setVisibility(opt.value); if (opt.value !== 'club') setClubId(''); setErrors(prev => ({ ...prev, club: '' })); }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200 border ${
                    visibility === opt.value
                      ? 'bg-events/10 border-events shadow-sm'
                      : 'bg-muted/30 border-border/50 hover:border-events/40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    visibility === opt.value ? 'bg-events text-events-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${visibility === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {visibility === 'club' && (
            <div className="mt-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
              {myOwnedClubs.length > 0 ? (
                <>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Your Club *</Label>
                  <Select value={clubId} onValueChange={(v) => { setClubId(v); setErrors(prev => ({ ...prev, club: '' })); }}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select one of your clubs" />
                    </SelectTrigger>
                    <SelectContent>
                      {myOwnedClubs.map(club => (
                        <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1.5">This event will appear in your club's Events section</p>
                  {errors.club && <p className="text-xs text-destructive mt-1">{errors.club}</p>}
                </>
              ) : (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                  <p className="text-xs text-muted-foreground">You need to be a club founder to post club events. Create a club first.</p>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── MAX ATTENDEES ── */}
        <SectionCard>
          <SectionTitle icon={Users}>Max Attendees <span className="text-destructive">*</span></SectionTitle>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="maxAttendees" type="number" placeholder="e.g. 50" className="pl-10 rounded-xl h-11" value={formData.maxAttendees} onChange={e => { update('maxAttendees', e.target.value); setErrors(prev => ({ ...prev, maxAttendees: '' })); }} />
          </div>
          {errors.maxAttendees && <p className="text-xs text-destructive mt-1">{errors.maxAttendees}</p>}

          <div className="flex items-start gap-3 mt-4 p-3 rounded-xl bg-muted/40 border border-border/30">
            <input
              type="checkbox"
              id="fcfs"
              checked={formData.firstComeFirstServe}
              onChange={e => update('firstComeFirstServe', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border text-events focus:ring-events"
            />
            <div>
              <label htmlFor="fcfs" className="text-xs font-medium text-foreground cursor-pointer">First come first serve</label>
              <p className="text-[10px] text-muted-foreground mt-0.5">The first people to attend will take the available places.</p>
            </div>
          </div>
        </SectionCard>

        {/* ── ENTRY FEE ── */}
        <SectionCard>
          <SectionTitle icon={DollarSign}>Entry Fee <span className="text-destructive">*</span></SectionTitle>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
            <p className="text-xs font-medium text-foreground">Charge attendees?</p>
            <Switch checked={formData.entryFee} onCheckedChange={v => update('entryFee', v)} />
          </div>
          {formData.entryFee && (
            <div className="space-y-1.5 mt-4">
              <Label htmlFor="feeAmount" className="text-xs text-muted-foreground">Fee Amount (£)</Label>
              <Input id="feeAmount" type="number" placeholder="0.00" value={formData.feeAmount} onChange={e => update('feeAmount', e.target.value)} className="rounded-xl h-11" />
              {errors.feeAmount && <p className="text-xs text-destructive">{errors.feeAmount}</p>}
            </div>
          )}
        </SectionCard>

        {/* ── TICKETING & REVENUE ── */}
        <SectionCard>
          <SectionTitle icon={Ticket}>Ticketing & Revenue</SectionTitle>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
            <p className="text-xs font-medium text-foreground">Enable ticket sales for this event</p>
            <Switch checked={ticketingEnabled} onCheckedChange={setTicketingEnabled} />
          </div>

          {ticketingEnabled && (
            <div className="mt-4 space-y-4">
              {/* Info box */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    RevNet charges a 5% commission on ticket sales. You keep 95% of all revenue.
                    Payments are processed securely via Stripe and paid out to your connected bank account.
                  </p>
                </div>
              </div>

              {/* Stripe Connect banner */}
              {!hasStripeConnect && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Connect bank account to receive ticket payments</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnectStripe}
                    disabled={connectingStripe}
                    className="h-8 text-xs border-amber-300 dark:border-amber-700"
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    {connectingStripe ? 'Setting up…' : 'Connect Bank Account'}
                  </Button>
                </div>
              )}

              {/* Ticket price */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ticket Price (£) *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10.00"
                  min="1"
                  step="0.01"
                  value={ticketPrice}
                  onChange={e => { setTicketPrice(e.target.value); setErrors(prev => ({ ...prev, ticketPrice: '' })); }}
                  className="rounded-xl h-11"
                />
                {errors.ticketPrice && <p className="text-xs text-destructive">{errors.ticketPrice}</p>}
              </div>

              {/* Max tickets */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Maximum Tickets</Label>
                <Input
                  type="number"
                  placeholder="Same as max attendees"
                  value={maxTickets}
                  onChange={e => setMaxTickets(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              {/* Commission info */}
              {ticketPriceNum > 0 && (
                <p className="text-[11px] text-muted-foreground">RevNet charges a 5% commission on ticket sales. You keep 95%.</p>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── STICKY SUBMIT ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background to-background/0">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-events hover:bg-events/90 text-events-foreground h-12 text-base font-semibold rounded-2xl shadow-elevated">
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </div>

      {/* Event Posting Paywall */}
      <CreationPaywallSheet
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        type="event"
      />
    </div>
  );
};

export default AddEvent;
