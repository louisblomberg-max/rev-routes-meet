import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlanId, usePlan } from '@/contexts/PlanContext';

interface AccessGuardProps {
  /** The feature ID to check, or a plan ID directly */
  featureId?: string;
  /** Require a specific plan directly (alternative to featureId) */
  requiredPlan?: PlanId;
  /** 'lock' = render disabled with overlay; 'hide' = don't render at all */
  mode?: 'lock' | 'hide';
  children: React.ReactNode;
  className?: string;
  /** Custom message shown on the lock overlay */
  lockMessage?: string;
}

const AccessGuard = ({ 
  featureId, 
  requiredPlan: requiredPlanProp, 
  mode = 'lock', 
  children, 
  className = '',
  lockMessage,
}: AccessGuardProps) => {
  const navigate = useNavigate();
  const { hasAccess, getRequiredPlan, getPlanLabel } = usePlan();

  const allowed = featureId ? hasAccess(featureId) : requiredPlanProp ? hasAccess(requiredPlanProp) : true;

  // Determine what plan is required for the label
  const neededPlan = featureId 
    ? getRequiredPlan(featureId) 
    : requiredPlanProp || 'free';

  if (allowed) {
    return <>{children}</>;
  }

  if (mode === 'hide') {
    return null;
  }

  // Lock mode: render children as disabled with overlay
  return (
    <div className={`relative ${className}`}>
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <button
        onClick={() => navigate('/upgrade')}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/60 backdrop-blur-[2px] rounded-xl z-10"
      >
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="text-[9px] font-semibold text-muted-foreground">
          {lockMessage || `Requires ${getPlanLabel(neededPlan)}`}
        </span>
      </button>
    </div>
  );
};

export default AccessGuard;
