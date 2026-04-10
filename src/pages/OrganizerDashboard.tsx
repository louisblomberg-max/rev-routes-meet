import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { sendNotificationToMany } from '@/utils/sendNotification';
import { ArrowLeft, Search, Download, Check, X, AlertTriangle, Send, Pencil, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type DashTab = 'details' | 'attendees' | 'revenue' | 'scanner';

const OrganizerDashboard = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashTab>('attendees');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: 'valid' | 'already' | 'invalid'; name?: string; vehicle?: string; time?: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const recentlyScannedRef = useRef<Map<string, number>>(new Map());

  const fetchData = useCallback(async () => {
    if (!eventId || !user?.id) return;
    const { data: e } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (!e || e.created_by !== user.id) { toast.error('Access denied'); navigate(-1); return; }
    setEvent(e);

    const { data: att } = await supabase.from('event_attendees')
      .select('*, profiles:user_id(id, display_name, username, avatar_url)')
      .eq('event_id', eventId).order('created_at', { ascending: false });
    setAttendees(att || []);

    const { data: tix } = await supabase.from('event_tickets')
      .select('*, profiles:user_id(id, display_name, username, avatar_url), vehicles:vehicle_id(make, model, year, colour)')
      .eq('event_id', eventId).order('created_at', { ascending: false });
    setTickets(tix || []);

    const { data: types } = await supabase.from('event_ticket_types').select('*').eq('event_id', eventId);
    setTicketTypes(types || []);
    setLoading(false);
  }, [eventId, user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime updates
  useEffect(() => {
    if (!eventId) return;
    const channel = supabase.channel(`org-dash-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_attendees', filter: `event_id=eq.${eventId}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_tickets', filter: `event_id=eq.${eventId}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId, fetchData]);

  const confirmedTickets = tickets.filter(t => t.status === 'confirmed');
  const grossRevenue = confirmedTickets.reduce((sum, t) => sum + Number(t.amount_paid || 0), 0);
  const commission = grossRevenue * 0.05;
  const netRevenue = grossRevenue - commission;
  const checkedInCount = attendees.filter(a => a.checked_in).length;

  // Merge attendees with their ticket data
  const mergedAttendees = attendees.map(a => {
    const ticket = tickets.find(t => t.user_id === a.user_id);
    return { ...a, ticket };
  });

  const filteredAttendees = mergedAttendees.filter(a => {
    if (filterStatus === 'checked_in' && !a.checked_in) return false;
    if (filterStatus === 'not_checked_in' && a.checked_in) return false;
    if (filterStatus === 'ticket_holders' && !a.ticket) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (a.profiles?.display_name || a.profiles?.username || '').toLowerCase();
      const vehicle = a.ticket?.vehicles ? `${a.ticket.vehicles.make} ${a.ticket.vehicles.model}`.toLowerCase() : '';
      if (!name.includes(q) && !vehicle.includes(q)) return false;
    }
    return true;
  });

  const handleCheckIn = async (attendee: any) => {
    const newCheckedIn = !attendee.checked_in;
    const update = newCheckedIn
      ? { checked_in: true, checked_in_at: new Date().toISOString() }
      : { checked_in: false, checked_in_at: null };

    await supabase.from('event_attendees').update(update).eq('event_id', eventId).eq('user_id', attendee.user_id);
    if (attendee.ticket) {
      await supabase.from('event_tickets').update(update).eq('id', attendee.ticket.id);
    }
    setAttendees(prev => prev.map(a => a.user_id === attendee.user_id ? { ...a, ...update } : a));
    toast.success(newCheckedIn ? 'Checked in!' : 'Check-in undone');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Username', 'Vehicle', 'Ticket Type', 'Amount', 'Status', 'Checked In'];
    const rows = mergedAttendees.map(a => [
      a.profiles?.display_name || '', a.profiles?.username || '',
      a.ticket?.vehicles ? `${a.ticket.vehicles.make} ${a.ticket.vehicles.model} ${a.ticket.vehicles.year}` : '',
      ticketTypes.find((tt: any) => tt.id === a.ticket?.ticket_type_id)?.name || 'Free',
      a.ticket ? `£${Number(a.ticket.amount_paid).toFixed(2)}` : 'Free',
      a.ticket?.status || 'attending', a.checked_in ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${event?.title || 'event'}-attendees.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.trim() || !eventId) return;
    setSendingAnnouncement(true);
    try {
      const userIds = mergedAttendees.map((a: any) => a.user_id).filter(Boolean);
      if (userIds.length === 0) { toast.error('No attendees to notify'); return; }
      await sendNotificationToMany({
        userIds,
        title: `📢 ${event?.title || 'Event Update'}`,
        body: announcement.trim(),
        type: 'event_announcement',
        data: { event_id: eventId },
      });
      setAnnouncement('');
      toast.success(`Announcement sent to ${userIds.length} attendee${userIds.length !== 1 ? 's' : ''}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send announcement');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!eventId) return;
    setCancelling(true);
    await supabase.from('events').update({ status: 'cancelled' }).eq('id', eventId);
    const atts = attendees.map(a => a.user_id).filter(id => id && id !== user?.id);
    await sendNotificationToMany({
      userIds: atts,
      title: '❌ Event Cancelled',
      body: `${event?.title || 'An event'} you were attending has been cancelled`,
      type: 'event_cancelled',
      data: { event_id: eventId },
    });
    toast.success('Event cancelled. All attendees notified.');
    setCancelling(false);
    navigate(-1);
  };

  const handleScanQR = useCallback(async (token: string) => {
    if (!eventId || isProcessing) return;

    // Ignore same token for 5 seconds to prevent rescanning
    const now = Date.now();
    const lastScanned = recentlyScannedRef.current.get(token);
    if (lastScanned && now - lastScanned < 5000) return;
    recentlyScannedRef.current.set(token, now);

    // Clean up old entries
    for (const [t, ts] of recentlyScannedRef.current.entries()) {
      if (now - ts > 10000) recentlyScannedRef.current.delete(t);
    }

    setIsProcessing(true);
    // Check paid tickets first
    const { data: ticket } = await supabase.from('event_tickets')
      .select('*, profiles:user_id(display_name), vehicles:vehicle_id(make, model, year)')
      .eq('qr_code_token', token).eq('event_id', eventId).maybeSingle();

    if (ticket) {
      if (ticket.checked_in) {
        setScanResult({ type: 'already', name: ticket.profiles?.display_name, time: ticket.checked_in_at ? format(new Date(ticket.checked_in_at), 'HH:mm') : '' });
      } else if (ticket.status !== 'confirmed') {
        setScanResult({ type: 'invalid' });
      } else {
        await supabase.from('event_tickets').update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq('id', ticket.id);
        await supabase.from('event_attendees').update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq('event_id', eventId).eq('user_id', ticket.user_id);
        setScanResult({ type: 'valid', name: ticket.profiles?.display_name, vehicle: ticket.vehicles ? `${ticket.vehicles.make} ${ticket.vehicles.model}` : undefined });
      }
    } else {
      // Check free attendees
      const { data: att } = await supabase.from('event_attendees')
        .select('*, profiles:user_id(display_name)')
        .eq('qr_code_token', token).eq('event_id', eventId).maybeSingle();
      if (!att) { setScanResult({ type: 'invalid' }); }
      else if (att.checked_in) { setScanResult({ type: 'already', name: att.profiles?.display_name }); }
      else {
        await supabase.from('event_attendees').update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq('id', att.id);
        setScanResult({ type: 'valid', name: att.profiles?.display_name });
      }
    }
    setTimeout(() => { setScanResult(null); setIsProcessing(false); fetchData(); }, 3000);
  }, [eventId, fetchData, isProcessing]);

  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsScanning(true);
      const jsQR = (await import('jsqr')).default;
      const scan = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx || videoRef.current.readyState < videoRef.current.HAVE_ENOUGH_DATA) {
          animFrameRef.current = requestAnimationFrame(scan);
          return;
        }
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) handleScanQR(code.data);
        animFrameRef.current = requestAnimationFrame(scan);
      };
      animFrameRef.current = requestAnimationFrame(scan);
    } catch {
      toast.error('Camera not available. Please grant camera permission.');
    }
  }, [handleScanQR]);

  const stopScanner = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Stop scanner when leaving scanner tab — but do NOT auto-start
  useEffect(() => {
    if (activeTab !== 'scanner') stopScanner();
    return () => stopScanner();
  }, [activeTab, stopScanner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 pt-12">
        <Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-32 mb-6" />
        <div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 safe-top border-b border-border/50 flex items-center gap-3">
        <button onClick={() => navigate('/my-events')} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-foreground truncate">{event?.title}</h1>
          {event?.date_start && <p className="text-xs text-muted-foreground">{format(new Date(event.date_start), 'EEE d MMM yyyy · HH:mm')}</p>}
        </div>
        <button onClick={() => navigate(`/event/${eventId}`)} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        <div className="bg-green-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-green-700">{attendees.length}</p><p className="text-[10px] text-green-600">Attending</p></div>
        <div className="bg-blue-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-blue-700">{event?.max_attendees ? `${attendees.length}/${event.max_attendees}` : 'Unlimited'}</p><p className="text-[10px] text-blue-600">Capacity</p></div>
        <div className="bg-orange-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-orange-700">£{netRevenue.toFixed(0)}</p><p className="text-[10px] text-orange-600">Revenue</p></div>
        <div className="bg-purple-50 rounded-xl p-2.5 text-center"><p className="text-lg font-bold text-purple-700">{checkedInCount}</p><p className="text-[10px] text-purple-600">Checked In</p></div>
      </div>

      {/* Capacity progress bar */}
      {event?.max_attendees && (
        <div className="px-4 pb-2">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (attendees.length / event.max_attendees) * 100)}%`, backgroundColor: attendees.length >= event.max_attendees ? '#ef4444' : '#d30d37' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{attendees.length} / {event.max_attendees} capacity</p>
        </div>
      )}

      {/* Tabs — only show relevant tabs */}
      <div className="flex border-b border-border/50 px-4">
        {(['details', 'attendees', ...(event?.is_ticketed ? ['revenue'] : []), ...((event?.is_ticketed || event?.max_attendees) ? ['scanner'] : [])] as DashTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-[#d30d37] text-[#d30d37]' : 'border-transparent text-muted-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ─── DETAILS TAB ─── */}
      {activeTab === 'details' && (
        <div className="px-4 py-4 space-y-5">
          {event?.banner_url && <img src={event.banner_url} alt="" className="w-full h-[120px] object-cover rounded-xl" />}
          <div className="space-y-3">
            <div><p className="text-xs text-muted-foreground">Title</p><p className="font-semibold">{event?.title}</p></div>
            <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm">{event?.date_start ? format(new Date(event.date_start), 'EEE d MMM yyyy · HH:mm') : '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm">{event?.location || '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm text-muted-foreground">{event?.description || 'No description'}</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${event?.status === 'published' ? 'bg-green-100 text-green-700' : event?.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>{event?.status}</span>
            </div>
          </div>

          {/* Announcements */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Send Announcement</p>
            <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Type an announcement for all attendees..."
              className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-background min-h-[80px] resize-none" />
            <Button onClick={handleSendAnnouncement} disabled={!announcement.trim() || sendingAnnouncement} size="sm" className="gap-1.5" style={{ backgroundColor: '#d30d37' }}>
              <Send className="w-3.5 h-3.5" /> {sendingAnnouncement ? 'Sending...' : `Send to ${attendees.length} attendees`}
            </Button>
          </div>

          {/* Cancel event */}
          {event?.status !== 'cancelled' && (
            <div className="pt-4 border-t border-border/50">
              <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => { if (confirm(`Cancel ${event?.title}? All ${attendees.length} attendees will be notified.`)) handleCancelEvent(); }}
                disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Cancel Event'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── ATTENDEES TAB ─── */}
      {activeTab === 'attendees' && (
        <div className="px-4 py-3 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 h-9" /></div>
            <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExportCSV}><Download className="w-3 h-3" /> CSV</Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {[{ id: 'all', label: 'All' }, { id: 'checked_in', label: 'Checked In' }, { id: 'not_checked_in', label: 'Not Checked In' }, { id: 'ticket_holders', label: 'Ticket Holders' }].map(f => (
              <button key={f.id} onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${filterStatus === f.id ? 'bg-foreground text-background border-foreground' : 'bg-background border-border/50'}`}>{f.label}</button>
            ))}
          </div>
          {filteredAttendees.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No attendees found</p>
          ) : (
            <div className="space-y-2">
              {filteredAttendees.map(a => {
                const isExp = expandedId === a.user_id;
                const t = a.ticket;
                return (
                  <div key={a.user_id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                    <button onClick={() => setExpandedId(isExp ? null : a.user_id)} className="w-full p-3 flex items-center gap-3 text-left">
                      <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                        {a.profiles?.avatar_url ? <img src={a.profiles.avatar_url} className="w-full h-full object-cover" /> : (a.profiles?.display_name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold truncate">{a.profiles?.display_name || 'Unknown'}</p>
                        <p className="text-[13px] text-muted-foreground">@{a.profiles?.username || '—'}</p>
                        {t?.vehicles ? <p className="text-[13px] text-muted-foreground">🚗 {t.vehicles.make} {t.vehicles.model} {t.vehicles.year} {t.vehicles.colour && `· ${t.vehicles.colour}`}</p> : <p className="text-[13px] text-muted-foreground/50">No vehicle specified</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t?.status === 'confirmed' ? 'bg-green-100 text-green-700' : t ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {t?.status === 'confirmed' ? 'Ticket' : t ? 'Pending' : 'Free'}
                        </span>
                        {a.checked_in ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                      </div>
                    </button>
                    {isExp && (
                      <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-2">
                        {t && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-muted-foreground">Amount:</span> £{Number(t.amount_paid).toFixed(2)}</div>
                            <div><span className="text-muted-foreground">Ref:</span> <span className="font-mono">{(t.qr_code_token || t.id).slice(-8).toUpperCase()}</span></div>
                            <div><span className="text-muted-foreground">Purchased:</span> {t.created_at ? format(new Date(t.created_at), 'd MMM HH:mm') : '—'}</div>
                            <div><span className="text-muted-foreground">Ticket:</span> {ticketTypes.find((tt: any) => tt.id === t.ticket_type_id)?.name || 'General'}</div>
                          </div>
                        )}
                        <Button size="sm" className="w-full h-9" onClick={() => handleCheckIn(a)}
                          style={a.checked_in ? undefined : { backgroundColor: '#d30d37' }}
                          variant={a.checked_in ? 'outline' : 'default'}>
                          {a.checked_in ? `Undo Check-In (${a.checked_in_at ? format(new Date(a.checked_in_at), 'HH:mm') : ''})` : 'Check In'}
                        </Button>
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
              {ticketTypes.map((tt: any) => {
                const sold = tickets.filter(t => t.ticket_type_id === tt.id && t.status === 'confirmed').length;
                return (
                  <div key={tt.id} className="px-4 py-3 flex items-center justify-between border-b border-border/20 last:border-0">
                    <div><p className="text-sm font-medium">{tt.name}</p><p className="text-xs text-muted-foreground">£{Number(tt.price).toFixed(2)} · {sold}{tt.capacity ? `/${tt.capacity}` : ''} sold</p></div>
                    <p className="text-sm font-semibold">£{(sold * Number(tt.price)).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="bg-blue-50 rounded-xl p-4"><p className="text-sm font-medium text-blue-800">Payouts transfer automatically within 2 business days after the event via Stripe Connect.</p></div>
        </div>
      )}

      {/* ─── SCANNER TAB ─── */}
      {activeTab === 'scanner' && (
        <div className="px-4 py-4 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold">Scan Tickets</h2>
            <p className="text-sm text-muted-foreground">{isScanning ? 'Point camera at attendee QR code' : 'Tap Start Scanner to begin checking in attendees'}</p>
          </div>

          {!isScanning ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                <Camera className="w-10 h-10 text-muted-foreground" />
              </div>
              <Button onClick={startScanner} className="h-12 px-8 rounded-xl text-base gap-2" style={{ backgroundColor: '#d30d37' }}>
                <Camera className="w-5 h-5" /> Start Scanner
              </Button>
            </div>
          ) : (
            <>
              <div className="relative w-[300px] h-[300px] mx-auto rounded-2xl overflow-hidden bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
                {scanResult && (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 ${scanResult.type === 'valid' ? 'bg-green-600/90' : scanResult.type === 'already' ? 'bg-orange-500/90' : 'bg-red-600/90'}`}>
                    {scanResult.type === 'valid' && <><Check className="w-16 h-16 mb-2" /><p className="text-xl font-bold">Valid Ticket</p>{scanResult.name && <p className="text-sm">{scanResult.name}</p>}{scanResult.vehicle && <p className="text-xs opacity-80">{scanResult.vehicle}</p>}</>}
                    {scanResult.type === 'already' && <><AlertTriangle className="w-16 h-16 mb-2" /><p className="text-xl font-bold">Already Checked In</p>{scanResult.name && <p className="text-sm">{scanResult.name}</p>}{scanResult.time && <p className="text-xs opacity-80">at {scanResult.time}</p>}</>}
                    {scanResult.type === 'invalid' && <><X className="w-16 h-16 mb-2" /><p className="text-xl font-bold">Invalid Ticket</p></>}
                  </div>
                )}
              </div>
              <Button onClick={stopScanner} variant="outline" className="w-full h-10 rounded-xl gap-2">
                <X className="w-4 h-4" /> Stop Scanner
              </Button>
            </>
          )}

          <div className="flex gap-2">
            <Input value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Enter ticket code manually" className="flex-1" />
            <Button onClick={() => { if (manualCode.trim()) { handleScanQR(manualCode.trim()); setManualCode(''); } }} disabled={!manualCode.trim()}>Check</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
