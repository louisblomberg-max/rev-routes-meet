import { Compass, Users, ShoppingBag, User } from 'lucide-react';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
    { id: 'discovery', label: 'Discover', icon: Compass },
    { id: 'community', label: 'Social', icon: Users },
    { id: 'marketplace', label: 'Market', icon: ShoppingBag },
    { id: 'you', label: 'You', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: '#ffffff',
        borderTop: '0.5px solid #e8e8e0',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="max-w-md mx-auto flex" style={{ height: 60 }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 btn-press"
            >
              <Icon
                className="w-[22px] h-[22px]"
                style={{ color: isActive ? '#d30d37' : '#999999' }}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#d30d37' : '#999999',
                  lineHeight: 1,
                }}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#d30d37',
                    marginTop: 1,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
