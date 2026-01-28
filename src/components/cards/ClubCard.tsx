import { MapPin, Users } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  location: string;
  members: number;
  image: string | null;
}

interface ClubCardProps {
  club: Club;
  onClick: () => void;
}

const ClubCard = ({ club, onClick }: ClubCardProps) => {
  return (
    <button 
      onClick={onClick}
      className="content-card w-full text-left"
    >
      <div className="flex items-center gap-4">
        {/* Club Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clubs to-clubs/70 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-white">
            {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{club.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {club.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {club.members.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ClubCard;
