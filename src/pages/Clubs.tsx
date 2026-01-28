import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockClubs } from '@/data/mockData';

const Clubs = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 safe-top">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Clubs</h1>
        </div>
        <p className="text-muted-foreground">
          Find and join car & bike clubs near you
        </p>
      </div>

      {/* Club Cards */}
      <div className="px-4 space-y-3 pb-8">
        {mockClubs.map((club) => (
          <div key={club.id} className="content-card">
            <div className="flex items-center gap-4">
              {/* Club Avatar */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-clubs to-clubs/70 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">
                  {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{club.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{club.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Users className="w-4 h-4" />
                  <span>{club.members.toLocaleString()} members</span>
                </div>
              </div>

              {/* Join Button */}
              <Button 
                variant="outline"
                className="border-clubs text-clubs hover:bg-clubs hover:text-clubs-foreground flex-shrink-0"
              >
                Join
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clubs;
