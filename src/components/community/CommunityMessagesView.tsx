import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityMessagesView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (!participants?.length) { setLoading(false); return; }

      const convoIds = participants.map(p => p.conversation_id);
      const { data: convos } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convoIds)
        .order('last_message_at', { ascending: false })
        .limit(30);

      if (convos?.length) {
        // Get other participants for display names
        const { data: allParts } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id, profiles:user_id(display_name, avatar_url, username)')
          .in('conversation_id', convoIds);

        const enriched = convos.map((c: any) => {
          const parts = (allParts || []).filter((p: any) => p.conversation_id === c.id && p.user_id !== user.id);
          const other = parts[0]?.profiles;
          return {
            ...c,
            otherName: other?.display_name || other?.username || 'User',
            otherAvatar: other?.avatar_url,
            otherInitial: (other?.display_name || other?.username || '?')[0].toUpperCase(),
          };
        });
        setConversations(enriched);
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const filtered = searchQuery.trim()
    ? conversations.filter(c => c.otherName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100%', paddingBottom: 96 }}>
      {/* Search bar */}
      <div style={{ padding: '12px 16px 8px', position: 'relative' }}>
        <Search size={16} strokeWidth={2} color="#999" style={{ position: 'absolute', left: 30, top: 24, zIndex: 1, pointerEvents: 'none' }} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages"
          style={{
            width: '100%',
            background: '#F2EFE9',
            border: 'none',
            borderRadius: 12,
            padding: '11px 14px 11px 38px',
            fontSize: 14,
            color: '#4A443D',
            outline: 'none',
          }}
        />
      </div>

      {/* Section label */}
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#B0A89E',
        letterSpacing: '0.6px', textTransform: 'uppercase' as const,
        padding: '4px 16px 8px',
      }}>Recent</div>

      {/* Conversation list */}
      {loading ? (
        [1, 2, 3].map((i) => (
          <div key={i} style={{ background: '#F0F0F0', borderRadius: 16, height: 68, margin: '0 16px 8px' }} />
        ))
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 14, color: '#999', padding: '32px 16px', textAlign: 'center' }}>
          No messages yet. Start a conversation from a club or profile.
        </p>
      ) : (
        filtered.map((convo) => (
          <button
            key={convo.id}
            onClick={() => navigate(`/messages/${convo.id}`)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #EBEBEB',
              borderRadius: 16,
              padding: 12,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginBottom: 8,
              cursor: 'pointer',
              textAlign: 'left' as const,
              width: 'calc(100% - 32px)',
              marginLeft: 16,
              marginRight: 16,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              backgroundColor: '#CC2B2B',
              backgroundImage: convo.otherAvatar ? `url(${convo.otherAvatar})` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              {!convo.otherAvatar && convo.otherInitial}
            </div>

            {/* Middle */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{convo.otherName}</span>
                <span style={{ fontSize: 11, color: '#999', fontWeight: 600, flexShrink: 0 }}>
                  {timeAgo(convo.last_message_at)}
                </span>
              </div>
              <div style={{
                fontSize: 12, color: '#999', marginTop: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
              }}>
                {convo.last_message_preview || 'No messages yet'}
              </div>
            </div>

            {/* Unread dot */}
            {convo.unread_count > 0 && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#CC2B2B', flexShrink: 0 }} />
            )}
          </button>
        ))
      )}
    </div>
  );
}
