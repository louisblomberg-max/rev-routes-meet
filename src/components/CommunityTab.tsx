import { useState } from 'react';
import CommunityClubsView from './community/CommunityClubsView';
import CommunityForumsView from './community/CommunityForumsView';
import CommunityMessagesView from './community/CommunityMessagesView';

type SubTab = 'clubs' | 'forums' | 'messages';

export default function CommunityTab() {
  const [subTab, setSubTab] = useState<SubTab>('clubs');

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100vh' }}>
      <nav
        role="tablist"
        style={{
          display: 'flex',
          padding: '0 16px',
          borderBottom: '1px solid #E8E4DC',
          background: '#FFFFFF',
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
                padding: '12px 0 14px',
                fontSize: 14,
                fontWeight: active ? 700 : 600,
                color: active ? '#CC2B2B' : '#B0A89E',
                borderBottom: active ? '2.5px solid #CC2B2B' : '2.5px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                letterSpacing: '-0.1px',
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
