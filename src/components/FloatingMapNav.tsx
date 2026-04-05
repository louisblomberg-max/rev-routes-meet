import { Compass, Users, ShoppingBag, User } from 'lucide-react';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface FloatingMapNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Compass }[] = [
  { id: 'discovery', icon: Compass },
  { id: 'community', icon: Users },
  { id: 'marketplace', icon: ShoppingBag },
  { id: 'you', icon: User },
];

const FloatingMapNav = ({ activeTab, onTabChange }: FloatingMapNavProps) => {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-row items-center gap-2 px-6 py-2"
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
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            style={
              isActive
                ? { backgroundColor: '#fce8ed', color: '#d30d37' }
                : { backgroundColor: 'transparent', color: '#999999' }
            }
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
          </button>
        );
      })}
    </div>
  );
};

export default FloatingMapNav;
