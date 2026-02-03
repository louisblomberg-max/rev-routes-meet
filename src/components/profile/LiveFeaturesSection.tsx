import { MapPin, Navigation, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/data/profileData';

interface LiveFeaturesSectionProps {
  liveFeatures: UserProfile['liveFeatures'];
  isOwnProfile?: boolean;
}

const LiveFeaturesSection = ({ liveFeatures, isOwnProfile = true }: LiveFeaturesSectionProps) => {
  const { locationSharingEnabled, groupDrivesCount, breakdownHelpCount } = liveFeatures;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Live Features
      </h2>

      <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
        {/* Location Sharing Status */}
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            locationSharingEnabled ? 'bg-routes/10' : 'bg-muted/80'
          }`}>
            <MapPin className={`w-5 h-5 ${locationSharingEnabled ? 'text-routes' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1">
            <span className="font-medium text-foreground">Live Location</span>
            <p className="text-xs text-muted-foreground">
              {locationSharingEnabled ? 'Sharing with friends' : 'Not sharing'}
            </p>
          </div>
          {isOwnProfile && (
            <button className="p-1">
              {locationSharingEnabled ? (
                <ToggleRight className="w-8 h-8 text-routes" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-muted-foreground" />
              )}
            </button>
          )}
          {!isOwnProfile && (
            <Badge variant={locationSharingEnabled ? 'default' : 'secondary'} className="text-xs">
              {locationSharingEnabled ? 'Active' : 'Off'}
            </Badge>
          )}
        </div>

        {/* Group Drives */}
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-foreground/70" />
          </div>
          <div className="flex-1">
            <span className="font-medium text-foreground">Group Drives</span>
            <p className="text-xs text-muted-foreground">Joined or created</p>
          </div>
          <span className="text-sm font-semibold text-foreground bg-muted/80 px-2.5 py-0.5 rounded-full">
            {groupDrivesCount}
          </span>
        </div>

        {/* Breakdown Help */}
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-foreground/70" />
          </div>
          <div className="flex-1">
            <span className="font-medium text-foreground">Breakdown Help</span>
            <p className="text-xs text-muted-foreground">Responses given</p>
          </div>
          <span className="text-sm font-semibold text-foreground bg-muted/80 px-2.5 py-0.5 rounded-full">
            {breakdownHelpCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveFeaturesSection;
