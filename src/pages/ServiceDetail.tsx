import { useState } from 'react';
import { MapPin, Star, Phone, Globe, Clock, Share2, Bookmark } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockServices } from '@/data/mockData';
import NavigateButton from '@/components/NavigateButton';

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  
  const service = mockServices.find(s => s.id === id) || mockServices[0];

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Service unsaved' : 'Service saved!');
  };

  const handleShare = () => {
    toast.success('Link copied to clipboard!');
  };

  const handleCall = () => {
    toast.success(`Calling ${service.phone}...`);
  };

  const handleWebsite = () => {
    toast.success('Opening website...');
  };

  const handleDirections = () => {
    toast.success('Opening directions...');
  };

  const handleContact = () => {
    toast.success(`Contacting ${service.name}...`);
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-services to-services/70">
        <BackButton className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur safe-top hover:bg-white" />
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button 
            onClick={handleSave}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors active:scale-95 ${
              isSaved ? 'bg-primary text-white' : 'bg-white/90 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : 'text-foreground'}`} />
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors active:scale-95"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative pb-8">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-services/15 text-services">
              {service.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{service.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
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
          <button 
            onClick={handleCall}
            className="bg-card rounded-xl border border-border/30 shadow-sm flex flex-col items-center gap-2 py-4 hover:bg-muted/50 transition-colors active:scale-[0.98]"
          >
            <Phone className="w-6 h-6 text-services" />
            <span className="text-sm font-medium">Call</span>
          </button>
          <button 
            onClick={handleWebsite}
            className="bg-card rounded-xl border border-border/30 shadow-sm flex flex-col items-center gap-2 py-4 hover:bg-muted/50 transition-colors active:scale-[0.98]"
          >
            <Globe className="w-6 h-6 text-routes" />
            <span className="text-sm font-medium">Website</span>
          </button>
          <button 
            onClick={handleDirections}
            className="bg-card rounded-xl border border-border/30 shadow-sm flex flex-col items-center gap-2 py-4 hover:bg-muted/50 transition-colors active:scale-[0.98]"
          >
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

        {/* Navigate Button */}
        <div className="mt-6">
          <NavigateButton
            destination={{ lat: 51.5074, lng: -0.1278, title: service.name }}
            colorClass="bg-services hover:bg-services/90"
          />
        </div>

        {/* Contact Button */}
        <div className="mt-3">
          <Button 
            onClick={handleContact}
            variant="outline"
            className="w-full py-6 text-lg gap-2"
          >
            <Phone className="w-5 h-5" />
            Contact Business
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
