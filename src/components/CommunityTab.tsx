import { useState } from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import CommunityClubsView from './community/CommunityClubsView';
import CommunitySOSView from './community/CommunitySOSView';

type SubTab = 'clubs' | 'sos';

export default function CommunityTab() {
  const [subTab, setSubTab] = useState<SubTab>('clubs');

  const tabs: { id: SubTab; label: string; icon: typeof Users; activeColor: string }[] = [
    { id: 'clubs', label: 'Clubs', icon: Users, activeColor: '#CC2B2B' },
    { id: 'sos', label: 'SOS Messages', icon: AlertTriangle, activeColor: '#EF4444' },
  ];

  return (
    <div className="bg-background min-h-dvh">
      <nav className="flex gap-2 px-4 pt-3 pb-3 border-b-2 border-[#E5E5E5] bg-background">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold tracking-wide transition-colors border-2 ${
                active
                  ? 'text-white'
                  : 'bg-white text-foreground border-[#E5E5E5] hover:bg-neutral-50'
              }`}
              style={
                active
                  ? { background: t.activeColor, borderColor: t.activeColor }
                  : undefined
              }
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {subTab === 'clubs' && <CommunityClubsView />}
      {subTab === 'sos' && <CommunitySOSView />}
    </div>
  );
}
