import { useState } from 'react';
import { Hash, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ClubCodeInputProps {
  onJoined?: () => void;
}

export default function ClubCodeInput({ onJoined }: ClubCodeInputProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    if (!user?.id) { navigate('/auth'); return; }

    setLoading(true);
    try {
      const { data: club } = await supabase
        .from('clubs')
        .select('*')
        .eq('invite_code', code.trim().toLowerCase())
        .maybeSingle();

      if (!club) { toast.error('Club not found. Check the code and try again.'); setLoading(false); return; }

      // Check already member
      const { data: existing } = await supabase
        .from('club_memberships')
        .select('id')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) { toast.error('You are already a member of this club.'); setLoading(false); return; }

      if (club.join_mode === 'approval') {
        await supabase.from('club_join_requests').upsert({ club_id: club.id, user_id: user.id, status: 'pending' });
        toast.success(`Join request sent to ${club.name}`);
      } else {
        const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
        if (error) throw error;
        toast.success(`Joined ${club.name}!`);
      }
      setCode('');
      onJoined?.();
    } catch {
      toast.error('Failed to join club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Hash size={16} color="#8C867E" style={{ position: 'absolute', left: 14, top: 13, pointerEvents: 'none' }} />
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
          placeholder="Enter club code"
          maxLength={12}
          disabled={loading}
          style={{
            width: '100%', background: '#F2EFE9', border: 'none', borderRadius: 12,
            padding: '11px 14px 11px 38px', fontSize: 14, color: '#4A443D',
            outline: 'none', letterSpacing: '0.5px', fontFamily: 'monospace',
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!code.trim() || loading}
        style={{
          background: code.trim() && !loading ? '#CC2B2B' : '#D1D5DB',
          color: '#fff', border: 'none', borderRadius: 12,
          padding: '11px 16px', fontSize: 14, fontWeight: 700,
          cursor: code.trim() && !loading ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        Join
      </button>
    </form>
  );
}
