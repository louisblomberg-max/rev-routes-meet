import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { Calendar, Users, MapPin } from 'lucide-react'

export default function ClubEvents({ clubId, isMember, isAdmin }: {
  clubId: string
  isMember: boolean
  isAdmin: boolean
}) {
  const navigate = useNavigate()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    fetchEvents()
  }, [clubId, activeFilter])

  const fetchEvents = async () => {
    setLoading(true)
    let query = supabase
      .from('events')
      .select('*, profiles!created_by(username, display_name, avatar_url)')
      .eq('club_id', clubId)
      .order('date_start', { ascending: activeFilter === 'upcoming' })

    if (activeFilter === 'upcoming') {
      query = query.gte('date_start', new Date().toISOString())
    } else {
      query = query.lt('date_start', new Date().toISOString())
    }

    const { data } = await query.limit(20)
    setEvents(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex bg-muted rounded-lg p-1">
        {(['upcoming', 'past'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeFilter === filter
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isAdmin && (
        <button
          onClick={() => navigate('/add/event')}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground font-medium"
        >
          + Create club event
        </button>
      )}

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted/50 animate-pulse" />
        ))
      ) : events.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-3xl">📅</p>
          <p className="font-semibold text-foreground">{activeFilter === 'upcoming' ? 'No upcoming events' : 'No past events'}</p>
          {isAdmin && activeFilter === 'upcoming' && (
            <p className="text-sm text-muted-foreground">Create an event and link it to this club</p>
          )}
        </div>
      ) : (
        events.map(event => (
          <button
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden text-left"
          >
            {event.banner_url && (
              <div className="w-full h-24 overflow-hidden">
                <img src={event.banner_url} className="w-full h-full object-cover" alt={event.title} />
              </div>
            )}
            <div className="p-4 space-y-2">
              <p className="text-sm font-bold text-foreground">{event.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {event.date_start ? format(new Date(event.date_start), 'EEE d MMM · HH:mm') : 'TBC'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.attendee_count || 0}
                </span>
              </div>
              {event.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </p>
              )}
            </div>
          </button>
        ))
      )}
    </div>
  )
}
