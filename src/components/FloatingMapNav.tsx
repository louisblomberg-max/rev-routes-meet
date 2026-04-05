import { Compass, Users, ShoppingBag, User } from 'lucide-react';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface FloatingMapNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const FloatingMapNav = ({ activeTab, onTabChange }: FloatingMapNavProps) => {
  const tabs: { id: Tab; label: string; icon: typeof Compass; activeColor: string }[] = [
    { id: 'discovery', label: 'Discovery', icon: Compass, activeColor: '#d30d37' },
    { id: 'community', label: 'Community', icon: Users, activeColor: '#274C77' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, activeColor: '#3A5A40' },
    { id: 'you', label: 'You', icon: User, activeColor: '#161616' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-3 pt-1 pb-1 bg-[#f3f3e8] rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.20)] md:bg-transparent md:shadow-none md:rounded-none md:px-0 md:py-0">
      <div className="grid grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-200 bg-white shadow-sm ${
                isActive ? 'border-black/20' : 'border-black/10 text-foreground hover:text-foreground'
              }`}
              style={isActive ? { color: tab.activeColor, borderColor: `${tab.activeColor}33` } : undefined}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[11px] font-semibold tracking-wide ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-6 h-[2px] rounded-full mt-0.5" style={{ backgroundColor: tab.activeColor }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingMapNav;
