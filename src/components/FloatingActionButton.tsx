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
    { icon: Calendar, label: 'Add Meet / Event', onClick: onAddEvent, color: 'text-events', featureId: 'create_events' },
    { icon: Route, label: 'Add Route', onClick: onAddRoute, color: 'text-routes', featureId: 'create_routes' },
    { icon: Wrench, label: 'Add Service', onClick: onAddService, color: 'text-services', featureId: 'business_listings' },
    { icon: Users, label: 'Add Club', onClick: onAddClub, color: 'text-clubs', featureId: 'create_clubs' },
  ];

  const handleOptionClick = (option: typeof options[0]) => {
    if (!hasAccess(option.featureId)) {
      const required = getRequiredPlan(option.featureId);
      toast.info(`This requires ${getPlanLabel(required)}`, {
        description: 'Upgrade your plan to unlock this feature.',
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/upgrade'),
        },
      });
      setIsOpen(false);
      return;
    }
    option.onClick();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-28 right-4 z-40">
      {/* Options */}
      <div className={`absolute bottom-16 right-0 space-y-2 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {options.map((option, index) => {
          const Icon = option.icon;
          const locked = !hasAccess(option.featureId);
          return (
            <button
              key={option.label}
              onClick={() => handleOptionClick(option)}
              className={`fab-option animate-fade-up ${locked ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={`w-5 h-5 ${locked ? 'text-muted-foreground' : option.color}`} />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {option.label}
              </span>
              {locked && <Lock className="w-3.5 h-3.5 text-muted-foreground ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-button transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
