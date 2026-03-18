import { Compass, Users, ShoppingBag, User } from 'lucide-react';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'discovery' as Tab, label: 'Discovery', icon: Compass },
    { id: 'community' as Tab, label: 'Community', icon: Users },
    { id: 'marketplace' as Tab, label: 'Marketplace', icon: ShoppingBag },
    { id: 'you' as Tab, label: 'You', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom px-3 pb-3 pt-1" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-1.5 h-10 rounded-xl border transition-all duration-200 bg-white shadow-sm ${
                isActive 
                  ? 'border-primary/30 text-primary' 
                  : 'border-black/10 text-black/40 hover:text-black/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[11px] font-semibold tracking-wide whitespace-nowrap`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;