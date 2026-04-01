import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { MapPin, Clock, Navigation } from 'lucide-react'

export default function ClubRoutes({ clubId, isMember }: { clubId: string; isMember: boolean }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myRoutes, setMyRoutes] = useState<any[]>([])
  const [showShareSheet, setShowShareSheet] = useState(false)

  useEffect(() => {
    fetchRoutes()
    if (user?.id) fetchMyRoutes()

    const channel = supabase
      .channel(`club-routes-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'club_shared_routes',
        filter: `club_id=eq.${clubId}`
      }, () => fetchRoutes())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clubId, user?.id])

  const fetchRoutes = async () => {
    const { data } = await supabase
      .from('club_shared_routes')
      .select(`
        *,
        routes(*),
        profiles!shared_by(id, username, display_name, avatar_url)
      `)
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
    setRoutes(data || [])
    setLoading(false)
  }

  const fetchMyRoutes = async () => {
    const { data } = await supabase
      .from('routes')
      .select('*')
      .eq('created_by', user?.id)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
    setMyRoutes(data || [])
  }

  const formatDistance = (metres: number) => {
    if (!metres) return 'Unknown'
    if (metres < 1000) return `${Math.round(metres)}m`
    return `${(metres / 1609.34).toFixed(1)} mi`
  }

  return (
    <div className="space-y-4">
      {isMember && (
        <button
          onClick={() => setShowShareSheet(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground font-medium"
        >
          + Share a route with the club
        </button>
      )}

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
        ))
      ) : routes.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-3xl">🗺</p>
          <p className="font-semibold text-foreground">No routes shared yet</p>
          <p className="text-sm text-muted-foreground">Share your favourite driving routes with the club</p>
        </div>
      ) : (
        routes.map((sharedRoute: any) => {
          const route = sharedRoute.routes
          return (
            <div key={sharedRoute.id} className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-bold text-foreground">{route?.name}</p>
                  {route?.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{route.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    {route?.distance_meters && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {formatDistance(route.distance_meters)}
                      </div>
                    )}
                    {route?.duration_minutes && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {route.duration_minutes} min
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="w-4 h-4 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {sharedRoute.profiles?.avatar_url ? (
                        <img src={sharedRoute.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : null}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Shared by {sharedRoute.profiles?.display_name || sharedRoute.profiles?.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/navigation', {
                    state: {
                      destLat: route?.lat,
                      destLng: route?.lng,
                      destTitle: route?.name,
                      geometry: route?.geometry
                    }
                  })}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })
      )}

      {/* Share route sheet */}
      {showShareSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-card rounded-t-3xl w-full max-w-md p-6 space-y-4 safe-bottom">
            <h3 className="text-base font-bold text-foreground">Share a route</h3>
            {myRoutes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">You have no routes to share yet</p>
                <button
                  onClick={() => { setShowShareSheet(false); navigate('/add/route') }}
                  className="mt-3 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold"
                >
                  Create a route
                </button>
              </div>
            ) : (
              myRoutes.map((route: any) => (
                <button
                  key={route.id}
                  onClick={async () => {
                    const { error } = await supabase.from('club_shared_routes').upsert({
                      club_id: clubId,
                      route_id: route.id,
                      shared_by: user?.id
                    })
                    if (error) { toast.error('Already shared'); return }
                    setShowShareSheet(false)
                    toast.success('Route shared with the club!')
                    fetchRoutes()
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{route.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {route.distance_meters ? formatDistance(route.distance_meters) : 'Route'}
                    </p>
                  </div>
                </button>
              ))
            )}
            <button
              onClick={() => setShowShareSheet(false)}
              className="w-full py-3 text-sm text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
