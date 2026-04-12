import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { usePlan } from '@/contexts/PlanContext';
import { toast } from 'sonner';

interface HelpButtonProps { onClick: () => void; }

const HelpButton = ({ onClick }: HelpButtonProps) => {
  const navigate = useNavigate();
  const { effectivePlan } = usePlan();
  const canSOS = effectivePlan === 'pro' || effectivePlan === 'club' || effectivePlan === 'organiser';

  const handleClick = () => {
    if (!canSOS) {
      toast.error('SOS requires Pro Driver or Club & Business plan', {
        action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
        duration: 4000,
      });
      return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-destructive shadow-md shadow-destructive/25 transition-all duration-200 active:scale-90 ${!canSOS ? 'opacity-60' : ''}`}
    >
      <span className="text-sm font-black tracking-wide text-destructive-foreground">SOS</span>
      {!canSOS && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted border-2 border-background flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
};

export default HelpButton;
