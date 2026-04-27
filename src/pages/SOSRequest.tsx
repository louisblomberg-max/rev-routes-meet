import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Phone, CheckCircle, Send, MessageCircle } from 'lucide-react';

const PROBLEM_LABELS: Record<string, { label: string; emoji: string }> = {
  flat_tyre: { label: 'Flat Tyre', emoji: '🔧' },
  breakdown: { label: 'Breakdown', emoji: '🚗' },
  out_of_fuel: { label: 'Out of Fuel', emoji: '⛽' },
  locked_out: { label: 'Locked Out', emoji: '🔑' },
  accident: { label: 'Accident', emoji: '⚠️' },
  electrical: { label: 'Electrical Issue', emoji: '⚡' },
  recovery: { label: 'Needs Recovery', emoji: '🚛' },
  other: { label: 'Needs Help', emoji: '🆘' },
};

const SOSRequest = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responderStatus, setResponderStatus] = useState<'none' | 'responding' | 'arrived'>('none');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [distance, setDistance] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatChannelRef = useRef<any>(null);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    if (dist < 1) return `${Math.round(dist * 1000)}m away`;
    return `${dist.toFixed(1)} miles away`;
  };

  useEffect(() => {
    if (!requestId) return;
    setIsLoading(true);
    supabase.from('sos_requests')
      .select('id, title, description, status, created_at, user_id, helper_id, lat, lng, location, profiles:user_id(display_name, avatar_url)')
      .eq('id', requestId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { toast.error('Request not found'); navigate(-1); return; }
        // Map new schema to legacy field names the rest of this component expects
        setRequest({
          ...data,
          issue_type: (data as any).title ? (data as any).title.toLowerCase().replace(/\s+/g, '_') : 'other',
          details: (data as any).description,
        });
        setIsLoading(false);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (data.lat && data.lng) {
              setDistance(calculateDistance(pos.coords.latitude, pos.coords.longitude, data.lat, data.lng));
            }
          },
          () => setDistance('Distance unavailable'),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

    if (user?.id) {
      supabase.from('sos_responses')
        .select('status')
        .eq('request_id', requestId)
        .eq('responder_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) { setResponderStatus(data.status as any); setShowChat(true); }
        });
    }
  }, [requestId, user?.id]);

  useEffect(() => {
    if (!requestId || !showChat) return;
    supabase.from('sos_messages')
      .select('id, message, sender_id, created_at, profiles:sender_id(display_name, avatar_url)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages(data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

    if (chatChannelRef.current) supabase.removeChannel(chatChannelRef.current);
    chatChannelRef.current = supabase.channel(`sos-chat-${requestId}-helper`)
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
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }).subscribe();

    return () => {
      if (chatChannelRef.current) { supabase.removeChannel(chatChannelRef.current); chatChannelRef.current = null; }
    };
  }, [requestId, showChat]);

  const handleAccept = async () => {
    if (!user?.id || !requestId) return;
    setIsAccepting(true);
    try {
      await supabase.from('sos_responses').upsert({
        request_id: requestId, responder_id: user.id, status: 'responding',
      });
      // Mark the new sos_requests row as 'helping' with this user as helper
      await supabase.from('sos_requests')
        .update({ status: 'helping', helper_id: user.id })
        .eq('id', requestId)
        .eq('status', 'active'); // only flip if still active
      await supabase.from('sos_messages').insert({
        request_id: requestId, sender_id: user.id,
        message: "I'm on my way to help you. Stay safe.",
      });
      setResponderStatus('responding');
      setShowChat(true);
      toast.success("You're now helping — stay in contact via chat");
    } catch (err: any) {
      toast.error(err.message || 'Failed to respond');
    } finally { setIsAccepting(false); }
  };

  const handleArrived = async () => {
    if (!user?.id || !requestId) return;
    await supabase.from('sos_responses').update({
      status: 'arrived', arrived_at: new Date().toISOString(),
    }).eq('request_id', requestId).eq('responder_id', user.id);
    await supabase.from('sos_messages').insert({
      request_id: requestId, sender_id: user.id,
      message: "I've arrived at your location.",
    });
    setResponderStatus('arrived');
    toast.success('Marked as arrived');
  };

  const handleCancelResponse = async () => {
    if (!window.confirm('Cancel your response?')) return;
    if (!user?.id || !requestId) return;
    await supabase.from('sos_responses').update({ status: 'cancelled' })
      .eq('request_id', requestId).eq('responder_id', user.id);
    await supabase.from('sos_messages').insert({
      request_id: requestId, sender_id: user.id,
      message: "Sorry, I'm no longer able to help.",
    });
    toast.info('Response cancelled');
    navigate(-1);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !requestId || isSending) return;
    const msg = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    try {
      await supabase.from('sos_messages').insert({
        request_id: requestId, sender_id: user.id, message: msg,
      });
    } catch { toast.error('Failed to send'); }
    finally { setIsSending(false); }
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) return null;

  const problem = PROBLEM_LABELS[request.issue_type] || { label: request.title || 'Needs Help', emoji: '🆘' };
  const isResolved = ['resolved', 'cancelled', 'expired'].includes(request.status);

  return (
    <div className="mobile-container bg-background min-h-dvh flex flex-col">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 safe-top">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{problem.emoji} {problem.label}</h1>
            <p className="text-xs text-muted-foreground">{distance || 'Calculating distance...'}</p>
          </div>
          {isResolved && (
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground flex-shrink-0 capitalize">
              {request.status}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-8">
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl flex-shrink-0">{problem.emoji}</span>
            <div>
              <p className="font-bold text-base">{problem.label}</p>
              <p className="text-xs text-muted-foreground">{distance || 'Calculating...'}</p>
            </div>
          </div>
          {request.details && (
            <div className="bg-background/60 rounded-xl px-3 py-2.5">
              <p className="text-sm text-foreground/80 italic">"{request.details}"</p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1 border-t border-destructive/10">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {request.profiles?.avatar_url
                ? <img src={request.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                : <span className="w-full h-full flex items-center justify-center text-xs font-bold">{request.profiles?.display_name?.[0] || '?'}</span>}
            </div>
            <p className="text-xs text-muted-foreground">{request.profiles?.display_name || 'RevNet Member'} needs help</p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-3 border border-border/20">
          <p className="text-xs text-muted-foreground">🔒 Exact location is private. Connect via chat — they can share details directly with you.</p>
        </div>

        {!isResolved && (
          <div className="space-y-2.5">
            {responderStatus === 'none' && (
              <>
                <button onClick={handleAccept} disabled={isAccepting}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  style={{ background: '#ef4444' }}>
                  <CheckCircle className="w-5 h-5" />
                  {isAccepting ? 'Connecting...' : 'I Can Help'}
                </button>
                <button onClick={() => navigate(-1)} className="w-full py-3 rounded-2xl border border-border/50 text-sm font-medium text-muted-foreground">
                  Can't Help Right Now
                </button>
              </>
            )}
            {responderStatus === 'responding' && (
              <>
                <div className="w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 text-sm font-semibold flex items-center justify-center gap-2">
                  🚗 You're on your way
                </div>
                <button onClick={() => setShowChat(!showChat)}
                  className="w-full py-3 rounded-2xl border border-border/50 text-sm font-semibold flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {showChat ? 'Hide Chat' : 'Open Chat'}
                </button>
                <button onClick={handleArrived}
                  className="w-full py-3 rounded-2xl bg-green-500 text-white text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> I've Arrived
                </button>
                <button onClick={handleCancelResponse} className="w-full py-2 text-xs text-muted-foreground">
                  Cancel my response
                </button>
              </>
            )}
            {responderStatus === 'arrived' && (
              <>
                <div className="w-full py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> You've arrived
                </div>
                <button onClick={() => setShowChat(!showChat)}
                  className="w-full py-3 rounded-2xl border border-border/50 text-sm font-semibold flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {showChat ? 'Hide Chat' : 'Open Chat'}
                </button>
              </>
            )}
          </div>
        )}

        {isResolved && (
          <div className="w-full py-4 rounded-2xl bg-muted/50 border border-border/30 text-muted-foreground text-sm font-medium text-center capitalize">
            This SOS request is {request.status}
          </div>
        )}

        <a href="tel:999" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-destructive/20 text-destructive text-sm font-semibold active:scale-95 transition-all">
          <Phone className="w-4 h-4" /> Call 999 (Emergency Services)
        </a>

        {showChat && (
          <div className="border border-border/30 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border/20 bg-muted/30 flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold">Private Chat</p>
              <p className="text-[10px] text-muted-foreground ml-auto">Private</p>
            </div>
            <div className="h-64 overflow-y-auto p-3 space-y-2 bg-background">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No messages yet</p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.sender_id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0 mt-0.5">
                    {msg.profiles?.avatar_url
                      ? <img src={msg.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold">{msg.profiles?.display_name?.[0] || '?'}</span>}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.sender_id === user?.id ? 'bg-destructive text-white' : 'bg-muted text-foreground'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {!isResolved && (
              <div className="flex gap-2 p-3 border-t border-border/20 bg-muted/20">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                  placeholder="Type a message..."
                  className="flex-1 bg-background border border-border/30 rounded-xl px-3 py-2 text-xs outline-none"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim() || isSending}
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                  style={{ background: '#ef4444' }}>
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSRequest;
