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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-2xl border-t border-white/10 safe-bottom shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]">
      <div className="max-w-md mx-auto flex items-center justify-around py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-white' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/20' : ''}`}>
                <Icon className={`transition-all duration-200 ${isActive ? 'w-[22px] h-[22px] stroke-[2.5]' : 'w-5 h-5 stroke-[1.5]'}`} />
              </div>
              <span className={`text-[10px] tracking-wide transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>
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
