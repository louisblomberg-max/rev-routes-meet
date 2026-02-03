import { useState } from 'react';
import { Car, Bike, Plus, ChevronDown, ChevronUp, Eye, Users, Lock, Settings, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/data/profileData';

interface GarageSectionProps {
  vehicles: Vehicle[];
  isOwnProfile?: boolean;
}

const GarageSection = ({ vehicles, isOwnProfile = true }: GarageSectionProps) => {
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  const visibilityIcons = {
    public: { icon: Eye, label: 'Public' },
    friends: { icon: Users, label: 'Friends' },
    private: { icon: Lock, label: 'Private' },
  };

  const toggleExpand = (id: string) => {
    setExpandedVehicle(expandedVehicle === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Garage
        </h2>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <Plus className="w-3 h-3" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Vehicles */}
      <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
        {vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <Car className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No vehicles in garage</p>
            {isOwnProfile && (
              <Button variant="outline" size="sm" className="mt-3 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add your first vehicle
              </Button>
            )}
          </div>
        ) : (
          vehicles.map((vehicle) => {
            const VehicleIcon = vehicle.type === 'car' ? Car : Bike;
            const VisibilityIcon = visibilityIcons[vehicle.visibility].icon;
            const isExpanded = expandedVehicle === vehicle.id;

            return (
              <div key={vehicle.id} className="overflow-hidden">
                {/* Vehicle Header */}
                <button
                  onClick={() => toggleExpand(vehicle.id)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted/80 flex items-center justify-center">
                    <VehicleIcon className="w-6 h-6 text-foreground/70" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </span>
                    </div>
                    {vehicle.engineTrim && (
                      <p className="text-xs text-muted-foreground truncate">{vehicle.engineTrim}</p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Badge variant="outline" className="gap-1 text-xs shrink-0">
                      <VisibilityIcon className="w-3 h-3" />
                      {visibilityIcons[vehicle.visibility].label}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-muted/20">
                    {/* Mods */}
                    {vehicle.mods && vehicle.mods.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                          <Wrench className="w-3 h-3" />
                          Modifications
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {vehicle.mods.map((mod, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs font-normal">
                              {mod}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {vehicle.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-foreground/80">{vehicle.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {isOwnProfile && (
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="text-xs flex-1">
                          <Settings className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GarageSection;
