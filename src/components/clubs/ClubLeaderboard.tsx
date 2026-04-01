import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Trophy, Star, Heart, Calendar } from 'lucide-react'

export default function ClubLeaderboard({ clubId, currentUserId }: {
  clubId: string
  currentUserId?: string
}) {
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<number | null>(null)
  const [leaderboardTab, setLeaderboardTab] = useState<'alltime' | 'weekly' | 'monthly'>('alltime')

  const fetchLeaderboard = async () => {
    setLoading(true)
    const orderColumn = leaderboardTab === 'weekly' ? 'weekly_points'
      : leaderboardTab === 'monthly' ? 'monthly_points'
      : 'points'

    const { data } = await supabase
      .from('club_memberships')
      .select(`
        user_id, points, weekly_points, monthly_points,
        role, joined_at, is_founding_member, badges, streak_weeks,
        profiles!user_id(id, username, display_name, avatar_url)
      `)
      .eq('club_id', clubId)
      .order(orderColumn, { ascending: false })
      .limit(50)

    setLeaderboard(data || [])

    const myIndex = data?.findIndex(m => m.user_id === currentUserId)
    if (myIndex !== undefined && myIndex >= 0) {
      setMyRank(myIndex + 1)
    } else {
      setMyRank(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()

    const channel = supabase
      .channel(`club-leaderboard-${clubId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'club_memberships',
        filter: `club_id=eq.${clubId}`
      }, () => fetchLeaderboard())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clubId, leaderboardTab])

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getPointsValue = (member: any) => {
    if (leaderboardTab === 'weekly') return member.weekly_points || 0
    if (leaderboardTab === 'monthly') return member.monthly_points || 0
    return member.points || 0
  }

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {[
          { id: 'alltime' as const, label: 'All Time' },
          { id: 'weekly' as const, label: 'This Week' },
          { id: 'monthly' as const, label: 'This Month' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setLeaderboardTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              leaderboardTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* How points work */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <p className="text-sm font-bold text-foreground mb-3">How to earn points</p>
        <div className="space-y-2">
          {[
            { icon: Heart, label: 'Post gets a like', points: '+1' },
            { icon: Star, label: 'Create a post', points: '+2' },
            { icon: Calendar, label: 'Attend club event', points: '+5' },
            { icon: Trophy, label: 'Host club event', points: '+10' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
              <item.icon className="w-3.5 h-3.5" />
              <span className="flex-1">{item.label}</span>
              <span className="font-semibold text-foreground">{item.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My rank */}
      {myRank && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Your rank</p>
            <p className="text-lg font-bold text-foreground">#{myRank}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Points</p>
            <p className="text-lg font-bold text-foreground">
              {getPointsValue(leaderboard.find(m => m.user_id === currentUserId) || {})}
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
        ))
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-3xl">🏆</p>
          <p className="font-semibold text-foreground">No points yet</p>
          <p className="text-sm text-muted-foreground">Post, attend events and earn points!</p>
        </div>
      ) : (
        leaderboard.map((member, index) => {
          const rank = index + 1
          const medal = getMedalEmoji(rank)
          const isMe = member.user_id === currentUserId
          const pts = getPointsValue(member)

          return (
            <button key={member.user_id} onClick={() => navigate(`/profile/${member.profiles?.id}`)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                isMe
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : rank <= 3
                  ? 'bg-card border-border/50 shadow-sm'
                  : 'bg-card border-border/30'
              }`}>
              <div className="w-8 text-center flex-shrink-0">
                {medal ? <span className="text-lg">{medal}</span> : <span className="text-xs font-bold text-muted-foreground">#{rank}</span>}
              </div>
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {member.profiles?.avatar_url ? (
                  <img src={member.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {(member.profiles?.display_name || member.profiles?.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {member.profiles?.display_name || member.profiles?.username}
                  {isMe && <span className="text-muted-foreground font-normal"> (you)</span>}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-muted-foreground">{member.role}</p>
                  {member.is_founding_member && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 px-1.5 rounded-full font-semibold">Founder</span>}
                  {(member.streak_weeks || 0) >= 3 && <span className="text-[10px]">🔥{member.streak_weeks}w</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{pts}</p>
                <p className="text-[10px] text-muted-foreground">pts</p>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}
