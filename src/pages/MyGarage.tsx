import { useState } from 'react';
import { ArrowLeft, Car, Bike, Plus, ChevronDown, ChevronUp, Eye, Users, Lock, Wrench, Settings, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Vehicle, mockUserProfile } from '@/data/profileData';

const MyGarage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockUserProfile.garage);
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: 'car' as 'car' | 'bike',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    engineTrim: '',
    notes: '',
    visibility: 'public' as 'public' | 'friends' | 'private',
  });

  const visibilityIcons = {
    public: { icon: Eye, label: 'Public' },
    friends: { icon: Users, label: 'Friends' },
    private: { icon: Lock, label: 'Private' },
  };

  const toggleExpand = (id: string) => {
    setExpandedVehicle(expandedVehicle === id ? null : id);
  };

  const handleAddVehicle = () => {
    if (!newVehicle.make.trim() || !newVehicle.model.trim()) {
      toast.error('Please fill in make and model');
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      type: newVehicle.type,
      make: newVehicle.make,
      model: newVehicle.model,
      year: newVehicle.year,
      engineTrim: newVehicle.engineTrim || undefined,
      notes: newVehicle.notes || undefined,
      visibility: newVehicle.visibility,
      photos: [],
      mods: [],
    };

    setVehicles([...vehicles, vehicle]);
    setIsAddOpen(false);
    setNewVehicle({
      type: 'car',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      engineTrim: '',
      notes: '',
      visibility: 'public',
    });
    toast.success('Vehicle added to your garage!');
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">My Garage</h1>
              <p className="text-xs text-muted-foreground">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsAddOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
        {vehicles.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No vehicles yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first vehicle to show off your ride</p>
            <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </div>
        ) : (
          vehicles.map((vehicle) => {
            const VehicleIcon = vehicle.type === 'car' ? Car : Bike;
            const VisibilityIcon = visibilityIcons[vehicle.visibility].icon;
            const isExpanded = expandedVehicle === vehicle.id;

            return (
              <div 
                key={vehicle.id} 
                className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
              >
                {/* Vehicle Header */}
                <button
                  onClick={() => toggleExpand(vehicle.id)}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-muted/80 flex items-center justify-center">
                    <VehicleIcon className="w-7 h-7 text-foreground/70" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </span>
                    </div>
                    {vehicle.engineTrim && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{vehicle.engineTrim}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className="gap-1 text-[10px] py-0 h-5">
                        <VisibilityIcon className="w-2.5 h-2.5" />
                        {visibilityIcons[vehicle.visibility].label}
                      </Badge>
                      {vehicle.mods && vehicle.mods.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] py-0 h-5">
                          {vehicle.mods.length} mods
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/20">
                    {/* Photos placeholder */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                        <Camera className="w-3 h-3" />
                        Photos
                      </div>
                      <div className="flex gap-2">
                        <button className="w-20 h-20 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Mods */}
                    {vehicle.mods && vehicle.mods.length > 0 && (
                      <div className="mb-4">
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
                      <div className="mb-4">
                        <p className="text-sm text-foreground/80 bg-background/50 rounded-lg p-3">{vehicle.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="text-xs flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Edit Vehicle
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setVehicles(vehicles.filter(v => v.id !== vehicle.id));
                          toast.success('Vehicle removed');
                        }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Vehicle Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="pb-4 border-b border-border/30">
            <SheetTitle className="text-lg font-bold">Add Vehicle</SheetTitle>
          </SheetHeader>
          
          <div className="py-5 space-y-5 overflow-y-auto max-h-[calc(85vh-140px)]">
            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vehicle Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewVehicle({ ...newVehicle, type: 'car' })}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    newVehicle.type === 'car' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <Car className={`w-6 h-6 ${newVehicle.type === 'car' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-semibold ${newVehicle.type === 'car' ? 'text-primary' : 'text-foreground'}`}>Car</span>
                </button>
                <button
                  onClick={() => setNewVehicle({ ...newVehicle, type: 'bike' })}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    newVehicle.type === 'bike' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <Bike className={`w-6 h-6 ${newVehicle.type === 'bike' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-semibold ${newVehicle.type === 'bike' ? 'text-primary' : 'text-foreground'}`}>Motorcycle</span>
                </button>
              </div>
            </div>

            {/* Make & Model */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-sm font-medium">Make *</Label>
                <Input
                  id="make"
                  placeholder="e.g. BMW"
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium">Model *</Label>
                <Input
                  id="model"
                  placeholder="e.g. M3"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                />
              </div>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">Year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) || new Date().getFullYear() })}
              />
            </div>

            {/* Engine/Trim */}
            <div className="space-y-2">
              <Label htmlFor="engineTrim" className="text-sm font-medium">Engine / Trim</Label>
              <Input
                id="engineTrim"
                placeholder="e.g. 3.0L Twin Turbo"
                value={newVehicle.engineTrim}
                onChange={(e) => setNewVehicle({ ...newVehicle, engineTrim: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Tell others about your ride..."
                value={newVehicle.notes}
                onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Who can see this?</Label>
              <Select 
                value={newVehicle.visibility} 
                onValueChange={(value: 'public' | 'friends' | 'private') => setNewVehicle({ ...newVehicle, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Public - Everyone can see
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friends - Only your friends
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Private - Only you
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border/30 safe-bottom">
            <Button onClick={handleAddVehicle} className="w-full h-12 text-base font-semibold">
              Add to Garage
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyGarage;