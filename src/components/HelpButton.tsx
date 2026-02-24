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
      className={`relative w-14 h-14 rounded-full bg-red-600/80 backdrop-blur-xl border border-red-500/30 shadow-lg shadow-red-900/30 flex items-center justify-center transition-all duration-200 hover:bg-red-600/90 active:scale-90 ${!allowed ? 'opacity-50' : ''}`}
      aria-label="Get help"
    >
      <AlertCircle className="w-5 h-5 text-white" />
      {!allowed && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-white/70" />
        </div>
      )}
    </button>
  );
};

export default HelpButton;
