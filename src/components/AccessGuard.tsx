interface AccessGuardProps {
  featureId?: string;
  requiredPlan?: string;
  mode?: 'lock' | 'hide';
  children: React.ReactNode;
  className?: string;
  lockMessage?: string;
}

const AccessGuard = ({ children }: AccessGuardProps) => {
  return <>{children}</>;
};

export default AccessGuard;
