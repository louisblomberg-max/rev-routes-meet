import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import BackButton from '@/components/BackButton'

export default function ClubJoinRequest() {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<string[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('clubs')
        .select('id, name, logo_url, cover_url, description, join_questions, member_count, is_verified')
        .eq('id', clubId!)
        .single()
      setClub(data)
      setAnswers(new Array(data?.join_questions?.length || 0).fill(''))
      setLoading(false)
    }
    load()
  }, [clubId])

  const handleSubmit = async () => {
    if (!user?.id) { navigate('/auth'); return }

    const { data: existing } = await supabase
      .from('club_join_requests')
      .select('id, status')
      .eq('club_id', clubId!)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing?.status === 'pending') {
      toast.info('You already have a pending request')
      return
    }

    setSubmitting(true)
    try {
      await supabase.from('club_join_requests').upsert({
        club_id: clubId,
        user_id: user.id,
        answers,
        message: message.trim() || null,
        status: 'pending',
      })

      const { data: admins } = await supabase
        .from('club_memberships')
        .select('user_id')
        .eq('club_id', clubId!)
        .in('role', ['owner', 'admin'])

      for (const admin of admins || []) {
        await supabase.rpc('send_notification', {
          p_user_id: admin.user_id,
          p_type: 'club_join_request',
          p_title: 'New join request',
          p_body: `Someone wants to join ${club.name}`,
          p_data: { club_id: clubId }
        })
      }

      toast.success('Join request sent!')
      navigate(`/club/${clubId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="mobile-container bg-background min-h-screen flex items-center justify-center md:max-w-2xl md:mx-auto">
      <div className="w-10 h-10 rounded-2xl bg-muted/50 animate-pulse" />
    </div>
  )

  if (!club) return (
    <div className="mobile-container bg-background min-h-screen flex items-center justify-center md:max-w-2xl md:mx-auto">
      <p className="text-muted-foreground">Club not found</p>
    </div>
  )

  return (
    <div className="mobile-container bg-background min-h-screen pb-24 md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-[#FAFAFA] border-b-2 border-[#E5E5E5] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" />
          <h1 className="text-lg font-bold text-foreground">Request to Join</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Club preview */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden flex-shrink-0">
            {club.logo_url ? (
              <img src={club.logo_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                {club.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-foreground truncate">{club.name}</h2>
              {club.is_verified && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">✓</span>}
            </div>
            <p className="text-xs text-muted-foreground">{club.member_count} members</p>
          </div>
        </div>

        {/* Join questions */}
        {club.join_questions?.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground">The organiser has a few questions:</p>
            {club.join_questions.map((question: string, i: number) => (
              <div key={i}>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {i + 1}. {question}
                </label>
                <textarea
                  value={answers[i] || ''}
                  onChange={e => {
                    const newAnswers = [...answers]
                    newAnswers[i] = e.target.value
                    setAnswers(newAnswers)
                  }}
                  placeholder="Your answer..."
                  rows={3}
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background resize-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Optional message */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <label className="text-sm font-medium mb-2 block">
            Message to organiser <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Introduce yourself or tell them why you want to join..."
            rows={3}
            className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background resize-none"
          />
        </div>

        <div className="bg-muted/30 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">
            Your request will be reviewed by the club admin. You will receive a notification when it is approved or rejected.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background to-transparent">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-13 bg-foreground text-background rounded-2xl font-semibold text-base disabled:opacity-40"
          >
            {submitting ? 'Sending...' : 'Send Join Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
