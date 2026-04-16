import { LifeBuoy } from 'lucide-react';

interface HelpButtonProps { onClick: () => void; }

const HelpButton = ({ onClick }: HelpButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-destructive shadow-md shadow-destructive/25 transition-all duration-200 active:scale-90"
    >
      <span className="text-sm font-black tracking-wide text-destructive-foreground">SOS</span>
    </button>
  );
};

export default HelpButton;
