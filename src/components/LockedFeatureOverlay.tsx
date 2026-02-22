// This component is now a thin wrapper around AccessGuard for backwards compatibility.
// Prefer using AccessGuard directly in new code.
import AccessGuard from '@/components/AccessGuard';

interface LockedFeatureOverlayProps {
  featureId: string;
  children: React.ReactNode;
  className?: string;
}

const LockedFeatureOverlay = ({ featureId, children, className = '' }: LockedFeatureOverlayProps) => {
  return (
    <AccessGuard featureId={featureId} mode="lock" className={className}>
      {children}
    </AccessGuard>
  );
};

export default LockedFeatureOverlay;
