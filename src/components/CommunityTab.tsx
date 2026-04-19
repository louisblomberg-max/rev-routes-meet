import { useState } from 'react';
import CommunityClubsView from './community/CommunityClubsView';
import CommunityForumsView from './community/CommunityForumsView';
import CommunityMessagesView from './community/CommunityMessagesView';

type SubTab = 'clubs' | 'forums' | 'messages';

export default function CommunityTab() {
  const [subTab, setSubTab] = useState<SubTab>('clubs');

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Tab bar */}
      <nav
        role="tablist"
        style={{
          display: 'flex',
          padding: '0 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #F0F0F0',
        }}
      >
        {(['clubs', 'forums', 'messages'] as SubTab[]).map((t) => {
          const active = subTab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setSubTab(t)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '14px 0 16px',
                fontSize: 15,
                fontWeight: active ? 700 : 500,
                color: active ? '#CC2B2B' : '#999',
                borderBottom: active ? '2.5px solid #CC2B2B' : '2.5px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          );
        })}
      </nav>

      {subTab === 'clubs' && <CommunityClubsView />}
      {subTab === 'forums' && <CommunityForumsView />}
      {subTab === 'messages' && <CommunityMessagesView />}
    </div>
  );
}
