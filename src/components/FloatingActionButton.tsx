import { useState } from 'react';
import { Plus, X, Calendar, Route, Wrench, Users, ShoppingBag } from 'lucide-react';

interface FloatingActionButtonProps {
  onAddEvent: () => void;
  onAddRoute: () => void;
  onAddService: () => void;
  onCommunityHub: () => void;
  onMarketplace: () => void;
}

const FloatingActionButton = ({
  onAddEvent,
  onAddRoute,
  onAddService,
  onCommunityHub,
  onMarketplace,
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { icon: Calendar, label: 'Add Meet / Event', onClick: onAddEvent, color: 'text-events' },
    { icon: Route, label: 'Add Route', onClick: onAddRoute, color: 'text-routes' },
    { icon: Wrench, label: 'Add Service', onClick: onAddService, color: 'text-services' },
    { icon: Users, label: 'Community Hub', onClick: onCommunityHub, color: 'text-clubs' },
    { icon: ShoppingBag, label: 'Marketplace', onClick: onMarketplace, color: 'text-foreground' },
  ];

  return (
    <div className="fixed bottom-28 right-4 z-40">
      {/* Options */}
      <div className={`absolute bottom-16 right-0 space-y-2 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <button
              key={option.label}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className="fab-option animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={`w-5 h-5 ${option.color}`} />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {option.label}
              </span>
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
