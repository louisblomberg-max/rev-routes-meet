import { useState, useRef } from 'react';
import { ArrowLeft, Calendar, Car, Camera, X, DollarSign, Users, Clock, ImagePlus } from 'lucide-react';
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
import { toast } from 'sonner';
import LocationPicker from '@/components/LocationPicker';

const EVENT_TYPES = ['Meets', 'Cars & Coffee', 'Drive / Drive-Out', 'Group Drive', 'Track Day', 'Show / Exhibition'];
const VEHICLE_TYPES = ['All Welcome', 'Cars Only', 'Motorcycles Only', 'Classic Cars', 'Supercars Only', 'JDM Only', 'European Cars', 'American Muscle'];

const AddEvent = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    eventType: '',
    vehicleType: '',
    entryFee: false,
    feeAmount: '',
    maxAttendees: '',
  });
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
    if (!formData.eventType) errs.eventType = 'Select an event type';
    if (formData.entryFee && !formData.feeAmount) errs.feeAmount = 'Enter fee amount';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Add Event</h1>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Form */}
      <div className="px-4 py-5 space-y-5 pb-8">
        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photos <span className="text-muted-foreground font-normal text-xs">(up to 5)</span></Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                onClick={handleImageUpload}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex-shrink-0 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Event Name *</Label>
          <Input id="name" placeholder="e.g. Monthly Porsche Meet" value={formData.name} onChange={e => update('name', e.target.value)} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Tell people what to expect..." rows={3} value={formData.description} onChange={e => update('description', e.target.value)} />
        </div>

        {/* Event Type */}
        <div className="space-y-2">
          <Label>Event Type *</Label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(type => (
              <button key={type} onClick={() => update('eventType', type)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  formData.eventType === type ? 'border-events bg-events/10 text-events' : 'border-border hover:border-events/50'
                }`}>
                {type}
              </button>
            ))}
          </div>
          {errors.eventType && <p className="text-xs text-destructive">{errors.eventType}</p>}
        </div>

        {/* Date & Time with Calendar Popover */}
        <div className="space-y-3">
          <Label>Date & Time *</Label>
          <div className="grid grid-cols-2 gap-3">
            {/* Start Date */}
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Start</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 text-xs",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-3.5 w-3.5" />
                    {startDate ? format(startDate, "d MMM yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => { setStartDate(d); setErrors(prev => ({ ...prev, date: '' })); }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">End</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 text-xs",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-3.5 w-3.5" />
                    {endDate ? format(endDate, "d MMM yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        {/* Location */}
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

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label>Vehicle Type</Label>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_TYPES.map(type => (
              <button key={type} onClick={() => update('vehicleType', type)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  formData.vehicleType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                }`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Max Attendees */}
        <div className="space-y-2">
          <Label htmlFor="maxAttendees">Max Attendees</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="maxAttendees" type="number" placeholder="Unlimited" className="pl-10" value={formData.maxAttendees} onChange={e => update('maxAttendees', e.target.value)} />
          </div>
        </div>

        {/* Entry Fee */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Entry Fee</p>
              <p className="text-xs text-muted-foreground">Charge attendees?</p>
            </div>
          </div>
          <Switch checked={formData.entryFee} onCheckedChange={v => update('entryFee', v)} />
        </div>
        {formData.entryFee && (
          <div className="space-y-2">
            <Label htmlFor="feeAmount">Fee Amount (£)</Label>
            <Input id="feeAmount" type="number" placeholder="0.00" value={formData.feeAmount} onChange={e => update('feeAmount', e.target.value)} />
            {errors.feeAmount && <p className="text-xs text-destructive">{errors.feeAmount}</p>}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-events hover:bg-events/90 text-events-foreground h-12 text-base font-semibold">
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
};

export default AddEvent;
