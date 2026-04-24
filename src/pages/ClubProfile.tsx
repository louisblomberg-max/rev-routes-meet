import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Share2, Settings, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import ClubFeed from '@/components/clubs/ClubFeed'
import ClubMembers from '@/components/clubs/ClubMembers'
import ClubEvents from '@/components/clubs/ClubEvents'
import ClubLeaderboard from '@/components/clubs/ClubLeaderboard'
import ClubGarage from '@/components/clubs/ClubGarage'
import ClubRoutes from '@/components/clubs/ClubRoutes'

const TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'events', label: 'Events' },
  { id: 'routes', label: 'Routes' },
  { id: 'members', label: 'Members' },
  { id: 'garage', label: 'Garage' },
  { id: 'about', label: 'About' },
]

export default function ClubProfile() {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [club, setClub] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('feed')
  const [joining, setJoining] = useState(false)
  const [mutualFriends, setMutualFriends] = useState<any[]>([])
  const [inviteCodeInput, setInviteCodeInput] = useState('')

  useEffect(() => {
    if (!clubId) return
    loadClub()

    // Realtime subscription for club posts
    const channel = supabase
      .channel(`club-posts-${clubId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'club_posts',
        filter: `club_id=eq.${clubId}`,
      }, () => {
        loadClub()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clubId, user?.id])

  const loadClub = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('clubs')
        .select('*, profiles!created_by(id, username, display_name, avatar_url, plan)')
        .eq('id', clubId)
        .single()
      setClub(data)

      if (user?.id) {
        const { data: mem } = await supabase
          .from('club_memberships')
          .select('*')
          .eq('club_id', clubId)
          .eq('user_id', user.id)
          .maybeSingle()
        setMembership(mem)

        // Find mutual friends in club
        const { data: friends } = await supabase
          .from('friends')
          .select('user_id, friend_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted')

        if (friends?.length) {
          const friendIds = friends.map(f => f.user_id === user.id ? f.friend_id : f.user_id)
          const { data: mutual } = await supabase
            .from('club_memberships')
            .select('user_id')
            .eq('club_id', clubId!)
            .in('user_id', friendIds)
            .limit(3)
          
          if (mutual?.length) {
            const mutualIds = mutual.map(m => m.user_id)
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, display_name, avatar_url')
              .in('id', mutualIds)
            setMutualFriends(profiles || [])
          }
        }
      }
    } catch {
      toast.error('Could not load club')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!user?.id) { navigate('/auth'); return }

    // Check if user is blocked
    if (club.blocked_users?.includes(user.id)) {
      toast.error('You cannot join this club')
      return
    }

    if (club.join_mode === 'approval') {
      navigate(`/club/${clubId}/join`)
      return
    }

    if (club.join_mode === 'invite_only') {
      toast.error('This club is invite only — you need an invite code to join')
      return
    }

    setJoining(true)
    try {
      const { error: joinError } = await supabase.from('club_memberships').insert({
        club_id: clubId, user_id: user.id, role: 'member'
      })
      if (joinError) { toast.error('Failed to join club'); return }

      // Check founding member
      if (club.member_count < 10) {
        await supabase.from('club_memberships').update({
          is_founding_member: true,
          points: 20,
          badges: ['founding_member']
        }).eq('club_id', clubId!).eq('user_id', user.id)
      }

      if (club.created_by) {
        await supabase.rpc('send_notification', {
          p_user_id: club.created_by,
          p_type: 'club_join',
          p_title: 'New member joined',
          p_body: `Someone joined ${club.name}`,
          p_data: { club_id: clubId }
        })
      }
      toast.success(`Welcome to ${club.name}!`)
      loadClub()
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    if (membership?.role === 'owner') {
      toast.error('Transfer ownership before leaving')
      return
    }
    const { error: leaveError } = await supabase.from('club_memberships').delete()
      .eq('club_id', clubId!).eq('user_id', user?.id!)
    if (leaveError) { toast.error('Failed to leave club'); return }
    setMembership(null)
    toast.success('Left club')
  }

  const handleShare = async () => {
    const text = `Join ${club.name} on RevNet! Use invite code: ${club.invite_code}`
    if (navigator.share) {
      try { await navigator.share({ title: club.name, text, url: window.location.href }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Invite link copied!')
    }
  }

  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'
  const isMember = !!membership

  if (loading) return (
    <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
      <div className="h-44 bg-muted animate-pulse" />
    </div>
  )

  if (!club) return (
    <div className="mobile-container bg-background min-h-dvh flex items-center justify-center md:max-w-2xl md:mx-auto">
      <p className="text-muted-foreground">Club not found</p>
    </div>
  )

  // Private club locked preview
  if (club.is_private && !isMember) {
    return (
      <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
        <div className="relative w-full h-44">
          {club.cover_url ? (
            <img src={club.cover_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={() => { sessionStorage.setItem('revnet_active_tab', 'community'); navigate('/'); }}
            className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center text-white safe-top"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 -mt-8 relative z-10 space-y-4">
          <div className="w-[72px] h-[72px] rounded-2xl border-4 border-background overflow-hidden bg-card shadow-lg">
            {club.logo_url ? (
              <img src={club.logo_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {club.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">{club.name}</h1>
          <p className="text-xs text-muted-foreground">@{club.handle}</p>
          <p className="text-sm text-muted-foreground">{club.member_count} members</p>

          <div className="bg-card rounded-2xl border border-border/50 p-6 text-center space-y-3">
            <p className="text-3xl">🔒</p>
            <p className="font-bold text-foreground">Private Club</p>
            <p className="text-sm text-muted-foreground">
              This club is private. You need an invite code to join.
            </p>
            <div className="flex gap-2">
              <input
                value={inviteCodeInput}
                onChange={e => setInviteCodeInput(e.target.value)}
                placeholder="Enter invite code"
                className="flex-1 border border-border/50 rounded-xl px-4 py-3 text-sm bg-background uppercase tracking-widest"
                maxLength={8}
              />
              <button
                onClick={async () => {
                  if (!inviteCodeInput.trim() || !user?.id) return
                  const { data } = await supabase.from('clubs').select('id').eq('id', clubId!).eq('invite_code', inviteCodeInput.trim().toLowerCase()).single()
                  if (!data) { toast.error('Invalid code'); return }
                  await supabase.from('club_memberships').insert({ club_id: clubId, user_id: user.id, role: 'member' })
                  toast.success('Joined!')
                  loadClub()
                }}
                className="px-4 py-3 rounded-xl bg-foreground text-background text-sm font-semibold"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const socialLinks = club.social_links as Record<string, string> | null

  return (
    <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
      {/* Cover image header */}
      <div className="relative w-full h-44">
        {club.cover_url ? (
          <img src={club.cover_url} className="w-full h-full object-cover" alt={club.name} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
            <span className="text-5xl">🏎</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back and actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between safe-top">
          <button
            onClick={() => { sessionStorage.setItem('revnet_active_tab', 'community'); navigate('/'); }}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center text-white">
              <Share2 className="w-4 h-4" />
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate(`/club/${clubId}/settings`)}
                className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center text-white"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Club identity */}
      <div className="px-4 -mt-8 relative z-10 space-y-4">
        <div className="flex items-end gap-3">
          <div className="w-18 h-18 rounded-2xl border-4 border-background overflow-hidden flex-shrink-0 bg-card shadow-lg" style={{ width: 72, height: 72 }}>
            {club.logo_url ? (
              <img src={club.logo_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {club.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-foreground">{club.name}</h1>
              {club.is_verified && <span className="text-blue-500 text-xs font-bold">✓</span>}
            </div>
            <p className="text-xs text-muted-foreground">@{club.handle}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-foreground">{club.member_count}</p>
            <p className="text-[10px] text-muted-foreground">Members</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-foreground">{club.post_count}</p>
            <p className="text-[10px] text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-foreground capitalize">{club.club_type?.replace(/_/g, ' ')}</p>
            <p className="text-[10px] text-muted-foreground">Type</p>
          </div>
        </div>

        {/* Mutual friends */}
        {mutualFriends.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {mutualFriends.map((friend: any) => (
                <div key={friend.id} className="w-6 h-6 rounded-full bg-muted border-2 border-background overflow-hidden">
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                      {(friend.display_name || friend.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {mutualFriends.length} friend{mutualFriends.length > 1 ? 's' : ''} in this club
            </p>
          </div>
        )}

        {/* Join / Leave button */}
        {!isMember ? (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3 px-6 text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: '#CC2B2B', color: 'white', borderRadius: 22 }}
          >
            {joining ? 'Joining...' : club.join_mode === 'approval' ? 'Request to Join' : 'Join Club'}
          </button>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5" style={{ border: '1.5px solid #CC2B2B', color: '#CC2B2B', borderRadius: 22 }}>
              <span>✓</span>
              {membership.role === 'owner' ? 'Owner' : membership.role === 'admin' ? 'Admin' : 'Member'}
            </div>
            {membership.role !== 'owner' && (
              <button
                onClick={handleLeave}
                className="px-4 py-2.5 text-xs font-medium"
                style={{ border: '1.5px solid #F0F0F0', color: '#999', borderRadius: 22 }}
              >
                Leave
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="mt-4 border-b border-border/50">
        <div className="flex px-2 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-3 py-3 text-[13px] font-semibold transition-all"
              style={{
                color: activeTab === tab.id ? '#CC2B2B' : '#AAA',
                borderBottom: activeTab === tab.id ? '2.5px solid #CC2B2B' : '2.5px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 py-4 pb-24">
        {activeTab === 'feed' && (
          <ClubFeed clubId={clubId!} isMember={isMember} isAdmin={isAdmin} club={club} />
        )}
        {activeTab === 'events' && (
          <ClubEvents clubId={clubId!} isMember={isMember} isAdmin={isAdmin} />
        )}
        {activeTab === 'garage' && (
          <ClubGarage clubId={clubId!} isMember={isMember} />
        )}
        {activeTab === 'routes' && (
          <ClubRoutes clubId={clubId!} isMember={isMember} />
        )}
        {activeTab === 'members' && (
          <ClubMembers clubId={clubId!} isAdmin={isAdmin} currentUserId={user?.id} />
        )}
        {activeTab === 'about' && (
          <div className="space-y-4">
            {club.description && (
              <div className="bg-card rounded-2xl border border-border/50 p-4">
                <h3 className="text-sm font-bold text-foreground mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{club.description}</p>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground">Details</h3>
              {club.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>📍</span>
                  {club.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>📅</span>
                Founded {format(new Date(club.created_at), 'MMMM yyyy')}
              </div>
              {club.join_mode && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{club.join_mode === 'auto' ? '🌐' : club.join_mode === 'approval' ? '✅' : '🔒'}</span>
                  {club.join_mode === 'auto' ? 'Open to join' : club.join_mode === 'approval' ? 'Approval required' : 'Invite only'}
                </div>
              )}
            </div>

            {Array.isArray(club.rules) && club.rules.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/50 p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Club Rules</h3>
                <div className="space-y-2">
                  {(club.rules as string[]).map((rule: string, i: number) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 text-center">{i + 1}</span>
                      <p className="text-sm text-foreground flex-1">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(socialLinks?.instagram || socialLinks?.facebook) && (
              <div className="bg-card rounded-2xl border border-border/50 p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Social</h3>
                {socialLinks?.instagram && (
                  <a
                    href={`https://instagram.com/${socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500 mb-2"
                  >
                    📸 @{socialLinks.instagram}
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500"
                  >
                    👥 Facebook page
                  </a>
                )}
              </div>
            )}

            {/* Invite code for members */}
            {isMember && club.invite_code && (
              <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground">Invite Code</h3>
                <p className="text-xs text-muted-foreground">Share this code to invite others directly</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-center">
                    <span className="text-lg font-mono font-bold text-foreground tracking-widest">
                      {club.invite_code?.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(club.invite_code?.toUpperCase())
                      toast.success('Code copied!')
                    }}
                    className="px-4 py-3 rounded-xl bg-foreground text-background text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Organiser info */}
            {club.profiles && (
              <button
                onClick={() => navigate(`/user/${club.profiles?.username}`)}
                className="w-full bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  {club.profiles?.avatar_url ? (
                    <img src={club.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {(club.profiles?.display_name || club.profiles?.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">Founded by</p>
                  <p className="text-sm font-semibold text-foreground">{club.profiles?.display_name || club.profiles?.username}</p>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            )}

            <div className="mt-4">
              <ClubLeaderboard clubId={clubId!} currentUserId={user?.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
