import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlanId, usePlan } from '@/contexts/PlanContext';

interface LockedFeatureOverlayProps {
  featureId: string;
  children: React.ReactNode;
  className?: string;
}

const LockedFeatureOverlay = ({ featureId, children, className = '' }: LockedFeatureOverlayProps) => {
  const navigate = useNavigate();
  const { hasAccess, getRequiredPlan, getPlanLabel } = usePlan();

  if (hasAccess(featureId)) {
    return <>{children}</>;
  }

  const requiredPlan = getRequiredPlan(featureId);

  return (
    <div className={`relative ${className}`}>
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <button
        onClick={() => navigate('/upgrade')}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/60 backdrop-blur-[2px] rounded-xl"
      >
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="text-[9px] font-semibold text-muted-foreground">{getPlanLabel(requiredPlan)}</span>
      </button>
    </div>
  );
};

export default LockedFeatureOverlay;
