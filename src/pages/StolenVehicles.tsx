import { useState } from 'react';
import { ShieldAlert, MapPin, Clock, Car, AlertTriangle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';

const StolenVehicles = () => {
  const { state } = useData();
  const alerts = state.stolenAlerts || [];
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  const filtered = filter === 'active'
    ? alerts.filter(a => a.status === 'active')
    : alerts;

  // Mock data for demo when no real alerts exist
  const mockAlerts = [
    {
      id: 'mock-1',
      userId: 'user-1',
      vehicleDescription: 'Blue BMW M3 F80 — Reg: AB12 CDE',
      lat: 51.5074,
      lng: -0.1278,
      status: 'active' as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'mock-2',
      userId: 'user-2',
      vehicleDescription: 'White Audi RS3 — Reg: XY67 FGH',
      lat: 51.4545,
      lng: -0.9781,
      status: 'active' as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'mock-3',
      userId: 'user-3',
      vehicleDescription: 'Black Mercedes C63 AMG — Reg: JK34 LMN',
      lat: 52.4862,
      lng: -1.8904,
      status: 'resolved' as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  const displayAlerts = filtered.length > 0 ? filtered : (filter === 'active' ? mockAlerts.filter(a => a.status === 'active') : mockAlerts);

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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-10 h-10 rounded-xl bg-muted/80 hover:bg-muted" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Stolen Vehicle Alerts
            </h1>
            <p className="text-[11px] text-muted-foreground">Broadcasted to all members within 50 miles</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex rounded-xl border border-border/50 overflow-hidden">
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              filter === 'active'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            Active Alerts
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            All Alerts
          </button>
        </div>
      </div>

      {/* Alerts list */}
      <div className="px-4 py-3 space-y-2">
        {displayAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No stolen vehicle alerts</p>
            <p className="text-xs text-muted-foreground mt-1">Alerts from nearby members will appear here</p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${
                alert.status === 'active'
                  ? 'border-destructive/30 bg-destructive/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  alert.status === 'active' ? 'bg-destructive/15' : 'bg-muted'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${alert.status === 'active' ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{alert.vehicleDescription}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{timeAgo(alert.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {alert.lat.toFixed(2)}, {alert.lng.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={alert.status === 'active' ? 'destructive' : 'secondary'}
                  className="text-[10px] shrink-0"
                >
                  {alert.status === 'active' ? 'ACTIVE' : 'Resolved'}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info footer */}
      <div className="px-4 pb-6">
        <p className="text-center text-[11px] text-muted-foreground">
          Stolen vehicle alerts are broadcast to all RevNet members within 50 miles of the reported location.
        </p>
      </div>
    </div>
  );
};

export default StolenVehicles;
