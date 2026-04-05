import { Compass, Users, ShoppingBag, User } from 'lucide-react';
import revnetLogo from '@/assets/revnet-logo-header.png';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface DesktopSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: 'discovery', label: 'Discovery', icon: Compass },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'you', label: 'You', icon: User },
];

const DesktopSidebar = ({ activeTab, onTabChange }: DesktopSidebarProps) => {
  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col z-50"
      style={{ backgroundColor: '#ffffff', borderRight: '0.5px solid #e8e8e0' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="h-10 w-24 overflow-hidden">
          <img src={revnetLogo} alt="RevNet" className="h-full w-full object-contain scale-[2] translate-y-[3px]" />
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left"
              style={
                isActive
                  ? { color: '#d30d37', backgroundColor: '#fce8ed' }
                  : { color: '#666666' }
              }
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={isActive ? 'font-semibold' : ''}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DesktopSidebar;
