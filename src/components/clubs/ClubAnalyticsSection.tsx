import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const WEEKS = 12

function startOfWeekISO(d: Date): string {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay()
  const diff = (day + 6) % 7
  x.setDate(x.getDate() - diff)
  return x.toISOString().slice(0, 10)
}

function buildWeekBuckets(): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = []
  const now = new Date()
  const thisWeek = new Date(startOfWeekISO(now))
  for (let i = WEEKS - 1; i >= 0; i--) {
    const d = new Date(thisWeek)
    d.setDate(d.getDate() - i * 7)
    const iso = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    out.push({ iso, label })
  }
  return out
}

export default function ClubAnalyticsSection({ clubId }: { clubId: string }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [memberCount, setMemberCount] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [memberSeries, setMemberSeries] = useState<{ label: string; total: number }[]>([])
  const [postSeries, setPostSeries] = useState<{ label: string; posts: number }[]>([])
  const [topContributors, setTopContributors] = useState<any[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - WEEKS * 7)
      const cutoffISO = cutoff.toISOString()

      const [membershipsRes, postsRes, leadersRes] = await Promise.all([
        supabase
          .from('club_memberships')
          .select('joined_at')
          .eq('club_id', clubId)
          .eq('status', 'active'),
        supabase
          .from('club_posts')
          .select('created_at')
          .eq('club_id', clubId)
          .neq('is_hidden', true)
          .gte('created_at', cutoffISO),
        supabase
          .from('club_leaderboard')
          .select('user_id, points, posts_made, events_attended, routes_shared, profiles!user_id(id, username, display_name, avatar_url)')
          .eq('club_id', clubId)
          .order('points', { ascending: false })
          .limit(5),
      ])

      if (cancelled) return

      const memberships = membershipsRes.data || []
      const posts = postsRes.data || []
      const leaders = leadersRes.data || []

      setMemberCount(memberships.length)
      setPostCount(posts.length)

      const buckets = buildWeekBuckets()
      const bucketIsoSet = buckets.map(b => b.iso)

      const cumulativeBefore = memberships.filter(m => m.joined_at && m.joined_at < bucketIsoSet[0]).length
      let running = cumulativeBefore
      const memSeries = buckets.map(b => {
        const nextWeek = new Date(b.iso)
        nextWeek.setDate(nextWeek.getDate() + 7)
        const nextISO = nextWeek.toISOString().slice(0, 10)
        const joinedThisWeek = memberships.filter(
          m => m.joined_at && m.joined_at >= b.iso && m.joined_at < nextISO,
        ).length
        running += joinedThisWeek
        return { label: b.label, total: running }
      })
      setMemberSeries(memSeries)

      const postSer = buckets.map(b => {
        const nextWeek = new Date(b.iso)
        nextWeek.setDate(nextWeek.getDate() + 7)
        const nextISO = nextWeek.toISOString().slice(0, 10)
        const count = posts.filter(p => p.created_at && p.created_at >= b.iso && p.created_at < nextISO).length
        return { label: b.label, posts: count }
      })
      setPostSeries(postSer)

      setTopContributors(leaders)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [clubId])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  const growthDelta = memberSeries.length >= 2
    ? memberSeries[memberSeries.length - 1].total - memberSeries[0].total
    : 0

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border/50 rounded-2xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Members</p>
          <p className="text-xl font-bold text-foreground mt-1">{memberCount.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">+{growthDelta} in {WEEKS}w</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Posts ({WEEKS}w)</p>
          <p className="text-xl font-bold text-foreground mt-1">{postCount.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{(postCount / WEEKS).toFixed(1)}/week</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active leaders</p>
          <p className="text-xl font-bold text-foreground mt-1">{topContributors.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">tracked on board</p>
        </div>
      </div>

      {/* Member growth */}
      <div className="bg-card border border-border/50 rounded-2xl p-3">
        <p className="text-sm font-bold text-foreground mb-2">Member growth</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={memberSeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={32} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#CC2B2B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Posts per week */}
      <div className="bg-card border border-border/50 rounded-2xl p-3">
        <p className="text-sm font-bold text-foreground mb-2">Posts per week</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={postSeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={32} />
              <Tooltip />
              <Bar dataKey="posts" fill="#CC2B2B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top contributors */}
      <div className="bg-card border border-border/50 rounded-2xl p-3 space-y-2">
        <p className="text-sm font-bold text-foreground">Top contributors</p>
        {topContributors.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">No contributor data yet.</p>
        ) : (
          topContributors.map((c, i) => {
            const p = c.profiles
            const name = p?.display_name || p?.username || 'Member'
            return (
              <button
                key={c.user_id}
                onClick={() => p?.id && navigate(`/profile/${p.id}`)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors text-left"
              >
                <span className="w-5 text-xs font-bold text-muted-foreground">#{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  {p?.avatar_url ? (
                    <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.posts_made || 0} posts · {c.events_attended || 0} events · {c.routes_shared || 0} routes
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground">{c.points || 0}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
