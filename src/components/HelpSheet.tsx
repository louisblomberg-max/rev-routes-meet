import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle, AlertTriangle, Users, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { sendNotificationToMany } from '@/utils/sendNotification';
import { toast } from 'sonner';

type Problem = { id: string; label: string };

const PROBLEMS_URGENT: Problem[] = [
  { id: 'accident', label: 'Accident / Injury' },
];

const PROBLEMS_BREAKDOWN: Problem[] = [
  { id: 'breakdown', label: 'Mechanical Problem' },
  { id: 'flat_tyre', label: 'Flat Tyre' },
  { id: 'out_of_fuel', label: 'Out of Fuel' },
  { id: 'electrical', label: 'Electrical Issue' },
  { id: 'recovery', label: 'Need Recovery' },
];

const PROBLEMS_ASSISTANCE: Problem[] = [
  { id: 'locked_out', label: 'Locked Out' },
  { id: 'other', label: 'Other Emergency' },
];

// Flat list — used by existing select/handler logic and serves as the
// canonical problem catalog for typing.
const PROBLEMS: Problem[] = [
  ...PROBLEMS_URGENT,
  ...PROBLEMS_BREAKDOWN,
  ...PROBLEMS_ASSISTANCE,
];

const SOSChat = ({ requestId, userId }: { requestId: string; userId: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    supabase.from('sos_messages')
      .select('id, message, sender_id, created_at, profiles:sender_id(display_name, avatar_url)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages(data || []);
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = supabase.channel(`sos-chat-${requestId}-req`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'sos_messages',
        filter: `request_id=eq.${requestId}`
      }, async () => {
        const { data } = await supabase.from('sos_messages')
          .select('id, message, sender_id, created_at, profiles:sender_id(display_name, avatar_url)')
          .eq('request_id', requestId)
          .order('created_at', { ascending: true })
          .limit(100);
        setMessages(data || []);
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }).subscribe();

    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    };
  }, [requestId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    const msg = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    try {
      await supabase.from('sos_messages').insert({ request_id: requestId, sender_id: userId, message: msg });
    } catch { toast.error('Failed to send'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="border border-border/30 rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/20 bg-muted/30 flex items-center gap-2">
        <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold">Chat with helper</p>
        <p className="text-[10px] text-muted-foreground ml-auto">Private</p>
      </div>
      <div className="h-52 overflow-y-auto p-3 space-y-2 bg-background">
        {messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Your helper will message you here</p>}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.sender_id === userId ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0 mt-0.5">
              {msg.profiles?.avatar_url
                ? <img src={msg.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold">{msg.profiles?.display_name?.[0] || '?'}</span>}
            </div>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.sender_id === userId ? 'bg-destructive text-white' : 'bg-muted text-foreground'}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 p-2.5 border-t border-border/20 bg-muted/20">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }}}
          placeholder="Message your helper..."
          className="flex-1 bg-background border border-border/30 rounded-xl px-3 py-2 text-xs outline-none"
        />
        <button onClick={sendMessage} disabled={!newMessage.trim() || isSending}
          className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          style={{ background: '#ef4444' }}>
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
};

interface HelpSheetProps { open: boolean; onOpenChange: (open: boolean) => void; }

const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedProblem, setSelectedProblem] = useState<typeof PROBLEMS[0] | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [responders, setResponders] = useState<any[]>([]);
  const [minutesLeft, setMinutesLeft] = useState(30);
  const [locationReady, setLocationReady] = useState(false);
  const [stolenVehicle, setStolenVehicle] = useState({ make: '', model: '', colour: '', registration: '', description: '' });

  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const respondersChannelRef = useRef<any>(null);
  const latRef = useRef<number | null>(null);
  const lngRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setLocationReady(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => { latRef.current = pos.coords.latitude; lngRef.current = pos.coords.longitude; setLocationReady(true); },
      () => toast.error('Could not get location — please enable GPS'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [open]);

  useEffect(() => {
    if (!requestId) return;
    supabase.from('sos_responses')
      .select('id, responder_id, status, profiles:responder_id(display_name, avatar_url)')
      .eq('request_id', requestId).in('status', ['responding', 'arrived']).limit(20)
      .then(({ data }) => setResponders(data || []));

    if (respondersChannelRef.current) supabase.removeChannel(respondersChannelRef.current);
    respondersChannelRef.current = supabase.channel(`sos-resp-${requestId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_responses', filter: `request_id=eq.${requestId}` },
        async () => {
          const { data } = await supabase.from('sos_responses')
            .select('id, responder_id, status, profiles:responder_id(display_name, avatar_url)')
            .eq('request_id', requestId).in('status', ['responding', 'arrived']).limit(20);
          setResponders(data || []);
        }).subscribe();

    return () => { if (respondersChannelRef.current) { supabase.removeChannel(respondersChannelRef.current); respondersChannelRef.current = null; } };
  }, [requestId]);

  useEffect(() => {
    if (step !== 4) return;
    setMinutesLeft(30);
    countdownRef.current = setInterval(() => {
      setMinutesLeft(prev => { if (prev <= 1) { if (countdownRef.current) clearInterval(countdownRef.current); return 0; } return prev - 1; });
    }, 60000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [step]);

  const clearAllTimers = () => {
    if (expireTimerRef.current) { clearTimeout(expireTimerRef.current); expireTimerRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const handleClose = () => {
    clearAllTimers();
    if (respondersChannelRef.current) { supabase.removeChannel(respondersChannelRef.current); respondersChannelRef.current = null; }
    setStep(1); setSelectedProblem(null); setDetails(''); setRequestId(null);
    setResponders([]); setMinutesLeft(30); setLocationReady(false);
    setStolenVehicle({ make: '', model: '', colour: '', registration: '', description: '' });
    latRef.current = null; lngRef.current = null;
    onOpenChange(false);
  };

  const handleSubmitSOS = async () => {
    if (!selectedProblem || !user?.id || !locationReady || latRef.current === null || lngRef.current === null) {
      toast.error('Waiting for GPS location — please try again'); return;
    }
    setIsSubmitting(true);
    try {
      // Map problem to a default urgency. Crashes/recovery → emergency; mechanical → high; mild → medium.
      const urgency: 'low' | 'medium' | 'high' | 'emergency' =
        selectedProblem.id === 'accident' ? 'emergency' :
        ['breakdown', 'recovery', 'electrical'].includes(selectedProblem.id) ? 'high' :
        'medium';
      const { data: request, error } = await supabase.from('sos_requests').insert({
        user_id: user.id,
        title: selectedProblem.label,
        description: details.trim() || null,
        lat: latRef.current,
        lng: lngRef.current,
        status: 'active',
        urgency_level: urgency,
      }).select('id').single();
      if (error) throw error;
      setRequestId(request.id);

      const { data: helpers } = await supabase.from('profiles')
        .select('id, quiet_hours_start, quiet_hours_end')
        .eq('available_to_help', true).neq('id', user.id).limit(500);
      // Filter helpers currently in their quiet-hours window.
      // TODO: add radius-based filtering once helper location source is decided.
      const eligibleHelpers = (helpers ?? []).filter((h: any) => {
        const start: string | null = h.quiet_hours_start;
        const end: string | null = h.quiet_hours_end;
        if (!start || !end || start === end) return true;
        const trim = (t: string) => (t.length >= 5 ? t.slice(0, 5) : t);
        const [sh, sm] = trim(start).split(':').map(Number);
        const [eh, em] = trim(end).split(':').map(Number);
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        const inQuiet = startMin < endMin
          ? (nowMin >= startMin && nowMin < endMin)
          : (nowMin >= startMin || nowMin < endMin);
        return !inQuiet;
      });
      if (eligibleHelpers.length > 0) {
        await sendNotificationToMany({
          userIds: eligibleHelpers.map((h: any) => h.id),
          title: '🆘 SOS Alert Nearby',
          body: `Someone needs help: ${selectedProblem.label}${details ? ` — ${details.slice(0, 60)}` : ''}`,
          type: 'sos_request', data: { request_id: request.id },
        });
      }

      expireTimerRef.current = setTimeout(async () => {
        try {
          const { data: cur } = await supabase.from('sos_requests').select('status').eq('id', request.id).single();
          if (cur?.status === 'active') {
            await supabase.from('sos_requests').update({ status: 'cancelled', resolved_at: new Date().toISOString() }).eq('id', request.id);
            toast.error('SOS expired after 30 minutes. Call 999 if still needed.', { duration: 10000 });
            handleClose();
          }
        } catch { /* silent */ }
      }, 30 * 60 * 1000);

      setStep(4);
      toast.success('SOS sent — nearby members are being notified');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send SOS');
    } finally { setIsSubmitting(false); }
  };

  const handleResolve = async () => {
    clearAllTimers();
    if (requestId) await supabase.from('sos_requests').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', requestId).eq('user_id', user?.id ?? '');
    toast.success('Glad you got help! Stay safe 🙌');
    handleClose();
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your SOS request?')) return;
    clearAllTimers();
    if (requestId) await supabase.from('sos_requests').update({ status: 'cancelled', resolved_at: new Date().toISOString() }).eq('id', requestId).eq('user_id', user?.id ?? '');
    toast.info('SOS cancelled');
    handleClose();
  };

  const handleStolenVehicle = async () => {
    if (!stolenVehicle.make || !stolenVehicle.registration) { toast.error('Please enter make and registration'); return; }
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await supabase.from('stolen_vehicle_alerts').insert({
        user_id: user.id,
        last_seen_lat: latRef.current, last_seen_lng: lngRef.current,
        status: 'active',
        description: `${stolenVehicle.colour} ${stolenVehicle.make} ${stolenVehicle.model} — Reg: ${stolenVehicle.registration}. ${stolenVehicle.description}`.trim(),
      });
      const { data: helpers } = await supabase.from('profiles').select('id').eq('available_to_help', true).neq('id', user.id).limit(500);
      if (helpers && helpers.length > 0) {
        await sendNotificationToMany({
          userIds: helpers.map((h: any) => h.id),
          title: '🚨 Stolen Vehicle Alert',
          body: `${stolenVehicle.colour} ${stolenVehicle.make} ${stolenVehicle.model} — ${stolenVehicle.registration}`,
          type: 'stolen_vehicle', data: {},
        });
      }
      toast.success('Alert sent to nearby members');
      setStep(6);
    } catch (err: any) { toast.error(err?.message || 'Failed'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                {step === 1 && "What's wrong?"}
                {step === 2 && 'Add details'}
                {step === 3 && 'Confirm SOS'}
                {step === 4 && 'Help is coming'}
                {step === 5 && 'Stolen Vehicle'}
                {step === 6 && 'Alert Sent'}
              </h2>
              <p className="text-[10px] text-muted-foreground">{locationReady ? '📍 Location ready' : '📍 Getting location...'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {step === 1 && (
            <div className="space-y-6">
              {/* CRITICAL */}
              <div>
                <h3 className="text-xs font-bold text-red-700 mb-3 tracking-wide uppercase border-b border-red-200 pb-1">
                  Critical
                </h3>
                <div className="space-y-2">
                  {PROBLEMS_URGENT.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProblem(p); setStep(2); }}
                      className="w-full p-4 bg-white border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-colors text-left group"
                    >
                      <span className="font-semibold text-gray-900 group-hover:text-red-900">{p.label}</span>
                    </button>
                  ))}
                  {/* Stolen vehicle → dedicated step-5 form (writes to stolen_vehicle_alerts) */}
                  <button
                    onClick={() => setStep(5)}
                    className="w-full p-4 bg-white border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-colors text-left group"
                  >
                    <span className="font-semibold text-gray-900 group-hover:text-red-900">Vehicle Stolen</span>
                  </button>
                </div>
              </div>

              {/* BREAKDOWN */}
              <div>
                <h3 className="text-xs font-bold text-amber-700 mb-3 tracking-wide uppercase border-b border-amber-200 pb-1">
                  Breakdown
                </h3>
                <div className="space-y-2">
                  {PROBLEMS_BREAKDOWN.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProblem(p); setStep(2); }}
                      className="w-full p-4 bg-white border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg transition-colors text-left group"
                    >
                      <span className="font-semibold text-gray-900 group-hover:text-amber-900">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ASSISTANCE */}
              <div>
                <h3 className="text-xs font-bold text-blue-700 mb-3 tracking-wide uppercase border-b border-blue-200 pb-1">
                  Assistance
                </h3>
                <div className="space-y-2">
                  {PROBLEMS_ASSISTANCE.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProblem(p); setStep(2); }}
                      className="w-full p-4 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                    >
                      <span className="font-semibold text-gray-900 group-hover:text-blue-900">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedProblem && (
            <div className="space-y-4">
              {/* Selected problem display */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="font-semibold text-gray-900">{selectedProblem.label}</span>
              </div>

              {/* Details input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  ✏️ What's happening? <span className="text-muted-foreground font-normal">(Optional but helpful)</span>
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="e.g. Silver BMW on M25 Junction 10, hazard lights on, need jump start, safe location..."
                  className="w-full h-24 p-3 border border-border rounded-lg resize-none text-sm bg-background outline-none focus:border-red-400"
                  maxLength={300}
                />
                <div className="text-[11px] text-muted-foreground text-right mt-1">
                  {details.length}/300
                </div>
              </div>

              {/* Privacy notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">🔒</span>
                  <div className="text-[11px] text-blue-700 leading-relaxed">
                    <p className="font-semibold">Privacy: Only distance shown to helpers, never exact location.</p>
                    <p className="mt-0.5">You control what you share in chat conversations.</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
                <Button
                  className="flex-[2] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:bg-red-400 flex items-center justify-center gap-1.5"
                  onClick={() => setStep(3)}
                >
                  🆘 Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && selectedProblem && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-2">
                <p className="font-bold text-sm">{selectedProblem.label}</p>
                {details && <p className="text-xs text-muted-foreground">{details}</p>}
              </div>
              <div className="space-y-2">
                {[
                  { icon: '🔔', text: 'Nearby members with "Available to Help" on are notified' },
                  { icon: '📏', text: 'Helpers only see how far away you are — not your exact location' },
                  { icon: '💬', text: 'You connect via private in-app chat' },
                  { icon: '⏱️', text: 'SOS expires automatically after 30 minutes' },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <p className="text-xs text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(2)}>Back</Button>
                <Button disabled={isSubmitting || !locationReady} onClick={handleSubmitSOS}
                  className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold">
                  {isSubmitting ? 'Sending...' : !locationReady ? 'Getting location...' : 'Send SOS'}
                </Button>
              </div>
              <a href="tel:999" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-destructive/20 text-destructive text-sm font-medium">
                <Phone className="w-4 h-4" /> Call 999 for emergencies
              </a>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 relative">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 animate-ping absolute" />
                  <AlertTriangle className="w-8 h-8 text-destructive relative z-10" />
                </div>
                <h3 className="font-bold text-base">SOS Active</h3>
                <p className="text-xs text-muted-foreground mt-1">Nearby members are being notified</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Auto-expires in {minutesLeft} min</p>
              </div>
              {responders.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {responders.length} member{responders.length > 1 ? 's' : ''} responding
                  </p>
                  {responders.map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-green-100 flex-shrink-0">
                        {r.profiles?.avatar_url
                          ? <img src={r.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-green-700">{r.profiles?.display_name?.[0] || '?'}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{r.profiles?.display_name || 'RevNet Member'}</p>
                        <p className="text-[10px] text-green-600">{r.status === 'arrived' ? '✅ Arrived' : '🚗 On the way'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground animate-pulse">Alerting nearby members...</p>
                  <p className="text-[10px] text-muted-foreground mt-1">This may take a few minutes</p>
                </div>
              )}
              {requestId && responders.length > 0 && user?.id && (
                <SOSChat requestId={requestId} userId={user.id} />
              )}
              <a href="tel:999" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-destructive/30 text-destructive font-semibold text-sm">
                <Phone className="w-4 h-4" /> Call 999 (Emergency Services)
              </a>
              <Button onClick={handleResolve} className="w-full rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold h-12">
                <CheckCircle className="w-5 h-5 mr-2" /> I Got Help — Mark Resolved
              </Button>
              <button onClick={handleCancel} className="w-full py-2.5 text-xs text-muted-foreground">
                Cancel SOS Request
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-destructive/5 border border-destructive/20">
                <p className="text-sm font-bold text-destructive">🚨 Stolen Vehicle Alert</p>
                <p className="text-xs text-muted-foreground mt-1">This will alert all nearby RevNet members who have "Available to Help" on.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Make *</label>
                  <input value={stolenVehicle.make} onChange={e => setStolenVehicle(p => ({ ...p, make: e.target.value }))}
                    placeholder="e.g. BMW" className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-background outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Model</label>
                  <input value={stolenVehicle.model} onChange={e => setStolenVehicle(p => ({ ...p, model: e.target.value }))}
                    placeholder="e.g. M3" className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-background outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Colour</label>
                  <input value={stolenVehicle.colour} onChange={e => setStolenVehicle(p => ({ ...p, colour: e.target.value }))}
                    placeholder="e.g. Black" className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-background outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Registration *</label>
                  <input value={stolenVehicle.registration} onChange={e => setStolenVehicle(p => ({ ...p, registration: e.target.value.toUpperCase() }))}
                    placeholder="e.g. AB12 CDE" className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-background outline-none uppercase" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Additional details</label>
                <textarea value={stolenVehicle.description} onChange={e => setStolenVehicle(p => ({ ...p, description: e.target.value }))}
                  placeholder="Distinguishing features, last seen location..."
                  className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-background resize-none min-h-[80px] outline-none" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button disabled={isSubmitting || !stolenVehicle.make || !stolenVehicle.registration} onClick={handleStolenVehicle}
                  className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold">
                  {isSubmitting ? 'Sending...' : 'Send Alert'}
                </Button>
              </div>
              <a href="tel:999" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-destructive/20 text-destructive text-sm font-medium">
                <Phone className="w-4 h-4" /> Call 999 First
              </a>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <span className="text-3xl">🚨</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Alert Sent</h3>
                <p className="text-sm text-muted-foreground mt-1">Nearby members have been notified</p>
              </div>
              <a href="tel:999" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-destructive text-white font-bold text-base">
                <Phone className="w-5 h-5" /> Call 999 Now
              </a>
              <button onClick={handleClose} className="w-full py-2.5 text-sm text-muted-foreground">Close</button>
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;
