import { Compass, Route as RouteIcon, Users, User, Plus } from 'lucide-react';

type Tab = 'explore' | 'drive' | 'social' | 'you';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onCreatePress: () => void;
}

const BottomNavigation = ({ activeTab, onTabChange, onCreatePress }: BottomNavigationProps) => {
  const leftTabs: { id: Tab; label: string; icon: typeof Compass }[] = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'drive', label: 'Drive', icon: RouteIcon },
  ];

  const rightTabs: { id: Tab; label: string; icon: typeof Compass }[] = [
    { id: 'social', label: 'Social', icon: Users },
    { id: 'you', label: 'You', icon: User },
  ];

  const renderTab = (tab: { id: Tab; label: string; icon: typeof Compass }) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 pt-2 pb-1"
      >
        <Icon
          className="w-5 h-5"
          style={{ color: isActive ? '#CC2B2B' : '#B0A89E', strokeWidth: isActive ? 2.5 : 1.5 }}
        />
        <span
          className="text-[10px] font-semibold tracking-wide"
          style={{ color: isActive ? '#CC2B2B' : '#B0A89E' }}
        >
          {tab.label}
        </span>
        {isActive && (
          <div className="w-4 h-[2.5px] rounded-full" style={{ backgroundColor: '#CC2B2B' }} />
        )}
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #F0F0F0' }}
    >
      <div className="flex items-end justify-around px-2 pb-safe">
        {leftTabs.map(renderTab)}

        {/* FAB */}
        <div className="flex flex-col items-center justify-end pb-2" style={{ marginBottom: '2px' }}>
          <button
            onClick={onCreatePress}
            className="flex items-center justify-center rounded-full shadow-lg"
            style={{
              width: 52,
              height: 52,
              backgroundColor: '#CC2B2B',
              marginTop: -20,
              border: '3px solid #FFFFFF',
              boxShadow: '0 4px 14px rgba(204, 43, 43, 0.4)',
            }}
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
};

export default BottomNavigation;
