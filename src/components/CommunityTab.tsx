import { useState } from 'react';
import CommunityClubsView from './community/CommunityClubsView';
import CommunityForumsView from './community/CommunityForumsView';
import CommunityMessagesView from './community/CommunityMessagesView';

type SubTab = 'clubs' | 'forums' | 'messages';

export default function CommunityTab() {
  const [subTab, setSubTab] = useState<SubTab>('clubs');

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100dvh' }}>
      <nav style={{
        display: 'flex', padding: '0 16px', background: '#FAFAFA',
        borderBottom: '2px solid #E5E5E5',
      }}>
        {(['clubs', 'forums', 'messages'] as SubTab[]).map(t => {
          const active = subTab === t;
          return (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                padding: '14px 0 16px', fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? '#CC2B2B' : '#AAA',
                borderBottom: active ? '2.5px solid #CC2B2B' : '2.5px solid transparent',
                marginBottom: -1, cursor: 'pointer', transition: 'color 0.15s ease',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          );
        })}
      </nav>

      {subTab === 'clubs' && <CommunityClubsView mode="discover" />}
      {subTab === 'forums' && <CommunityForumsView />}
      {subTab === 'messages' && <CommunityMessagesView />}
    </div>
  );
}
