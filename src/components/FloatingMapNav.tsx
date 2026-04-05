import { Compass, Users, ShoppingBag, User } from 'lucide-react';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface FloatingMapNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: 'discovery', label: 'Discover', icon: Compass },
  { id: 'community', label: 'Social', icon: Users },
  { id: 'marketplace', label: 'Market', icon: ShoppingBag },
  { id: 'you', label: 'You', icon: User },
];

const FloatingMapNav = ({ activeTab, onTabChange }: FloatingMapNavProps) => {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-row items-center gap-2 px-6 py-2 md:gap-1 md:px-4"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const color = isActive ? '#d30d37' : '#999999';

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors md:w-auto md:h-auto md:min-w-[64px] md:flex-col md:gap-0.5 md:rounded-xl md:px-3 md:py-2"
            style={
              isActive
                ? { backgroundColor: '#fce8ed', color }
                : { backgroundColor: 'transparent', color }
            }
          >
            <Icon className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={isActive ? 2.5 : 1.5} />
            {/* Label — desktop only */}
            <span className="hidden md:block text-[10px] font-semibold" style={{ color }}>
              {tab.label}
            </span>
            {/* Active dot — desktop only */}
            {isActive && (
              <span className="hidden md:block w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#d30d37' }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FloatingMapNav;
