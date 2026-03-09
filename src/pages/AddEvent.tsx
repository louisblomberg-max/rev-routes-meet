import { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowLeft, Calendar, Camera, X, DollarSign, Users, Clock, ImagePlus, Car, MapPin, Eye, Globe, UsersRound, ChevronDown, Search, Tag } from 'lucide-react';
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
import { mockClubs } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { usePaywall } from '@/hooks/usePaywall';
import PaywallModal, { type PaywallReason } from '@/components/PaywallModal';
import { usePlan } from '@/contexts/PlanContext';

const EVENT_TYPES = ['Meets', 'Shows', 'Drive', 'Track Day', 'Motorsport', 'Autojumble'];
const VEHICLE_TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'cars', label: 'Cars' },
  { id: 'bikes', label: 'Bikes' },
];
const VEHICLE_CATEGORY_OPTIONS = [
  { id: 'jdm', label: 'JDM' },
  { id: 'supercars', label: 'Supercars' },
  { id: 'american', label: 'American' },
  { id: 'european', label: 'European' },
];
const VEHICLE_AGE_OPTIONS = [
  { id: 'all-ages', label: 'All' },
  { id: 'classics', label: 'Classics' },
  { id: 'modern', label: 'Modern' },
  { id: 'pre-00s', label: "Pre 00's" },
  { id: 'pre-90s', label: "Pre 90's" },
  { id: 'pre-80s', label: "Pre 80's" },
  { id: 'pre-70s', label: "Pre 70's" },
  { id: 'pre-60s', label: "Pre 60's" },
  { id: 'pre-50s', label: "Pre 50's" },
  { id: 'vintage', label: 'Vintage' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: 'Public', description: 'Visible to everyone on RevNet', icon: Globe },
  { value: 'club' as const, label: 'Club', description: 'Post to your club', icon: UsersRound },
  { value: 'friends' as const, label: 'Friends Only', description: 'Visible to friends', icon: Users },
];

// ── Shared layout components (matching Add Service) ──
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
  const { canCreateEvent, deductEventCredit, upgradeToPlan } = usePaywall();
  const { setPlan, setSubscriptionStatus } = usePlan();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason>('event_credits');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    entryFee: false,
    feeAmount: '',
    maxAttendees: '',
  });
  const [eventType, setEventType] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('all');
  const [vehicleCategory, setVehicleCategory] = useState<string | null>(null);
  const [vehicleAge, setVehicleAge] = useState<string>('all-ages');
  const [visibility, setVisibility] = useState<'public' | 'club' | 'friends'>('public');
  const [clubId, setClubId] = useState('');
  const currentUserId = state.currentUser?.id || 'current-user';
  const myOwnedClubs = mockClubs.filter(c => c.ownerId === currentUserId);
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('12:00');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('14:00');
  const [bannerImage, setBannerImage] = useState<{ file: File; preview: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Event name is required';
    const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 15) errs.description = `Description must be at least 15 words (currently ${wordCount})`;
    if (!eventType) errs.eventType = 'Select an event type';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    // vehicleType always has a value ('All', 'Cars', or 'Bikes')
    if (!formData.maxAttendees.trim()) errs.maxAttendees = 'Max attendees is required';
    if (formData.entryFee && !formData.feeAmount) errs.feeAmount = 'Enter fee amount';
    if (!formData.entryFee && formData.feeAmount === '') errs.entryFee = 'Please set the entry fee option';
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

  const toggleChip = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const doPublish = () => {
    setIsSubmitting(true);
    const newEvent = eventsRepo.create({
      title: formData.name,
      description: formData.description,
      location: formData.location,
      lat: formData.locationCoords?.lat ?? 51.5074,
      lng: formData.locationCoords?.lng ?? -0.1278,
      date: startDate ? format(startDate, "EEE, MMM d • h:mm a") : 'TBD',
      endDate: endDate?.toISOString(),
      eventType: eventType,
      vehicleTypes: vehicleType === 'all' ? ['All Welcome'] : [VEHICLE_TYPE_OPTIONS.find(o => o.id === vehicleType)?.label || vehicleType],
      // vehicleAge stored in tags for filtering
      visibility,
      clubId: visibility === 'club' ? clubId : undefined,
      entryFee: formData.entryFee ? `£${formData.feeAmount || '0'}` : 'Free',
      ticketLimit: parseInt(formData.maxAttendees) || undefined,
      createdBy: state.currentUser?.id || 'unknown',
      attendees: 0,
      photos: bannerImage ? [bannerImage.preview] : undefined,
      tags: [eventType.toLowerCase(), ...(vehicleType === 'all' ? [] : [vehicleType]), ...(vehicleCategory ? [vehicleCategory] : []), ...(vehicleAge === 'all-ages' ? [] : [vehicleAge])],
      isMultiDay: false,
      isRecurring: false,
    });
    // Deduct credit if free user
    const check = canCreateEvent();
    if (check.creditsRemaining > 0) {
      deductEventCredit();
    }

    toast.success('Event published — shown on map', { description: formData.name });
    setIsSubmitting(false);
    navigate('/', { state: { centerOn: { lat: newEvent.lat, lng: newEvent.lng }, category: 'events' } });
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Check paywall
    const check = canCreateEvent();
    if (!check.allowed) {
      setPaywallReason(check.reason!);
      setShowPaywall(true);
      return;
    }
    doPublish();
  };

  const handlePaywallResult = (success: boolean, method: 'per_item' | 'subscribe') => {
    setShowPaywall(false);
    if (!success) return;

    if (method === 'subscribe') {
      setPlan('pro');
      setSubscriptionStatus('active');
      upgradeToPlan('pro');
    }
    // Proceed to publish
    doPublish();
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
            {EVENT_TYPES.map(type => (
              <button key={type} onClick={() => { setEventType(type); setErrors(prev => ({ ...prev, eventType: '' })); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  eventType === type
                    ? 'bg-events text-events-foreground border-events shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                }`}>
                {type}
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
                onClick={() => setVehicleType(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  vehicleType === opt.id
                    ? 'bg-events text-events-foreground border-events shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── VEHICLE CATEGORY ── */}
        <SectionCard>
          <SectionTitle icon={Car}>Vehicle Category</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_CATEGORY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setVehicleCategory(vehicleCategory === opt.id ? null : opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  vehicleCategory === opt.id
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
                onClick={() => setVehicleAge(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  vehicleAge === opt.id
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
            value={formData.location}
            onChange={(loc, coords) => { update('location', loc); update('locationCoords', coords); }}
            error={errors.location}
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
      </div>

      {/* ── STICKY SUBMIT ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background to-background/0">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-events hover:bg-events/90 text-events-foreground h-12 text-base font-semibold rounded-2xl shadow-elevated">
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason={paywallReason}
        creditsRemaining={state.currentUser?.eventCredits ?? 0}
        onPaymentResult={handlePaywallResult}
      />
    </div>
  );
};

export default AddEvent;
