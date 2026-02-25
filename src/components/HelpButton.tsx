import { AlertCircle, Lock } from 'lucide-react';
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
      className={`relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/25 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-red-500/35 active:scale-90 ${!allowed ? 'opacity-60' : ''}`}
      aria-label="Get help"
    >
      <AlertCircle className="w-[18px] h-[18px] text-white" />
      {!allowed && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted border-2 border-background flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
};

export default HelpButton;
