import { useState } from 'react';
import { Plus, X, Calendar, Route, Wrench, Lock } from 'lucide-react';
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
    { icon: Calendar, label: 'Add Event', onClick: onAddEvent, featureId: 'create_events' },
    { icon: Route, label: 'Add Route', onClick: onAddRoute, featureId: 'create_routes' },
    { icon: Wrench, label: 'Add Service', onClick: onAddService, featureId: 'create_services' },
  ];

  const handleOptionClick = (option: typeof options[0]) => {
    if (!hasAccess(option.featureId)) {
      const required = getRequiredPlan(option.featureId);
      toast.info(`This requires ${getPlanLabel(required)}`, {
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
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`absolute bottom-0 right-0 mb-16 space-y-2 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`} style={{ zIndex: 31 }}>
        {options.map((option, index) => {
          const Icon = option.icon;
          const locked = !hasAccess(option.featureId);
          return (
            <button
              key={option.label}
              onClick={() => handleOptionClick(option)}
              className="flex items-center gap-3 btn-press"
              style={{
                padding: '10px 16px',
                borderRadius: 14,
                background: '#ffffff',
                border: '0.5px solid #e8e8e0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                opacity: locked ? 0.5 : 1,
                transition: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1) ${index * 40}ms`,
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fce8ed' }}>
                <Icon className="w-4 h-4" style={{ color: '#d30d37' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111111', whiteSpace: 'nowrap' }}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-press"
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#d30d37',
          boxShadow: '0 4px 12px rgba(211,13,55,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 200ms',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          border: 'none',
        }}
      >
        <Plus className="w-6 h-6" style={{ color: '#ffffff' }} />
      </button>
    </>
  );
};

export default FloatingActionButton;
