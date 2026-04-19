import { useState } from 'react';
import CommunityClubsView from './community/CommunityClubsView';
import CommunityForumsView from './community/CommunityForumsView';
import CommunityMessagesView from './community/CommunityMessagesView';

type SubTab = 'clubs' | 'my-clubs' | 'forums' | 'messages';

const tabLabels: Record<SubTab, string> = {
  clubs: 'Clubs',
  'my-clubs': 'My Clubs',
  forums: 'Forums',
  messages: 'Messages',
};

export default function CommunityTab() {
  const [subTab, setSubTab] = useState<SubTab>('clubs');

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <nav style={{
        display: 'flex', padding: '0 4px', background: '#FFFFFF',
        borderBottom: '1px solid #F0F0F0', overflowX: 'auto',
      }}>
        {(['clubs', 'my-clubs', 'forums', 'messages'] as SubTab[]).map(t => {
          const active = subTab === t;
          return (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              style={{
                flex: 'none', background: 'transparent', border: 'none',
                padding: '14px 16px 16px', fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? '#CC2B2B' : '#AAA', whiteSpace: 'nowrap' as const,
                borderBottom: active ? '2.5px solid #CC2B2B' : '2.5px solid transparent',
                marginBottom: -1, cursor: 'pointer', transition: 'color 0.15s ease',
              }}
            >
              {tabLabels[t]}
            </button>
          );
        })}
      </nav>

      {subTab === 'clubs' && <CommunityClubsView mode="discover" />}
      {subTab === 'my-clubs' && <CommunityClubsView mode="my-clubs" />}
      {subTab === 'forums' && <CommunityForumsView />}
      {subTab === 'messages' && <CommunityMessagesView />}
    </div>
  );
}
