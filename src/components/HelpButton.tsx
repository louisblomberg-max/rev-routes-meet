import { LifeBuoy } from 'lucide-react';

interface HelpButtonProps { onClick: () => void; }

const HelpButton = ({ onClick }: HelpButtonProps) => {
  return (
    <button
      onClick={onClick}
      aria-label="Emergency help"
      className="flex items-center justify-center h-11 px-4 rounded-2xl transition-transform duration-200 active:scale-90"
      style={{
        background: 'hsl(var(--destructive))',
        boxShadow: '0 4px 16px rgba(220,38,38,0.35)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <span className="text-sm font-black tracking-wide text-destructive-foreground">SOS</span>
    </button>
  );
};

export default HelpButton;
