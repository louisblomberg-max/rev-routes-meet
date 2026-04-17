/**
 * CreateSheet — bottom sheet triggered by the centre FAB.
 * Shows a grid of creation options: Event, Route, Club, Service, Forum Post, Listing.
 */

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { Calendar, Route, Users, Wrench, MessageSquare, ShoppingBag } from 'lucide-react';

interface CreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const options = [
  { label: 'Event', icon: Calendar, color: '#d30d37', bg: 'bg-events/10', route: '/add/event' },
  { label: 'Route', icon: Route, color: '#4f7fff', bg: 'bg-routes/10', route: '/add/route' },
  { label: 'Club', icon: Users, color: '#274C77', bg: 'bg-clubs/10', route: '/add/club' },
  { label: 'Service', icon: Wrench, color: '#ff8000', bg: 'bg-services/10', route: '/add/service' },
  { label: 'Forum Post', icon: MessageSquare, color: '#6B7280', bg: 'bg-muted', route: '/forums/create' },
  { label: 'Listing', icon: ShoppingBag, color: '#3A5A40', bg: 'bg-marketplace/10', route: '/add/listing' },
];

const CreateSheet = ({ open, onOpenChange }: CreateSheetProps) => {
  const navigate = useNavigate();

  const handleSelect = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8 pt-3">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        <h2 className="text-lg font-bold text-foreground text-center mb-5">Create</h2>
        <div className="grid grid-cols-3 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.route)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 bg-card hover:shadow-md hover:border-border transition-all active:scale-[0.97]"
              >
                <div className={`w-12 h-12 rounded-xl ${opt.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" style={{ color: opt.color }} />
                </div>
                <span className="text-xs font-semibold text-foreground">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateSheet;
