import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '@/contexts/PlanContext';
import { toast } from 'sonner';

interface HelpButtonProps {
  onClick: () => void;
}

const HelpButton = ({ onClick }: HelpButtonProps) => {
  const navigate = useNavigate();
  const { hasAccess, getPlanLabel, getRequiredPlan } = usePlan();
  const allowed = hasAccess('breakdown_help');

  const handleClick = () => {
    if (!allowed) {
      const required = getRequiredPlan('breakdown_help');
      toast.info(`Help requires ${getPlanLabel(required)}`, {
        description: 'Upgrade your plan to request breakdown help.',
        action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
      });
      return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center gap-1.5 h-9 px-3.5 rounded-[14px] bg-destructive shadow-glow-red animate-pulse-glow transition-all duration-200 hover:shadow-elevated active:scale-90 ${!allowed ? 'opacity-60' : ''}`}
      aria-label="Get help"
    >
      <span className="text-xs font-bold tracking-wider text-destructive-foreground">SOS</span>
      {!allowed && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
};

export default HelpButton;