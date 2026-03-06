import { useState } from 'react';
import { MapPin, Star, Phone, Globe, Clock, Share2, Bookmark, Flag, CheckCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import NavigateButton from '@/components/NavigateButton';

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state, services: servicesRepo } = useData();

  const service = state.services.find(s => s.id === id);
  const isSavedInitial = state.savedServices.includes(id || '');
  const [isSaved, setIsSaved] = useState(isSavedInitial);

  if (!service) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <MapPin className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-1">Service not found</h2>
        <p className="text-sm text-muted-foreground mb-6">This service may have been removed.</p>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Discovery</Button>
      </div>
    );
  }

  const handleSave = () => {
    if (isSaved) {
      servicesRepo.unsaveService(state.currentUser?.id || '', service.id);
    } else {
      servicesRepo.saveService(state.currentUser?.id || '', service.id);
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Service unsaved' : 'Service saved!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleCall = () => {
    if (service.phone) window.open(`tel:${service.phone}`);
    else toast.info('No phone number available');
  };

  const handleWebsite = () => {
    if (service.website) window.open(service.website, '_blank');
    else toast.info('No website available');
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-services to-services/60 overflow-hidden">
        {service.coverImage && (
          <img src={service.coverImage} alt={service.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <BackButton className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur safe-top hover:bg-white" />
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button onClick={handleSave}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors active:scale-95 ${isSaved ? 'bg-primary text-white' : 'bg-white/90 hover:bg-white'}`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : 'text-foreground'}`} />
          </button>
          <button onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors active:scale-95">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-6 relative pb-8 space-y-4">
        <div className="bg-card rounded-2xl shadow-lg p-5 border border-border/30">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-services/15 text-services text-xs">{service.category}</Badge>
            {service.isOpen && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Open Now</Badge>}
            {!service.isOpen && <Badge variant="outline" className="text-xs text-muted-foreground">Closed</Badge>}
            {service.isVerified && (
              <Badge className="bg-primary/10 text-primary text-xs gap-1"><CheckCircle className="w-3 h-3" />Verified</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{service.name}</h1>
          {service.tagline && <p className="text-sm text-muted-foreground mt-1">{service.tagline}</p>}

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-semibold">{service.rating}</span>
              <span className="text-sm text-muted-foreground">({service.reviewCount})</span>
            </div>
            <span className="text-sm text-muted-foreground">{service.priceRange}</span>
            <span className="text-sm text-muted-foreground">{service.distance}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleCall} className="bg-card rounded-xl border border-border/30 shadow-sm flex flex-col items-center gap-2 py-4 hover:bg-muted/50 transition-colors active:scale-[0.98]">
            <Phone className="w-5 h-5 text-services" />
            <span className="text-xs font-medium">Call</span>
          </button>
          <button onClick={handleWebsite} className="bg-card rounded-xl border border-border/30 shadow-sm flex flex-col items-center gap-2 py-4 hover:bg-muted/50 transition-colors active:scale-[0.98]">
            <Globe className="w-5 h-5 text-routes" />
            <span className="text-xs font-medium">Website</span>
          </button>
          <button onClick={() => { if (service.lat && service.lng) navigate('/'); else toast.info('No location set'); }}
            className="bg-card rounded-xl border border-border/30 shadow-sm flex flex-col items-center gap-2 py-4 hover:bg-muted/50 transition-colors active:scale-[0.98]">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium">Directions</span>
          </button>
        </div>

        {/* Service types */}
        {service.serviceTypes && service.serviceTypes.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/30 p-5">
            <h2 className="font-semibold text-foreground mb-3">Services Offered</h2>
            <div className="flex flex-wrap gap-1.5">
              {service.serviceTypes.map(st => (
                <Badge key={st} variant="secondary" className="text-xs">{st}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        <div className="bg-card rounded-2xl border border-border/30 p-5">
          <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Clock className="w-4 h-4" />Opening Hours</h2>
          <p className="text-sm text-muted-foreground">{service.openingHours}</p>
        </div>

        {/* Address */}
        <div className="bg-card rounded-2xl border border-border/30 p-5">
          <h2 className="font-semibold text-foreground mb-2">Address</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" />{service.address}</p>
        </div>

        {/* Navigate */}
        <NavigateButton
          destination={{ lat: service.lat ?? 51.5074, lng: service.lng ?? -0.1278, title: service.name }}
          colorClass="bg-services hover:bg-services/90"
        />

        {/* Contact */}
        <Button variant="outline" className="w-full py-5 text-base gap-2" onClick={handleCall}>
          <Phone className="w-5 h-5" /> Contact Business
        </Button>

        {/* Report */}
        <button onClick={() => toast.info('Report submitted')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors mx-auto">
          <Flag className="w-4 h-4" /> Report this service
        </button>
      </div>
    </div>
  );
};

export default ServiceDetail;
