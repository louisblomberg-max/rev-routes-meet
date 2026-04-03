import { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, Clock, Car, AlertTriangle, CheckCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const StolenVehicles = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    let query = supabase.from('stolen_vehicle_alerts').select('*').order('created_at', { ascending: false });
    if (filter === 'active') query = query.eq('status', 'active');
    const { data, error: err } = await query;
    if (err) { setError(err.message); setIsLoading(false); return; }
    setAlerts(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [filter]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel('stolen-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stolen_vehicle_alerts' },
        (payload) => { setAlerts(prev => [payload.new as any, ...prev]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleResolve = async (alertId: string) => {
    const { error } = await supabase.from('stolen_vehicle_alerts').update({ status: 'resolved' }).eq('id', alertId).eq('user_id', user?.id);
    if (error) { toast.error('Failed to resolve alert'); return; }
    toast.success('Alert marked as resolved');
    fetchAlerts();
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-10 h-10 rounded-xl bg-muted/80 hover:bg-muted" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-destructive" />Stolen Vehicle Alerts</h1>
            <p className="text-[11px] text-muted-foreground">Broadcasted to all members within 50 miles</p>
          </div>
        </div>
      </div>
      <div className="px-4 pt-3 pb-2">
        <div className="flex rounded-xl border border-border/50 overflow-hidden">
          <button onClick={() => setFilter('active')} className={`flex-1 py-2.5 text-xs font-semibold transition-all ${filter === 'active' ? 'bg-destructive text-destructive-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>Active Alerts</button>
          <button onClick={() => setFilter('all')} className={`flex-1 py-2.5 text-xs font-semibold transition-all ${filter === 'all' ? 'bg-destructive text-destructive-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>All Alerts</button>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-2">
              <Skeleton className="h-5 w-48" /><Skeleton className="h-3 w-24" />
            </div>
          ))
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Something went wrong</p>
            <Button variant="outline" onClick={fetchAlerts} className="mt-3">Retry</Button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No stolen vehicle alerts</p>
            <p className="text-xs text-muted-foreground mt-1">Alerts from nearby members will appear here</p>
          </div>
        ) : alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-xl border ${alert.status === 'active' ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert.status === 'active' ? 'bg-destructive/15' : 'bg-muted'}`}>
                <AlertTriangle className={`w-5 h-5 ${alert.status === 'active' ? 'text-destructive' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{alert.description || 'Vehicle alert'}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">{timeAgo(alert.created_at)}</span></div>
                  {alert.last_seen_lat && <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">{Number(alert.last_seen_lat).toFixed(2)}, {Number(alert.last_seen_lng).toFixed(2)}</span></div>}
                </div>
                {alert.status === 'active' && alert.user_id === user?.id && (
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => handleResolve(alert.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                  </Button>
                )}
              </div>
              <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">{alert.status === 'active' ? 'ACTIVE' : 'Resolved'}</Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-6"><p className="text-center text-[11px] text-muted-foreground">Stolen vehicle alerts are broadcast to all RevNet members within 50 miles of the reported location.</p></div>
    </div>
  );
};

export default StolenVehicles;
