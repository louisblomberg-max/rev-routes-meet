import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PenLine, Trash2, Plus, MapPin } from 'lucide-react';
import BackButton from '@/components/BackButton';

const MyServices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('services')
      .select('id, name, service_type, types, address, cover_url, is_emergency, is_24_7, status')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setServices(data || []);
        setIsLoading(false);
      });
  }, [user?.id]);

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (!window.confirm(`Delete "${serviceName}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('services').delete()
      .eq('id', serviceId).eq('created_by', user?.id ?? '');
    if (error) {
      toast.error('Failed to delete service');
    } else {
      toast.success('Service deleted');
      setDeletedIds(prev => new Set([...prev, serviceId]));
    }
  };

  const displayServices = services.filter(s => !deletedIds.has(s.id));

  return (
    <div className="mobile-container bg-background min-h-screen pb-24 md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} />
          <h1 className="text-lg font-bold flex-1">My Services</h1>
          <button
            onClick={() => navigate('/add/service')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: '#ff8000' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-services border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && displayServices.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No services yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your garage, workshop or automotive service</p>
            <button
              onClick={() => navigate('/add/service')}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#ff8000' }}
            >
              Add Service
            </button>
          </div>
        )}

        {displayServices.map(service => (
          <div key={service.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            {service.cover_url && (
              <img src={service.cover_url} className="w-full h-32 object-cover" alt="" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{service.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {service.types?.[0] || service.service_type || 'Service'}
                  </p>
                  {service.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{service.address}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {service.is_emergency && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">Emergency</span>
                  )}
                  {service.is_24_7 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-services/10 text-services font-semibold">24/7</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex border-t border-border/20">
              <button
                onClick={() => navigate(`/add/service?edit=${service.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 border-r border-border/20"
              >
                <PenLine className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(service.id, service.name)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyServices;
