import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Search, Download, Camera, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type DashTab = 'attendees' | 'revenue' | 'scanner';

const OrganizerDashboard = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashTab>('attendees');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ type: 'valid' | 'already' | 'invalid'; name?: string; time?: string } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!eventId || !user?.id) return;
    const load = async () => {
      const { data: e } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (!e || e.created_by !== user.id) { toast.error('Access denied'); navigate(-1); return; }
      setEvent(e);

      const { data: tix } = await supabase
        .from('event_tickets')
        .select('*, profiles:user_id(id, display_name, username, avatar_url), vehicles:vehicle_id(make, model, year, colour)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      setTickets(tix || []);

      const { data: types } = await supabase.from('event_ticket_types').select('*').eq('event_id', eventId);
      setTicketTypes(types || []);

      setLoading(false);
    };
    load();
  }, [eventId, user?.id]);

  const confirmedTickets = tickets.filter(t => t.status === 'confirmed');
  const grossRevenue = confirmedTickets.reduce((sum, t) => sum + Number(t.amount_paid || 0), 0);
  const commission = grossRevenue * 0.05;
  const netRevenue = grossRevenue - commission;
  const checkedInCount = confirmedTickets.filter(t => t.checked_in).length;

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'confirmed' && t.status !== 'confirmed') return false;
    if (filterStatus === 'checked_in' && !t.checked_in) return false;
    if (filterStatus === 'not_checked_in' && (t.checked_in || t.status !== 'confirmed')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (t.profiles?.display_name || t.profiles?.username || '').toLowerCase();
      const vehicle = `${t.vehicles?.make || ''} ${t.vehicles?.model || ''}`.toLowerCase();
      if (!name.includes(q) && !vehicle.includes(q)) return false;
    }
    return true;
  });

  const handleCheckIn = async (ticketId: string, undo = false) => {
    const update = undo
      ? { checked_in: false, checked_in_at: null, checked_in_by: null }
      : { checked_in: true, checked_in_at: new Date().toISOString(), checked_in_by: user?.id };
    await supabase.from('event_tickets').update(update).eq('id', ticketId);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...update } : t));
    toast.success(undo ? 'Check-in undone' : 'Checked in!');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Username', 'Vehicle', 'Ticket Type', 'Amount', 'Status', 'Checked In', 'Notes'];
    const rows = tickets.map(t => [
      t.profiles?.display_name || '', t.profiles?.username || '',
      t.vehicles ? `${t.vehicles.make} ${t.vehicles.model} ${t.vehicles.year}` : '',
      ticketTypes.find(tt => tt.id === t.ticket_type_id)?.name || 'General',
      `£${Number(t.amount_paid).toFixed(2)}`, t.status,
      t.checked_in ? 'Yes' : 'No', t.notes || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${event?.title || 'event'}-attendees.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handleScanQR = useCallback(async (token: string) => {
    const { data: t } = await supabase.from('event_tickets')
      .select('*, profiles:user_id(display_name)')
      .eq('qr_code_token', token).eq('event_id', eventId).single();
    if (!t) { setScanResult({ type: 'invalid' }); return; }
    if (t.checked_in) {
      setScanResult({ type: 'already', name: t.profiles?.display_name, time: t.checked_in_at ? format(new Date(t.checked_in_at), 'HH:mm') : '' });
      return;
    }
    if (t.status !== 'confirmed') { setScanResult({ type: 'invalid' }); return; }
    await handleCheckIn(t.id);
    setScanResult({ type: 'valid', name: t.profiles?.display_name });
    setTimeout(() => setScanResult(null), 2500);
  }, [eventId]);

  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      const jsQR = (await import('jsqr')).default;
      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) handleScanQR(code.data);
      }, 500);
    } catch { toast.error('Camera not available'); }
  }, [handleScanQR]);

  const stopScanner = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (activeTab === 'scanner') startScanner();
    else stopScanner();
    return () => stopScanner();
  }, [activeTab, startScanner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 pt-12">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 safe-top border-b border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate">{event?.title}</h1>
            {event?.date_start && <p className="text-xs text-muted-foreground">{format(new Date(event.date_start), 'EEE d MMM yyyy · HH:mm')}</p>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        <div className="bg-green-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-green-700">{confirmedTickets.length}</p><p className="text-[10px] text-green-600">Attending</p></div>
        <div className="bg-blue-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-blue-700">{tickets.length}</p><p className="text-[10px] text-blue-600">Tickets</p></div>
        <div className="bg-orange-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-orange-700">{event?.max_attendees ? event.max_attendees - confirmedTickets.length : '∞'}</p><p className="text-[10px] text-orange-600">Left</p></div>
        <div className="bg-purple-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-purple-700">{checkedInCount}</p><p className="text-[10px] text-purple-600">Checked In</p></div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 px-4">
        {(['attendees', 'revenue', 'scanner'] as DashTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-[#d30d37] text-[#d30d37]' : 'border-transparent text-muted-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ─── ATTENDEES TAB ─── */}
      {activeTab === 'attendees' && (
        <div className="px-4 py-3 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 h-9" />
            </div>
            <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExportCSV}><Download className="w-3 h-3" /> CSV</Button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            {[{ id: 'all', label: 'All' }, { id: 'confirmed', label: 'Confirmed' }, { id: 'checked_in', label: 'Checked In' }, { id: 'not_checked_in', label: 'Not Checked In' }].map(f => (
              <button key={f.id} onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${filterStatus === f.id ? 'bg-foreground text-background border-foreground' : 'bg-background border-border/50'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {filteredTickets.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No attendees found</p>
          ) : (
            <div className="space-y-2">
              {filteredTickets.map(t => {
                const isExpanded = expandedTicket === t.id;
                return (
                  <div key={t.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                    <button onClick={() => setExpandedTicket(isExpanded ? null : t.id)} className="w-full p-3 flex items-center gap-3 text-left">
                      <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {t.profiles?.avatar_url ? <img src={t.profiles.avatar_url} className="w-full h-full rounded-full object-cover" /> : (t.profiles?.display_name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold truncate">{t.profiles?.display_name || 'Unknown'}</p>
                        <p className="text-[13px] text-muted-foreground">@{t.profiles?.username || '—'}</p>
                        {t.vehicles && <p className="text-[13px] text-muted-foreground">🚗 {t.vehicles.make} {t.vehicles.model} {t.vehicles.year} {t.vehicles.colour && `· ${t.vehicles.colour}`}</p>}
                        {!t.vehicles && <p className="text-[13px] text-muted-foreground/50">No vehicle specified</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {t.status}
                        </span>
                        {t.checked_in ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Amount:</span> £{Number(t.amount_paid).toFixed(2)}</div>
                          <div><span className="text-muted-foreground">Ref:</span> <span className="font-mono">{t.id.slice(-8).toUpperCase()}</span></div>
                          <div><span className="text-muted-foreground">Purchased:</span> {t.created_at ? format(new Date(t.created_at), 'd MMM HH:mm') : '—'}</div>
                          <div><span className="text-muted-foreground">Ticket:</span> {ticketTypes.find(tt => tt.id === t.ticket_type_id)?.name || 'General'}</div>
                        </div>
                        {t.status === 'confirmed' && (
                          <Button size="sm" className="w-full h-9" onClick={() => handleCheckIn(t.id, t.checked_in)}
                            style={t.checked_in ? undefined : { backgroundColor: '#d30d37' }}
                            variant={t.checked_in ? 'outline' : 'default'}>
                            {t.checked_in ? 'Undo Check-In' : 'Check In'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── REVENUE TAB ─── */}
      {activeTab === 'revenue' && (
        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border border-border/50 p-4"><p className="text-xs text-muted-foreground">Gross Revenue</p><p className="text-xl font-bold">£{grossRevenue.toFixed(2)}</p></div>
            <div className="bg-card rounded-xl border border-border/50 p-4"><p className="text-xs text-muted-foreground">Your Net Revenue</p><p className="text-xl font-bold text-green-700">£{netRevenue.toFixed(2)}</p></div>
            <div className="bg-card rounded-xl border border-border/50 p-4"><p className="text-xs text-muted-foreground">RevNet Fee (5%)</p><p className="text-xl font-bold text-muted-foreground">£{commission.toFixed(2)}</p></div>
            <div className="bg-card rounded-xl border border-border/50 p-4"><p className="text-xs text-muted-foreground">Tickets Sold</p><p className="text-xl font-bold">{confirmedTickets.length}</p></div>
          </div>

          {ticketTypes.length > 0 && (
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30"><p className="text-sm font-semibold">By Ticket Type</p></div>
              {ticketTypes.map(tt => {
                const sold = tickets.filter(t => t.ticket_type_id === tt.id && t.status === 'confirmed').length;
                const rev = sold * Number(tt.price);
                return (
                  <div key={tt.id} className="px-4 py-3 flex items-center justify-between border-b border-border/20 last:border-0">
                    <div><p className="text-sm font-medium">{tt.name}</p><p className="text-xs text-muted-foreground">£{Number(tt.price).toFixed(2)} · {sold}{tt.capacity ? `/${tt.capacity}` : ''} sold</p></div>
                    <p className="text-sm font-semibold">£{rev.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800">Payouts transfer automatically within 2 business days after the event via Stripe Connect.</p>
          </div>
        </div>
      )}

      {/* ─── SCANNER TAB ─── */}
      {activeTab === 'scanner' && (
        <div className="px-4 py-4 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold">Scan Tickets</h2>
            <p className="text-sm text-muted-foreground">Point camera at attendee QR code</p>
          </div>

          <div className="relative w-[300px] h-[300px] mx-auto rounded-2xl overflow-hidden bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {/* Corner markers */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />

            {/* Scan result overlay */}
            {scanResult && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 ${
                scanResult.type === 'valid' ? 'bg-green-600/90' : scanResult.type === 'already' ? 'bg-orange-500/90' : 'bg-red-600/90'
              }`}>
                {scanResult.type === 'valid' && <><Check className="w-16 h-16 mb-2" /><p className="text-xl font-bold">Valid Ticket</p><p className="text-sm">{scanResult.name}</p></>}
                {scanResult.type === 'already' && <><AlertTriangle className="w-16 h-16 mb-2" /><p className="text-xl font-bold">Already Checked In</p><p className="text-sm">{scanResult.name} at {scanResult.time}</p></>}
                {scanResult.type === 'invalid' && <><X className="w-16 h-16 mb-2" /><p className="text-xl font-bold">Invalid Ticket</p></>}
              </div>
            )}
          </div>

          {/* Manual entry */}
          <div className="flex gap-2">
            <Input value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Enter ticket code manually" className="flex-1" />
            <Button onClick={() => { if (manualCode.trim()) handleScanQR(manualCode.trim()); }} disabled={!manualCode.trim()}>Check</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
