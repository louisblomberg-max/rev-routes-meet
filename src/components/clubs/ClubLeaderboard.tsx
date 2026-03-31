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

  useEffect(() => {
    fetchLeaderboard()
  }, [clubId])

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('club_memberships')
      .select(`
        user_id, points, role, joined_at,
        profiles!user_id(id, username, display_name, avatar_url)
      `)
      .eq('club_id', clubId)
      .order('points', { ascending: false })
      .limit(50)

    setLeaderboard(data || [])

    const myIndex = data?.findIndex(m => m.user_id === currentUserId)
    if (myIndex !== undefined && myIndex >= 0) {
      setMyRank(myIndex + 1)
    }
    setLoading(false)
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="space-y-4">
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
              {leaderboard.find(m => m.user_id === currentUserId)?.points || 0}
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

          return (
            <button
              key={member.user_id}
              onClick={() => navigate(`/profile/${member.profiles?.id}`)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                isMe
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : rank <= 3
                  ? 'bg-card border-border/50 shadow-sm'
                  : 'bg-card border-border/30'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {medal ? (
                  <span className="text-lg">{medal}</span>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {member.profiles?.avatar_url ? (
                  <img src={member.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {(member.profiles?.display_name || member.profiles?.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {member.profiles?.display_name || member.profiles?.username}
                  {isMe && <span className="text-muted-foreground font-normal"> (you)</span>}
                </p>
                <p className="text-[10px] text-muted-foreground">{member.role}</p>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{member.points || 0}</p>
                <p className="text-[10px] text-muted-foreground">pts</p>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}
