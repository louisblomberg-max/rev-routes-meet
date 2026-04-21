/**
 * CreateSheet — bottom sheet triggered by the centre FAB.
 * Core mobile creation actions.
 */

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { Calendar, Route, Users } from 'lucide-react';

interface CreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateSheet = ({ open, onOpenChange }: CreateSheetProps) => {
  const navigate = useNavigate();

  const tiles = [
    {
      id: 'event',
      label: 'Event',
      icon: Calendar,
      color: '#CC2B2B',
      action: () => { onOpenChange(false); navigate('/add/event'); },
    },
    {
      id: 'route',
      label: 'Route',
      icon: Route,
      color: '#CC2B2B',
      action: () => { onOpenChange(false); navigate('/add/route'); },
    },
    {
      id: 'club',
      label: 'Club',
      icon: Users,
      color: '#CC2B2B',
      action: () => { onOpenChange(false); navigate('/add/club'); },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        <h2 style={{
          fontSize: 18,
          fontWeight: 800,
          color: '#111',
          textAlign: 'center',
          marginBottom: 20,
          letterSpacing: '-0.3px',
        }}>
          Create
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          paddingBottom: 20,
        }}>
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={tile.action}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 16,
                  borderRadius: 18,
                  border: '1px solid #F0F0F0',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                }}
                className="active:scale-[0.97] transition-all hover:shadow-md hover:border-border"
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: '#F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #F0F0F0',
                }}>
                  <Icon size={22} color={tile.color} strokeWidth={2} />
                </div>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#111',
                  lineHeight: 1.2,
                }}>
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateSheet;
