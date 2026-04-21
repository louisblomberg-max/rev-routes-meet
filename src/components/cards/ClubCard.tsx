import { Users } from 'lucide-react'

interface ClubCardProps {
  club: {
    id: string
    name: string
    handle?: string
    location?: string | null
    member_count?: number
    logo_url?: string | null
    cover_url?: string | null
    club_type?: string | null
    is_verified?: boolean
    description?: string | null
  }
  onClick: () => void
}

const ClubCard = ({ club, onClick }: ClubCardProps) => {
  return (
    <button onClick={onClick} className="w-full text-left overflow-hidden bg-card hover:border-border active:scale-[0.99] transition-all duration-200" style={{ borderRadius: 16, border: '1px solid #F0F0F0' }}>
      <div className="relative w-full h-20">
        {club.cover_url ? (
          <img src={club.cover_url} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-clubs/30 to-clubs/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden bg-card flex-shrink-0">
            {club.logo_url ? (
              <img src={club.logo_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-clubs to-clubs/60 flex items-center justify-center text-white font-bold text-xs">
                {club.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-sm font-bold text-white drop-shadow-md truncate">{club.name}</p>
        </div>
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{(club.member_count || 0).toLocaleString()} members</span>
        </div>
        {club.club_type && (
          <span className="px-2 py-0.5 rounded-full bg-clubs/10 text-clubs text-[10px] font-semibold capitalize">
            {club.club_type.replace(/_/g, ' ')}
          </span>
        )}
      </div>
    </button>
  )
}

export default ClubCard
