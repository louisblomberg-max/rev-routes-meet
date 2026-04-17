/**
 * CreateSheet — bottom sheet triggered by the centre FAB.
 * Core mobile creation actions + redirects/placeholders for upcoming features.
 */

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
      emoji: '📅',
      action: () => { onOpenChange(false); navigate('/add/event'); },
    },
    {
      id: 'route',
      label: 'Route',
      emoji: '🛣️',
      action: () => { onOpenChange(false); navigate('/add/route'); },
    },
    {
      id: 'service',
      label: 'Service',
      emoji: '🏢',
      action: () => { onOpenChange(false); window.open('https://revnet.club/add-service', '_blank'); },
    },
    {
      id: 'listing',
      label: 'Listing',
      emoji: '📋',
      action: () => {
        toast.info('Marketplace coming soon!', { description: 'Buy and sell will be available in the next update.' });
        onOpenChange(false);
      },
    },
    {
      id: 'insurance',
      label: 'Insurance',
      emoji: '🛡️',
      action: () => {
        toast.info('Insurance hub coming soon!', { description: 'Compare quotes and manage policies.' });
        onOpenChange(false);
      },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8 pt-3">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', textAlign: 'center', marginBottom: 20, letterSpacing: '-0.3px' }}>
          Create
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {tiles.map((tile, index) => (
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
                border: '1px solid #E8E4DC',
                background: '#FFFFFF',
                cursor: 'pointer',
                gridColumn: index === tiles.length - 1 && tiles.length % 2 !== 0 ? 'span 2' : undefined,
              }}
              className="active:scale-[0.97] transition-transform"
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#F2EFE9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}>
                {tile.emoji}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateSheet;
