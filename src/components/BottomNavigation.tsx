import { Compass, Users, ShoppingBag, User } from 'lucide-react';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs: { id: Tab; label: string; icon: typeof Compass; activeColor: string }[] = [
    { id: 'discovery', label: 'Discovery', icon: Compass, activeColor: '#d30d37' },
    { id: 'community', label: 'Community', icon: Users, activeColor: '#274C77' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, activeColor: '#3A5A40' },
    { id: 'you', label: 'You', icon: User, activeColor: '#161616' },
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
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-200 shadow-sm ${
                isActive ? 'border-transparent' : 'bg-white border-black/10 text-foreground hover:text-foreground'
              }`}
              style={isActive ? { color: '#fff', backgroundColor: tab.activeColor, borderColor: tab.activeColor } : undefined}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[11px] tracking-wide ${isActive ? 'font-bold' : 'font-semibold'}`}>
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