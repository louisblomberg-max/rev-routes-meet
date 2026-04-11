import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/PlanContext'
import { Search, Plus, Users, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import BackButton from '@/components/BackButton'

const CLUB_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'make_model', label: 'Make & Model' },
  { id: 'regional', label: 'Regional' },
  { id: 'track_racing', label: 'Track & Racing' },
  { id: 'off_road', label: 'Off Road' },
  { id: 'classics', label: 'Classics' },
  { id: 'electric', label: 'Electric' },
  { id: 'motorcycles', label: 'Motorcycles' },
  { id: 'general', label: 'General' },
]

const SORT_OPTIONS = [
  { id: 'members', label: 'Most Members' },
  { id: 'active', label: 'Most Active' },
  { id: 'newest', label: 'Newest' },
]

export default function Clubs() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentPlan } = usePlan()
  const [clubs, setClubs] = useState<any[]>([])
  const [myClubIds, setMyClubIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [sortBy, setSortBy] = useState('members')
  const [activeTab, setActiveTab] = useState<'discover' | 'my'>('discover')
  const [myClubs, setMyClubs] = useState<any[]>([])
  const [inviteCode, setInviteCode] = useState('')
  const [showInviteInput, setShowInviteInput] = useState(false)
  const [suggestedClubs, setSuggestedClubs] = useState<any[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      const { data: memberships } = await supabase
        .from('club_memberships')
        .select('club_id')
        .eq('user_id', user.id)
      setMyClubIds(memberships?.map(m => m.club_id) || [])
    }
    load()
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const loadSuggested = async () => {
      const { data } = await supabase.rpc('suggest_clubs_for_user', { p_user_id: user.id })
      setSuggestedClubs(data || [])
    }
    loadSuggested()
  }, [user?.id])

  useEffect(() => {
    fetchClubs()
  }, [activeType, sortBy, searchQuery, activeTab, user?.id])

  const fetchClubs = async () => {
    setLoading(true)
    try {
      if (activeTab === 'my') {
        if (!user?.id) { setMyClubs([]); return }
        const { data: memberships } = await supabase
          .from('club_memberships')
          .select('role, joined_at, points, club_id')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })

        if (memberships?.length) {
          const clubIds = memberships.map(m => m.club_id)
          const { data: clubsData } = await supabase
            .from('clubs')
            .select('*')
            .in('id', clubIds)

          const merged = memberships.map(m => {
            const c = clubsData?.find((cl: any) => cl.id === m.club_id)
            return c ? { ...c, myRole: m.role, myPoints: m.points } : null
          }).filter(Boolean)
          setMyClubs(merged)
        } else {
          setMyClubs([])
        }
      } else {
        let query = supabase
          .from('clubs')
          .select('*')
          .eq('visibility', 'public')

        if (activeType !== 'all') query = query.eq('club_type', activeType)
        if (searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,handle.ilike.%${searchQuery}%`)
        }
        if (sortBy === 'members') query = query.order('member_count', { ascending: false })
        else if (sortBy === 'active') query = query.order('post_count', { ascending: false })
        else query = query.order('created_at', { ascending: false })

        query = query.limit(30)
        const { data } = await query
        setClubs(data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (club: any) => {
    if (!user?.id) { navigate('/auth'); return }
    if (club.join_mode === 'invite_only') {
      setShowInviteInput(true)
      return
    }
    if (club.join_mode === 'approval') {
      await supabase.from('club_join_requests').upsert({
        club_id: club.id, user_id: user.id, status: 'pending'
      })
      toast.success('Join request sent to club admin')
      return
    }
    const { error } = await supabase.from('club_memberships').insert({
      club_id: club.id, user_id: user.id, role: 'member'
    })
    if (!error) {
      setMyClubIds(prev => [...prev, club.id])
      if (club.created_by) {
        await supabase.rpc('send_notification', {
          p_user_id: club.created_by,
          p_type: 'club_join',
          p_title: 'New member joined',
          p_body: `Someone joined your club ${club.name}`,
          p_data: { club_id: club.id }
        })
      }
      toast.success(`Joined ${club.name}!`)
      navigate(`/club/${club.id}`)
    }
  }

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim() || !user?.id) return
    const { data: club } = await supabase
      .from('clubs')
      .select('*')
      .eq('invite_code', inviteCode.trim().toLowerCase())
      .maybeSingle()
    if (!club) { toast.error('Invalid invite code'); return }
    const { error } = await supabase.from('club_memberships').insert({
      club_id: club.id, user_id: user.id, role: 'member'
    })
    if (!error) {
      setShowInviteInput(false)
      setInviteCode('')
      toast.success(`Joined ${club.name}!`)
      navigate(`/club/${club.id}`)
    }
  }

  const displayClubs = activeTab === 'my' ? myClubs : clubs

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 safe-top">
          <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'community'); navigate('/'); }} />
          <h1 className="text-lg font-bold text-foreground flex-1">Clubs</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteInput(true)}
              className="h-9 px-3 rounded-xl bg-muted/80 text-xs font-medium text-muted-foreground border border-border/50"
            >
              Join with code
            </button>
            <button
              onClick={() => {
                if (currentPlan === 'club') {
                  navigate('/add/club')
                } else {
                  toast.info('Creating clubs requires a Club/Business plan', {
                    action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
                  })
                }
              }}
              className="h-9 px-3 rounded-xl bg-foreground flex items-center gap-1.5 text-background text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Create
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-4 pb-3">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { id: 'discover' as const, label: 'Discover' },
              { id: 'my' as const, label: 'My Clubs' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clubs..."
            className="w-full bg-muted/50 border border-border/30 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Type filter chips */}
        {activeTab === 'discover' && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {CLUB_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeType === type.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-muted/50 text-muted-foreground border-border/50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invite code input */}
      {showInviteInput && (
        <div className="px-4 py-4 border-b border-border/50 bg-muted/20">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Join with invite code</p>
            <input
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="Enter 8-character code"
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={8}
            />
            <button
              onClick={handleJoinWithCode}
              className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-semibold"
            >
              Join Club
            </button>
            <button
              onClick={() => setShowInviteInput(false)}
              className="w-full py-2 text-sm text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sort bar — discover only */}
      {activeTab === 'discover' && (
        <div className="px-4 py-2 flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                sortBy === opt.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted/30 text-muted-foreground border-border/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Club list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Suggested clubs */}
        {activeTab === 'discover' && suggestedClubs.length > 0 && !searchQuery && activeType === 'all' && (
          <div className="space-y-3 mb-4">
            <p className="text-sm font-bold text-foreground">Suggested for you</p>
            {suggestedClubs.slice(0, 3).map((club: any) => (
              <div key={club.id} className="space-y-1">
                <ClubDiscoveryCard
                  club={club}
                  isMember={myClubIds.includes(club.id)}
                  onJoin={() => handleJoin(club)}
                  onView={() => navigate(`/club/${club.id}`)}
                />
                <p className="text-[10px] text-muted-foreground px-2">
                  ✨ {club.match_reason}
                </p>
              </div>
            ))}
          </div>
        )}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-52 rounded-2xl" />
          ))
        ) : displayClubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-4">🏁</p>
            <p className="font-bold text-foreground text-base">
              {activeTab === 'my' ? 'No clubs yet' : 'No clubs found'}
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
              {activeTab === 'my'
                ? 'Join a club or create your own'
                : 'Try a different search or category'}
            </p>
            {activeTab === 'my' && (
              <>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold"
                >
                  Discover Clubs
                </button>
                {currentPlan === 'club' ? (
                  <button
                    onClick={() => navigate('/add/club')}
                    className="mt-2 w-full px-6 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground"
                  >
                    Create a club
                  </button>
                ) : (
                  <button
                    onClick={() => toast.info('Creating clubs requires a Club/Business plan', { action: { label: 'Upgrade', onClick: () => navigate('/upgrade') } })}
                    className="mt-2 w-full px-6 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground"
                  >
                    ⭐ Create a club — Club / Business plan
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          displayClubs.map((club: any) => (
            <ClubDiscoveryCard
              key={club.id}
              club={club}
              isMember={myClubIds.includes(club.id)}
              onJoin={() => handleJoin(club)}
              onView={() => navigate(`/club/${club.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ClubDiscoveryCard({ club, isMember, onJoin, onView }: any) {
  return (
    <button onClick={onView} className="w-full text-left rounded-2xl overflow-hidden border border-border/50 bg-card">
      {/* Cover image */}
      <div className="relative w-full h-28">
        {club.cover_url ? (
          <img src={club.cover_url} className="w-full h-full object-cover" alt={club.name} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-clubs/30 to-clubs/10 flex items-center justify-center">
            <span className="text-3xl">🏎</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Verified badge */}
        {club.is_verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/90 text-white text-[10px] font-bold">
            <Star className="w-2.5 h-2.5 fill-white" />
            Verified
          </div>
        )}

        {/* Club logo and name overlay */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden flex-shrink-0 bg-card">
            {club.logo_url ? (
              <img src={club.logo_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-clubs to-clubs/60 flex items-center justify-center text-white font-bold text-sm">
                {club.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white drop-shadow-md leading-tight">{club.name}</p>
            <p className="text-[10px] text-white/80 font-medium">@{club.handle}</p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3.5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="px-2 py-0.5 rounded-full bg-clubs/10 text-clubs text-[10px] font-semibold border border-clubs/20">
            {club.club_type?.replace(/_/g, ' ')}
          </span>
          {club.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        {club.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{club.description}</p>
        )}

        {/* Stats and join */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {club.member_count}
            </div>
            {club.location && (
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">📍 {club.location}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); if (!isMember) onJoin() }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isMember
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-foreground text-background'
            }`}
          >
            {isMember ? 'Joined ✓' : club.join_mode === 'approval' ? 'Request' : 'Join'}
          </button>
        </div>
      </div>
    </button>
  )
}
