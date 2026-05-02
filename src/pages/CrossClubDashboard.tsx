import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronRight, Users, MessageSquare, Settings as SettingsIcon } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import BackButton from '@/components/BackButton'

const RECENT_WINDOW_DAYS = 30

type ClubRow = {
  id: string
  name: string
  handle: string | null
  logo_url: string | null
  member_count: number
  posts_recent: number
}

export default function CrossClubDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clubs, setClubs] = useState<ClubRow[]>([])

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    const load = async () => {
      setLoading(true)

      const { data: memberships } = await supabase
        .from('club_memberships')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .eq('status', 'active')

      const ownedIds = (memberships || []).map(m => m.club_id)
      if (ownedIds.length === 0) {
        if (!cancelled) {
          setClubs([])
          setLoading(false)
        }
        return
      }

      const since = new Date()
      since.setDate(since.getDate() - RECENT_WINDOW_DAYS)
      const sinceISO = since.toISOString()

      const [clubsRes, postsRes] = await Promise.all([
        supabase
          .from('clubs')
          .select('id, name, handle, logo_url, member_count')
          .in('id', ownedIds),
        supabase
          .from('club_posts')
          .select('club_id, created_at')
          .in('club_id', ownedIds)
          .gte('created_at', sinceISO)
          .neq('is_hidden', true),
      ])

      if (cancelled) return

      const postCounts = new Map<string, number>()
      for (const p of postsRes.data || []) {
        if (p.club_id) postCounts.set(p.club_id, (postCounts.get(p.club_id) || 0) + 1)
      }

      const rows: ClubRow[] = (clubsRes.data || []).map(c => ({
        id: c.id,
        name: c.name,
        handle: c.handle,
        logo_url: c.logo_url,
        member_count: c.member_count || 0,
        posts_recent: postCounts.get(c.id) || 0,
      }))
      rows.sort((a, b) => b.member_count - a.member_count)

      setClubs(rows)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

  const totalMembers = clubs.reduce((s, c) => s + c.member_count, 0)
  const totalPosts = clubs.reduce((s, c) => s + c.posts_recent, 0)

  return (
    <div className="mobile-container bg-background min-h-dvh pb-24 md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border/50 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50" iconClassName="w-4 h-4" />
          <h1 className="text-lg font-bold text-foreground">Cross-club</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <>
            <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            <div className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
            <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
          </>
        ) : clubs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-3xl">👋</p>
            <p className="font-semibold text-foreground">You don't own any clubs yet.</p>
            <p className="text-sm text-muted-foreground">Create or take over a club to see it here.</p>
            <button
              onClick={() => navigate('/add/club')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold"
            >
              Create a club
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card border border-border/50 rounded-2xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clubs owned</p>
                <p className="text-xl font-bold text-foreground mt-1">{clubs.length}</p>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Members</p>
                <p className="text-xl font-bold text-foreground mt-1">{totalMembers.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Posts ({RECENT_WINDOW_DAYS}d)</p>
                <p className="text-xl font-bold text-foreground mt-1">{totalPosts.toLocaleString()}</p>
              </div>
            </div>

            {clubs.length > 1 && (
              <div className="bg-card border border-border/50 rounded-2xl p-3">
                <p className="text-sm font-bold text-foreground mb-2">Members by club</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clubs.map(c => ({ name: c.name.length > 14 ? c.name.slice(0, 13) + '…' : c.name, members: c.member_count, posts: c.posts_recent }))}
                      margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={32} />
                      <Tooltip />
                      <Bar dataKey="members" fill="#CC2B2B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {clubs.map(c => (
                <div key={c.id} className="bg-card border border-border/50 rounded-2xl p-3 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/club/${c.id}`)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      {c.logo_url ? (
                        <img src={c.logo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base font-bold text-muted-foreground">
                          {c.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{c.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {c.member_count.toLocaleString()}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {c.posts_recent}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => navigate(`/club/${c.id}/settings`)}
                    aria-label="Manage"
                    className="w-9 h-9 rounded-xl bg-muted/40 flex items-center justify-center flex-shrink-0"
                  >
                    <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
