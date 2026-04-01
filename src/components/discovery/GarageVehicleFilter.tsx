import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface GarageVehicleFilterProps {
  userId?: string
  onFilterChange: (filter: { make: string; vehicleType: string } | null) => void
}

export default function GarageVehicleFilter({ userId, onFilterChange }: GarageVehicleFilterProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('id, make, model, year, variant, vehicle_type, photos')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
      setVehicles(data || [])
    }
    load()
  }, [userId])

  const handleSelect = (vehicle: any) => {
    if (selectedVehicleId === vehicle.id) {
      setSelectedVehicleId(null)
      onFilterChange(null)
    } else {
      setSelectedVehicleId(vehicle.id)
      onFilterChange({
        make: vehicle.make,
        vehicleType: vehicle.vehicle_type
      })
    }
  }

  if (!vehicles.length) return (
    <p className="text-xs text-muted-foreground">Add vehicles to My Garage to use this filter</p>
  )

  return (
    <div className="space-y-2">
      <button
        onClick={() => {
          if (selectedVehicleId === 'all') {
            setSelectedVehicleId(null)
            onFilterChange(null)
          } else {
            setSelectedVehicleId('all')
            const makes = [...new Set(vehicles.map(v => v.make))]
            onFilterChange({ make: makes.join(','), vehicleType: 'all' })
          }
        }}
        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
          selectedVehicleId === 'all' ? 'bg-events/10 border-events' : 'bg-muted/30 border-border/30'
        }`}
      >
        <p className="text-lg">🚗</p>
        <p className="text-sm font-medium flex-1 text-left">All my vehicles</p>
        <div className={`w-4 h-4 rounded-full border-2 ${selectedVehicleId === 'all' ? 'bg-events border-events' : 'border-muted-foreground'}`} />
      </button>

      {vehicles.map(vehicle => (
        <button
          key={vehicle.id}
          onClick={() => handleSelect(vehicle)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
            selectedVehicleId === vehicle.id ? 'bg-events/10 border-events' : 'bg-muted/30 border-border/30'
          }`}
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {vehicle.photos?.[0] ? (
              <img src={vehicle.photos[0]} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">
                {vehicle.vehicle_type === 'motorcycle' ? '🏍' : '🚗'}
              </div>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{vehicle.make} {vehicle.model}</p>
            <p className="text-[10px] text-muted-foreground">{vehicle.year}{vehicle.variant && ` · ${vehicle.variant}`}</p>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 ${selectedVehicleId === vehicle.id ? 'bg-events border-events' : 'border-muted-foreground'}`} />
        </button>
      ))}
    </div>
  )
}
