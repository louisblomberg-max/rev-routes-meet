import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Crown, Shield, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

const ROLE_BADGES: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-amber-500' },
  admin: { label: 'Admin', icon: Shield, color: 'text-blue-500' },
  moderator: { label: 'Mod', icon: Shield, color: 'text-green-500' },
}

export default function ClubMembers({ clubId, isAdmin, currentUserId }: {
  clubId: string
  isAdmin: boolean
  currentUserId?: string
}) {
  const navigate = useNavigate()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [clubId])

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('club_memberships')
      .select(`
        *,
        profiles!user_id(id, username, display_name, avatar_url, plan)
      `)
      .eq('club_id', clubId)
      .order('role', { ascending: true })
      .order('joined_at', { ascending: true })
    setMembers(data || [])
    setLoading(false)
  }

  const handlePromote = async (userId: string, newRole: string) => {
    await supabase.from('club_memberships')
      .update({ role: newRole })
      .eq('club_id', clubId)
      .eq('user_id', userId)
    fetchMembers()
    toast.success('Role updated')
  }

  const handleRemove = async (userId: string) => {
    await supabase.from('club_memberships')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId)
    setMembers(prev => prev.filter(m => m.user_id !== userId))
    toast.success('Member removed')
  }

  const filteredMembers = members.filter(m =>
    !searchQuery || (m.profiles?.display_name || m.profiles?.username || '')
      .toLowerCase().includes(searchQuery.toLowerCase())
  )

  const roleOrder = ['owner', 'admin', 'moderator', 'member']
  const sortedMembers = [...filteredMembers].sort((a, b) =>
    roleOrder.indexOf(a.role || 'member') - roleOrder.indexOf(b.role || 'member')
  )

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search members..."
          className="w-full bg-muted/50 border border-border/30 rounded-xl pl-4 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <p className="text-xs text-muted-foreground font-medium">{members.length} members</p>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
        ))
      ) : (
        sortedMembers.map(member => {
          const badge = ROLE_BADGES[member.role || '']
          const BadgeIcon = badge?.icon
          const isMe = member.user_id === currentUserId
          const isOwner = member.role === 'owner'

          return (
            <div key={member.user_id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50">
              <button
                onClick={() => navigate(`/profile/${member.profiles?.id}`)}
                className="w-11 h-11 rounded-full bg-muted overflow-hidden flex-shrink-0"
              >
                {member.profiles?.avatar_url ? (
                  <img src={member.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {(member.profiles?.display_name || member.profiles?.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {member.profiles?.display_name || member.profiles?.username}
                    {isMe && <span className="text-muted-foreground font-normal"> (you)</span>}
                  </p>
                  {badge && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${badge.color}`}>
                      {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                      {badge.label}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  @{member.profiles?.username} · {member.points || 0} pts
                </p>
              </div>

              {isAdmin && !isMe && !isOwner && (
                <div className="relative group">
                  <button className="text-muted-foreground p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-8 bg-card border border-border/50 rounded-xl shadow-lg z-10 hidden group-focus-within:block min-w-[140px]">
                    {member.role === 'member' && (
                      <button
                        onClick={() => handlePromote(member.user_id, 'admin')}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted/50 border-b border-border/30"
                      >
                        Make admin
                      </button>
                    )}
                    {member.role === 'admin' && (
                      <button
                        onClick={() => handlePromote(member.user_id, 'member')}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted/50 border-b border-border/30"
                      >
                        Remove admin
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(member.user_id)}
                      className="w-full text-left px-4 py-2.5 text-xs text-destructive hover:bg-muted/50"
                    >
                      Remove member
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
