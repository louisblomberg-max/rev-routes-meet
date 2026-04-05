import { Compass, Users, ShoppingBag, User } from 'lucide-react';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface FloatingMapNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Compass; activeColor: string }[] = [
  { id: 'discovery', label: 'Discovery', icon: Compass, activeColor: '#d30d37' },
  { id: 'community', label: 'Community', icon: Users, activeColor: '#274C77' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, activeColor: '#3A5A40' },
  { id: 'you', label: 'You', icon: User, activeColor: '#161616' },
];

const FloatingMapNav = ({ activeTab, onTabChange }: FloatingMapNavProps) => {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-row items-center gap-2 px-6 py-2 md:gap-1.5 md:px-3 md:py-2"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
              md:w-auto md:h-auto md:flex-col md:items-center md:gap-1 md:py-2.5 md:px-4 md:rounded-xl md:border md:bg-white md:shadow-sm
              ${isActive ? 'md:border-black/20' : 'md:border-black/10'}
            `}
            style={
              isActive
                ? { color: tab.activeColor, borderColor: `${tab.activeColor}33` }
                : { color: '#999999' }
            }
          >
            <Icon className="w-5 h-5 md:w-3.5 md:h-3.5" strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="hidden md:block text-[11px] font-semibold tracking-wide">
              {tab.label}
            </span>
            {isActive && (
              <div className="hidden md:block w-6 h-[2px] rounded-full mt-0.5" style={{ backgroundColor: tab.activeColor }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FloatingMapNav;
