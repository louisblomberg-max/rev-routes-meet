import { ArrowLeft, MapPin, Star, Phone, Globe, Clock, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockServices } from '@/data/mockData';

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const service = mockServices.find(s => s.id === id) || mockServices[0];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-services to-services/70">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center safe-top"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center safe-top">
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-services-light text-services">
              {service.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{service.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-services text-services" />
              <span className="font-medium">{service.rating}</span>
              <span className="text-muted-foreground">({service.reviewCount} reviews)</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>{service.distance} away</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button className="content-card flex flex-col items-center gap-2 py-4">
            <Phone className="w-6 h-6 text-services" />
            <span className="text-sm font-medium">Call</span>
          </button>
          <button className="content-card flex flex-col items-center gap-2 py-4">
            <Globe className="w-6 h-6 text-routes" />
            <span className="text-sm font-medium">Website</span>
          </button>
          <button className="content-card flex flex-col items-center gap-2 py-4">
            <MapPin className="w-6 h-6 text-events" />
            <span className="text-sm font-medium">Directions</span>
          </button>
        </div>

        {/* Opening Hours */}
        <div className="mt-4">
          <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Opening Hours
          </h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monday - Friday</span>
              <span className="font-medium">8:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saturday</span>
              <span className="font-medium">9:00 AM - 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sunday</span>
              <span className="font-medium text-events">Closed</span>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="mt-4">
          <h2 className="font-semibold text-foreground mb-2">Location</h2>
          <div className="h-40 bg-muted rounded-xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground/30" />
          </div>
        </div>

        {/* Contact Button */}
        <div className="mt-6 pb-8">
          <Button className="w-full bg-services hover:bg-services/90 text-services-foreground py-6 text-lg gap-2">
            <Phone className="w-5 h-5" />
            Contact Business
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
