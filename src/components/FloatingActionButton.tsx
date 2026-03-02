import { useState } from 'react';
import { Plus, X, Calendar, Route, Wrench, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlan } from '@/contexts/PlanContext';

interface FloatingActionButtonProps {
  onAddEvent: () => void;
  onAddRoute: () => void;
  onAddService: () => void;
  onAddClub: () => void;
}

const FloatingActionButton = ({
  onAddEvent,
  onAddRoute,
  onAddService,
  onAddClub,
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { hasAccess, getPlanLabel, getRequiredPlan } = usePlan();

  const options = [
    { icon: Calendar, label: 'Add Event', onClick: onAddEvent, color: 'text-events', featureId: 'create_events' },
    { icon: Wrench, label: 'Add Service', onClick: onAddService, color: 'text-services', featureId: 'business_listings' },
    { icon: Route, label: 'Add Route', onClick: onAddRoute, color: 'text-routes', featureId: 'create_routes' },
    { icon: Users, label: 'Add Club', onClick: onAddClub, color: 'text-clubs', featureId: 'create_clubs' },
  ];

  const handleOptionClick = (option: typeof options[0]) => {
    if (!hasAccess(option.featureId)) {
      const required = getRequiredPlan(option.featureId);
      toast.info(`This requires ${getPlanLabel(required)}`, {
        description: 'Upgrade your plan to unlock this feature.',
        action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
      });
      setIsOpen(false);
      return;
    }
    option.onClick();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Options fan-out */}
      <div className={`absolute bottom-0 right-0 mb-14 space-y-1.5 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`} style={{ zIndex: 31 }}>
        {options.map((option, index) => {
          const Icon = option.icon;
          const locked = !hasAccess(option.featureId);
          return (
            <button
              key={option.label}
              onClick={() => handleOptionClick(option)}
              className={`flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-white/60 transition-all duration-200 hover:bg-white hover:shadow-xl hover:translate-x-[-4px] active:scale-95 ${locked ? 'opacity-50' : ''}`}
              style={{ 
                animationDelay: `${index * 40}ms`,
                transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
                transition: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1) ${index * 40}ms`,
              }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${locked ? 'bg-muted' : 'bg-muted/60'}`}>
                <Icon className={`w-4 h-4 ${locked ? 'text-muted-foreground' : option.color}`} />
              </div>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {option.label}
              </span>
              {locked && <Lock className="w-3 h-3 text-muted-foreground ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 rounded-xl bg-white shadow-lg border border-border/60 flex items-center justify-center transition-all duration-300 hover:shadow-xl active:scale-90 ${isOpen ? 'rotate-45 scale-95' : 'rotate-0'}`}
        aria-label="Create new content"
      >
        <Plus className="w-6 h-6 text-foreground" />
      </button>
    </>
  );
};

export default FloatingActionButton;
