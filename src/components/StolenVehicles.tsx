import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Search, Plus, Car, Calendar, Phone, Award, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StolenVehicle {
  alert_id: string;
  registration_plate: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  colour: string | null;
  description: string | null;
  police_reference: string | null;
  date_stolen: string | null;
  reward_amount: number;
  photos: string[];
  reported_by_name: string;
  distance_km?: number | null;
  created_at: string;
}

interface FormData {
  registration_plate: string;
  make: string;
  model: string;
  year: string;
  colour: string;
  description: string;
  police_reference: string;
  date_stolen: string;
  contact_phone: string;
  reward_amount: string;
  last_seen_lat: number;
  last_seen_lng: number;
}

const EMPTY_FORM = (lat = 0, lng = 0): FormData => ({
  registration_plate: '',
  make: '',
  model: '',
  year: '',
  colour: '',
  description: '',
  police_reference: '',
  date_stolen: '',
  contact_phone: '',
  reward_amount: '0',
  last_seen_lat: lat,
  last_seen_lng: lng,
});

export default function StolenVehicles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<StolenVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    registration: '',
    make: '',
    model: '',
    colour: '',
  });
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM());

  // Open report form when arriving with ?action=report
  useEffect(() => {
    if (searchParams.get('action') === 'report') {
      setShowReportForm(true);
    }
  }, [searchParams]);

  // Capture user's location for the report form (best-effort)
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          last_seen_lat: pos.coords.latitude,
          last_seen_lng: pos.coords.longitude,
        }));
      },
      () => { /* user denied or unavailable — fine, they can still report */ },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );
  }, []);

  // Initial load
  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadList = async () => {
    setLoading(true);
    if (!('geolocation' in navigator)) {
      await loadFallback();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { data, error } = await supabase.rpc('get_stolen_vehicles_nearby', {
          user_lat: pos.coords.latitude,
          user_lng: pos.coords.longitude,
          max_distance_km: 50,
        });
        if (error) {
          console.warn('get_stolen_vehicles_nearby failed, falling back:', error);
          await loadFallback();
          return;
        }
        setVehicles((data ?? []) as StolenVehicle[]);
        setLoading(false);
      },
      async () => {
        await loadFallback();
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );
  };

  const loadFallback = async () => {
    const { data, error } = await supabase
      .from('stolen_vehicle_alerts')
      .select('id, registration_plate, make, model, year, colour, description, police_reference, date_stolen, reward_amount, photos, created_at, profiles:user_id (display_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      toast.error('Failed to load stolen vehicles');
      setLoading(false);
      return;
    }
    const mapped: StolenVehicle[] = (data ?? []).map((r: any) => ({
      alert_id: r.id,
      registration_plate: r.registration_plate,
      make: r.make,
      model: r.model,
      year: r.year,
      colour: r.colour,
      description: r.description,
      police_reference: r.police_reference,
      date_stolen: r.date_stolen,
      reward_amount: r.reward_amount ?? 0,
      photos: r.photos ?? [],
      reported_by_name: r.profiles?.display_name ?? 'Anonymous',
      distance_km: null,
      created_at: r.created_at,
    }));
    setVehicles(mapped);
    setLoading(false);
  };

  const runSearch = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('search_stolen_vehicles', {
      search_reg_plate: searchFilters.registration || null,
      search_make: searchFilters.make || null,
      search_model: searchFilters.model || null,
      search_colour: searchFilters.colour || null,
    });
    if (error) {
      toast.error('Search failed');
    } else {
      setVehicles((data ?? []) as StolenVehicle[]);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchFilters({ registration: '', make: '', model: '', colour: '' });
    void loadList();
  };

  const closeReportForm = () => {
    setShowReportForm(false);
    if (searchParams.get('action')) {
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      setSearchParams(next, { replace: true });
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to report a stolen vehicle');
      return;
    }
    if (!formData.registration_plate || !formData.make || !formData.police_reference) {
      toast.error('Registration, make and police reference are required');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('stolen_vehicle_alerts')
      .insert({
        user_id: user.id,
        registration_plate: formData.registration_plate.toUpperCase(),
        make: formData.make,
        model: formData.model || null,
        year: formData.year ? parseInt(formData.year, 10) : null,
        colour: formData.colour || null,
        description: formData.description || null,
        police_reference: formData.police_reference,
        date_stolen: formData.date_stolen ? new Date(formData.date_stolen).toISOString() : null,
        contact_phone: formData.contact_phone || null,
        reward_amount: parseInt(formData.reward_amount, 10) || 0,
        last_seen_lat: formData.last_seen_lat || null,
        last_seen_lng: formData.last_seen_lng || null,
        status: 'active',
      });
    setSubmitting(false);
    if (error) {
      console.error('stolen_vehicle_alerts insert error:', error);
      toast.error('Failed to submit report');
      return;
    }
    toast.success('Stolen vehicle reported. Stay safe.');
    setFormData(EMPTY_FORM(formData.last_seen_lat, formData.last_seen_lng));
    closeReportForm();
    void loadList();
  };

  // ─── REPORT FORM ───
  if (showReportForm) {
    return (
      <div className="container mx-auto p-4 max-w-2xl pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={closeReportForm} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Report Stolen Vehicle</h1>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Please report this theft to the police first and obtain a crime reference number before submitting this community alert.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmitReport} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Registration plate <span className="text-red-600">*</span></label>
                  <Input
                    value={formData.registration_plate}
                    onChange={(e) => setFormData((p) => ({ ...p, registration_plate: e.target.value }))}
                    placeholder="e.g., AB12 CDE"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Make <span className="text-red-600">*</span></label>
                  <Input
                    value={formData.make}
                    onChange={(e) => setFormData((p) => ({ ...p, make: e.target.value }))}
                    placeholder="e.g., BMW"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData((p) => ({ ...p, model: e.target.value }))}
                    placeholder="e.g., 3 Series"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Colour</label>
                  <Input
                    value={formData.colour}
                    onChange={(e) => setFormData((p) => ({ ...p, colour: e.target.value }))}
                    placeholder="e.g., Black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date stolen</label>
                  <Input
                    type="datetime-local"
                    value={formData.date_stolen}
                    onChange={(e) => setFormData((p) => ({ ...p, date_stolen: e.target.value }))}
                    max={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Distinguishing features, modifications, damage..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Police &amp; contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Police reference number <span className="text-red-600">*</span></label>
                <Input
                  value={formData.police_reference}
                  onChange={(e) => setFormData((p) => ({ ...p, police_reference: e.target.value }))}
                  placeholder="Crime reference, e.g., CR2026/001234"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact phone (optional)</label>
                  <Input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData((p) => ({ ...p, contact_phone: e.target.value }))}
                    placeholder="+44 7..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reward (£)</label>
                  <Input
                    type="number"
                    value={formData.reward_amount}
                    onChange={(e) => setFormData((p) => ({ ...p, reward_amount: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={closeReportForm} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700">
              {submitting ? 'Submitting…' : 'Submit report'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ─── LIST VIEW ───
  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Stolen Vehicles</h1>
        </div>
        <Button onClick={() => setShowReportForm(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Report stolen
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-5 w-5" />
            Search stolen vehicles
          </CardTitle>
          <CardDescription>
            Check the community database for a vehicle that may have been stolen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3 mb-3">
            <Input
              placeholder="Registration"
              value={searchFilters.registration}
              onChange={(e) => setSearchFilters((p) => ({ ...p, registration: e.target.value }))}
            />
            <Input
              placeholder="Make"
              value={searchFilters.make}
              onChange={(e) => setSearchFilters((p) => ({ ...p, make: e.target.value }))}
            />
            <Input
              placeholder="Model"
              value={searchFilters.model}
              onChange={(e) => setSearchFilters((p) => ({ ...p, model: e.target.value }))}
            />
            <Input
              placeholder="Colour"
              value={searchFilters.colour}
              onChange={(e) => setSearchFilters((p) => ({ ...p, colour: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={runSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={clearSearch}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Active alerts ({vehicles.length})
        </h2>

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-neutral-200 rounded w-1/3" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                    <div className="h-3 bg-neutral-200 rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-base font-semibold mb-1">No stolen vehicles found</h3>
              <p className="text-sm text-muted-foreground">
                No matches for your search, or no vehicles reported in your area.
              </p>
            </CardContent>
          </Card>
        ) : (
          vehicles.map((v) => (
            <Card key={v.alert_id} className="border-l-4 border-l-red-500">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-red-700 truncate">
                        {v.registration_plate || 'Unknown plate'}
                      </h3>
                      {v.distance_km != null && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {v.distance_km}km away
                        </Badge>
                      )}
                      {v.reward_amount > 0 && (
                        <Badge className="flex items-center gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          <Award className="h-3 w-3" />
                          £{v.reward_amount} reward
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {[v.year, v.colour, v.make, v.model].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reported by {v.reported_by_name}
                    </p>
                  </div>

                  <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                    {v.date_stolen && (
                      <div className="flex items-center gap-1 justify-end mb-0.5">
                        <Calendar className="h-3 w-3" />
                        Stolen {format(new Date(v.date_stolen), 'd MMM yyyy')}
                      </div>
                    )}
                    <div>Reported {format(new Date(v.created_at), 'd MMM yyyy')}</div>
                  </div>
                </div>

                {v.description && (
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    {v.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  {v.police_reference && (
                    <div>Police ref: <span className="font-mono">{v.police_reference}</span></div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { window.location.href = 'tel:101'; }}
                    title="Non-emergency police"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Report sighting (101)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
