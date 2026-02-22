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
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/upgrade'),
        },
      });
      return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 active:scale-95 ${!allowed ? 'opacity-70' : ''}`}
      aria-label="Get help"
    >
      <AlertCircle className="w-5 h-5 text-white" />
      {!allowed && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted border border-background flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
};

export default HelpButton;
