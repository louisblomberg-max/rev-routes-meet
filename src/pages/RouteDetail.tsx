import { ArrowLeft, Ruler, Star, Car, Bike, Share2, Bookmark, Navigation } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockRoutes } from '@/data/mockData';

const RouteDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const route = mockRoutes.find(r => r.id === id) || mockRoutes[0];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header Map */}
      <div className="relative h-64 bg-gradient-to-br from-routes to-routes/70">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center safe-top"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
        
        {/* Route preview line placeholder */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
          <path 
            d="M 50 200 Q 150 100 250 150 T 350 120" 
            stroke="white" 
            strokeWidth="4" 
            strokeDasharray="8,8"
            fill="none"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-routes-light text-routes">
              {route.type}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{route.name}</h1>
          
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-routes" />
              <span className="font-medium">{route.distance}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-services text-services" />
              <span className="font-medium">{route.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              {(route.vehicleType === 'car' || route.vehicleType === 'both') && <Car className="w-5 h-5" />}
              {route.vehicleType === 'both' && <Bike className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="mt-4">
          <h2 className="font-semibold text-foreground mb-2">About this route</h2>
          <p className="text-muted-foreground">
            A beautiful {route.type.toLowerCase()} route perfect for a weekend drive. 
            Features stunning views and great road surfaces throughout.
          </p>
        </div>

        {/* Highlights */}
        <div className="mt-4">
          <h2 className="font-semibold text-foreground mb-2">Highlights</h2>
          <div className="flex flex-wrap gap-2">
            {['Great views', 'Smooth tarmac', 'Low traffic', 'Photo spots'].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Start Navigation Button */}
        <div className="mt-6 pb-8">
          <Button className="w-full bg-routes hover:bg-routes/90 text-routes-foreground py-6 text-lg gap-2">
            <Navigation className="w-5 h-5" />
            Start Navigation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteDetail;
