import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function ClubGarage({ clubId, isMember }: { clubId: string; isMember: boolean }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myVehicles, setMyVehicles] = useState<any[]>([])
  const [showShareSheet, setShowShareSheet] = useState(false)

  useEffect(() => {
    fetchVehicles()
    if (user?.id) fetchMyVehicles()

    const channel = supabase
      .channel(`club-garage-${clubId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'club_posts',
        filter: `club_id=eq.${clubId}`
      }, () => fetchVehicles())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clubId, user?.id])

  const fetchVehicles = async () => {
    const { data: memberIds } = await supabase
      .from('club_memberships')
      .select('user_id')
      .eq('club_id', clubId)

    if (!memberIds?.length) { setLoading(false); return }

    const userIds = memberIds.map(m => m.user_id)
    const { data } = await supabase
      .from('vehicles')
      .select('*, profiles!user_id(id, username, display_name, avatar_url)')
      .in('user_id', userIds)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    setVehicles(data || [])
    setLoading(false)
  }

  const fetchMyVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_primary', { ascending: false })
    setMyVehicles(data || [])
  }

  return (
    <div className="space-y-4">
      {isMember && (
        <button
          onClick={() => setShowShareSheet(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground font-medium mb-4"
        >
          + Share a vehicle to the club
        </button>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-3xl">🚗</p>
          <p className="font-semibold text-foreground">No vehicles yet</p>
          <p className="text-sm text-muted-foreground">Members can share their vehicles here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {vehicles.map((vehicle: any) => (
            <button
              key={vehicle.id}
              onClick={() => navigate(`/user/${vehicle.profiles?.username}`)}
              className="bg-card rounded-2xl border border-border/50 overflow-hidden text-left"
            >
              <div className="aspect-[4/3] bg-muted">
                {vehicle.photos?.[0] ? (
                  <img src={vehicle.photos[0]} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-foreground truncate">
                  {vehicle.make} {vehicle.model}
                </p>
                <p className="text-[10px] text-muted-foreground">{vehicle.year}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-4 h-4 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {vehicle.profiles?.avatar_url ? (
                      <img src={vehicle.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : null}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {vehicle.profiles?.display_name || vehicle.profiles?.username}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Share vehicle sheet */}
      {showShareSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-card rounded-t-3xl w-full max-w-md p-6 space-y-4 safe-bottom">
            <h3 className="text-base font-bold text-foreground">Share a vehicle</h3>
            <p className="text-xs text-muted-foreground">Choose which vehicle to share with the club</p>
            {myVehicles.map((v: any) => (
              <button
                key={v.id}
                onClick={async () => {
                  await supabase.from('club_posts').insert({
                    club_id: clubId,
                    user_id: user?.id,
                    body: `Check out my ${v.make} ${v.model} ${v.year}`,
                    photos: v.photos || [],
                    post_type: 'vehicle',
                    likes: 0,
                    comment_count: 0,
                    is_pinned: false,
                  })
                  setShowShareSheet(false)
                  toast.success('Vehicle shared to club!')
                  fetchVehicles()
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  {v.photos?.[0] ? (
                    <img src={v.photos[0]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🚗</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{v.make} {v.model}</p>
                  <p className="text-xs text-muted-foreground">{v.year} {v.variant && `· ${v.variant}`}</p>
                </div>
              </button>
            ))}
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
