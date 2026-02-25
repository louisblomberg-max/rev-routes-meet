import { useState, useRef } from 'react';
import { ArrowLeft, Calendar, Camera, X, DollarSign, Users, Clock, ImagePlus, Car, MapPin, Eye, Globe, UsersRound, Lock, ChevronDown } from 'lucide-react';
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

const EVENT_TYPES = ['Meets', 'Cars & Coffee', 'Drive / Drive-Out', 'Group Drive', 'Track Day', 'Show / Exhibition'];
const VEHICLE_TYPES = ['Cars', 'Motorcycles', 'Classic', 'Supercars', 'JDM', 'Euro', 'American', 'Off-road'];

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: 'Public', description: 'Visible to everyone on RevNet', icon: Globe },
  { value: 'club' as const, label: 'Club', description: 'Choose a club', icon: UsersRound },
  { value: 'friends' as const, label: 'Friends Only', description: 'Visible to friends', icon: Users },
  { value: 'private' as const, label: 'Private', description: 'Only me', icon: Lock },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    entryFee: false,
    feeAmount: '',
    maxAttendees: '',
  });
  const [eventTypeMode, setEventTypeMode] = useState<'all' | 'selected'>('all');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [vehicleTypeMode, setVehicleTypeMode] = useState<'all' | 'selected'>('all');
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'club' | 'friends' | 'private'>('public');
  const [clubId, setClubId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('12:00');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('14:00');
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Event name is required';
    if (!startDate) errs.date = 'Start date is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (eventTypeMode === 'selected' && eventTypes.length === 0) errs.eventType = 'Select at least one event type';
    if (vehicleTypeMode === 'selected' && vehicleTypes.length === 0) errs.vehicleType = 'Select at least one vehicle type';
    if (visibility === 'club' && !clubId) errs.club = 'Select a club';
    if (formData.entryFee && !formData.feeAmount) errs.feeAmount = 'Enter fee amount';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleChip = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Event created successfully!', { description: formData.name });
      setIsSubmitting(false);
      navigate(-1);
    }, 500);
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
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Add Event</h1>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />

      <div className="px-4 py-6 space-y-6 pb-28">

        {/* ── PHOTOS ── */}
        <SectionCard>
          <SectionTitle icon={Camera}>Photos</SectionTitle>
          <Label className="text-xs text-muted-foreground mb-2 block">Up to 5 photos</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-border/50">
                <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button onClick={handleImageUpload} className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex-shrink-0 flex flex-col items-center justify-center gap-1.5 hover:border-events/50 transition-colors bg-muted/30">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        </SectionCard>

        {/* ── EVENT INFO ── */}
        <SectionCard>
          <SectionTitle icon={Calendar}>Event Info</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">Event Name *</Label>
              <Input id="name" placeholder="e.g. Monthly Porsche Meet" value={formData.name} onChange={e => update('name', e.target.value)} className="rounded-xl h-11" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
              <Textarea id="description" placeholder="Tell people what to expect..." rows={3} value={formData.description} onChange={e => update('description', e.target.value)} className="rounded-xl" />
            </div>
          </div>
        </SectionCard>

        {/* ── EVENT TYPE ── */}
        <SectionCard>
          <SectionTitle icon={Calendar}>Event Type</SectionTitle>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => { setEventTypeMode('all'); setEventTypes([]); setErrors(prev => ({ ...prev, eventType: '' })); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                eventTypeMode === 'all'
                  ? 'bg-events text-events-foreground border-events shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border/50'
              }`}
            >
              All Event Types
            </button>
            <button
              onClick={() => setEventTypeMode('selected')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                eventTypeMode === 'selected'
                  ? 'bg-events text-events-foreground border-events shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border/50'
              }`}
            >
              Choose Types
            </button>
          </div>
          {eventTypeMode === 'selected' && (
            <div className="flex flex-wrap gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
              {EVENT_TYPES.map(type => (
                <button key={type} onClick={() => { toggleChip(eventTypes, setEventTypes, type); setErrors(prev => ({ ...prev, eventType: '' })); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    eventTypes.includes(type)
                      ? 'bg-events text-events-foreground border-events shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          )}
          {errors.eventType && <p className="text-xs text-destructive mt-2">{errors.eventType}</p>}
        </SectionCard>

        {/* ── DATE & TIME ── */}
        <SectionCard>
          <SectionTitle icon={Clock}>Date & Time</SectionTitle>
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
                  <CalendarUI mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); setErrors(prev => ({ ...prev, date: '' })); }} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9 text-xs rounded-xl" />
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
          {errors.date && <p className="text-xs text-destructive mt-2">{errors.date}</p>}
        </SectionCard>

        {/* ── LOCATION ── */}
        <SectionCard>
          <SectionTitle icon={MapPin}>Location</SectionTitle>
          <LocationPicker
            value={formData.location}
            onChange={(loc, coords) => { update('location', loc); update('locationCoords', coords); }}
            error={errors.location}
          />
        </SectionCard>

        {/* ── VEHICLE TYPE ── */}
        <SectionCard>
          <SectionTitle icon={Car}>Vehicle Type</SectionTitle>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => { setVehicleTypeMode('all'); setVehicleTypes([]); setErrors(prev => ({ ...prev, vehicleType: '' })); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                vehicleTypeMode === 'all'
                  ? 'bg-events text-events-foreground border-events shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border/50'
              }`}
            >
              All Welcome
            </button>
            <button
              onClick={() => setVehicleTypeMode('selected')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                vehicleTypeMode === 'selected'
                  ? 'bg-events text-events-foreground border-events shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border/50'
              }`}
            >
              Choose Types
            </button>
          </div>
          {vehicleTypeMode === 'selected' && (
            <div className="flex flex-wrap gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
              {VEHICLE_TYPES.map(type => (
                <button key={type} onClick={() => { toggleChip(vehicleTypes, setVehicleTypes, type); setErrors(prev => ({ ...prev, vehicleType: '' })); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    vehicleTypes.includes(type)
                      ? 'bg-events text-events-foreground border-events shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-events/40'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          )}
          {errors.vehicleType && <p className="text-xs text-destructive mt-2">{errors.vehicleType}</p>}
        </SectionCard>

        {/* ── VISIBILITY ── */}
        <SectionCard>
          <SectionTitle icon={Eye}>Visibility</SectionTitle>
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
              <Label className="text-xs text-muted-foreground mb-1.5 block">Choose Club *</Label>
              <Select value={clubId} onValueChange={(v) => { setClubId(v); setErrors(prev => ({ ...prev, club: '' })); }}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {mockClubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.club && <p className="text-xs text-destructive mt-1">{errors.club}</p>}
            </div>
          )}
        </SectionCard>

        {/* ── MAX ATTENDEES ── */}
        <SectionCard>
          <SectionTitle icon={Users}>Max Attendees</SectionTitle>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="maxAttendees" type="number" placeholder="Unlimited" className="pl-10 rounded-xl h-11" value={formData.maxAttendees} onChange={e => update('maxAttendees', e.target.value)} />
          </div>
        </SectionCard>

        {/* ── ENTRY FEE ── */}
        <SectionCard>
          <SectionTitle icon={DollarSign}>Entry Fee</SectionTitle>
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
    </div>
  );
};

export default AddEvent;
