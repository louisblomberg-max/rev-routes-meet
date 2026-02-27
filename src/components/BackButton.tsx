import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  iconClassName?: string;
  fallbackPath?: string;
}

/**
 * History-aware back button.
 * If the user has browser history → go back one step.
 * Otherwise → navigate to fallbackPath (default "/").
 */
const BackButton = ({
  className,
  iconClassName,
  fallbackPath = '/',
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // window.history.length > 1 isn't fully reliable (new tab starts at 1-2),
    // so we also check if there's a referrer or state from react-router.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        'w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95',
        className,
      )}
      aria-label="Go back"
    >
      <ArrowLeft className={cn('w-5 h-5 text-foreground', iconClassName)} />
    </button>
  );
};

export default BackButton;
