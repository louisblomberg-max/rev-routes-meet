import { MapPin, Star, Clock, Phone, Globe, Navigation, Bookmark, Share2, Shield, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RevService } from '@/models';
import { toast } from 'sonner';

interface ServiceDetailContentProps {
  service: RevService;
  onNavigate: () => void;
  onViewFull: () => void;
}

const ServiceDetailContent = ({ service, onNavigate, onViewFull }: ServiceDetailContentProps) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: service.name, text: `Check out ${service.name} on RevNet` }).catch(() => {});
    } else {
      toast.success('Link copied');
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative h-36 -mx-5 -mt-1 rounded-t-2xl overflow-hidden">
        {service.coverImage ? (
          <img src={service.coverImage} alt={service.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-services/80 to-services/40 flex items-center justify-center">
            {service.logo ? (
              <img src={service.logo} alt={service.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <MapPin className="w-12 h-12 text-services-foreground/60" />
            )}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 className="text-lg font-bold text-white">{service.name}</h2>
          {service.tagline && <p className="text-xs text-white/80">{service.tagline}</p>}
        </div>
      </div>

      {/* Status + category */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-services/10 text-services border-services/20 text-xs">
          {service.category}
        </Badge>
        <Badge
          variant="outline"
          className={`text-xs ${service.isOpen ? 'bg-services/10 text-services border-services/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}
        >
          {service.isOpen ? 'Open now' : 'Closed'}
        </Badge>
        {service.isVerified && (
          <Badge variant="outline" className="text-xs bg-routes/10 text-routes border-routes/20 gap-1">
            <BadgeCheck className="w-3 h-3" /> Verified
          </Badge>
        )}
        {service.insuranceVerified && (
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" /> Insured
          </Badge>
        )}
      </div>

      {/* Service types */}
      {service.serviceTypes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {service.serviceTypes.map(st => (
            <span key={st} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">{st}</span>
          ))}
        </div>
      )}

      {/* Description */}
      {(service as any).description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{(service as any).description}</p>
      )}

      {/* Info rows */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 text-sm">
          <Star className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-foreground">{service.rating} ({service.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{service.address}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{service.openingHours}</span>
        </div>
        {service.phone && (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <a href={`tel:${service.phone}`} className="text-foreground hover:underline">{service.phone}</a>
          </div>
        )}
      </div>

      {/* Contact buttons */}
      <div className="flex gap-2">
        {service.phone && (
          <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(`tel:${service.phone}`)}>
            <Phone className="w-4 h-4" /> Call
          </Button>
        )}
        {service.website && (
          <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(service.website, '_blank')}>
            <Globe className="w-4 h-4" /> Website
          </Button>
        )}
        <Button variant="outline" className="flex-1 gap-2" onClick={onNavigate}>
          <Navigation className="w-4 h-4" /> Directions
        </Button>
      </div>

      {/* Actions row */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.success('Saved')}>
          <Bookmark className="w-4 h-4" /> Save
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </div>

      {/* View full */}
      <button
        onClick={onViewFull}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        View full details →
      </button>
    </div>
  );
};

export default ServiceDetailContent;
