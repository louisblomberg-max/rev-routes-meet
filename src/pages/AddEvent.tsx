import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { validateImageFile } from '@/lib/utils'
import { getMakesByType } from '@/data/vehicles'
import { addWeeks, addMonths, format } from 'date-fns'
import BackButton from '@/components/BackButton'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import mapboxgl from 'mapbox-gl'
import {
  Camera, Plus, X, Calendar, MapPin, Users, Ticket,
  ImagePlus, RefreshCw, Info, Banknote,
  CreditCard, Eye, Globe, UsersRound, Tag, Map
} from 'lucide-react'
import CreationPaywallSheet from '@/components/CreationPaywallSheet'

const EVENT_TYPES = [
  'Meets', 'Shows', 'Drive', 'Track Day', 'Motorsport', 'Autojumble', 'Off-Road', 'Other'
]

const MEET_STYLE_TAGS = [
  'JDM', 'Supercars', 'Muscle Car', 'American', 'European',
  '4x4', 'Classics', 'Vintage', 'Modified', 'Show & Shine',
  'Track Focus', 'Charity', 'Family Friendly', 'Electric', 'Stance'
]

const VEHICLE_FOCUS_OPTIONS = [
  { id: 'all_welcome', label: 'All welcome', sub: 'Any vehicle can attend' },
  { id: 'cars_only', label: 'Cars only', sub: 'Four wheeled vehicles only' },
  { id: 'motorcycles_only', label: 'Motorcycles only', sub: 'Two wheeled vehicles only' },
  { id: 'specific_makes', label: 'Specific makes', sub: 'Choose which brands are welcome' },
]

const AddEvent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)
  const makeSearchRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const mapPickerRef = useRef<HTMLDivElement>(null)
  const pickerMapRef = useRef<mapboxgl.Map | null>(null)
  const pickerMarkerRef = useRef<mapboxgl.Marker | null>(null)

  const [saving, setSaving] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  // Credits and plan
  const [userCredits, setUserCredits] = useState(0)
  const [userPlan, setUserPlan] = useState('free')
  const [hasStripeConnect, setHasStripeConnect] = useState(false)
  const [myClubs, setMyClubs] = useState<{ id: string; name: string }[]>([])
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [allFriends, setAllFriends] = useState<any[]>([])
  const [friendsMode, setFriendsMode] = useState<'all' | 'specific'>('all')
  const [myOwnedClubs, setMyOwnedClubs] = useState<{ id: string; name: string; logo_url: string | null }[]>([])

  // Section 1 — Details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  // Section 2 — Event type
  const [eventTypes, setEventTypes] = useState<string[]>([])

  // Section 3 — Vehicle focus
  const [vehicleFocus, setVehicleFocus] = useState<'all_welcome' | 'cars_only' | 'motorcycles_only' | 'specific_makes'>('all_welcome')
  const [specificMakes, setSpecificMakes] = useState<string[]>([])
  const [makeSearch, setMakeSearch] = useState('')
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false)

  // Section 4 — Meet style tags
  const [meetStyleTags, setMeetStyleTags] = useState<string[]>([])

  // Section 5 — Dates
  const [dates, setDates] = useState([{
    id: crypto.randomUUID(),
    date: '',
    startTime: '10:00',
    endTime: '14:00'
  }])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('weekly')
  const [recurringCount, setRecurringCount] = useState(4)

  // Section 6 — Location
  const [location, setLocation] = useState('')
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [what3words, setWhat3words] = useState('')

  // Section 7 — Capacity
  const [maxAttendees, setMaxAttendees] = useState('')
  const [firstComeFirstServe, setFirstComeFirstServe] = useState(true)
  const [waitlistEnabled, setWaitlistEnabled] = useState(false)

  // Section 8 — Entry and tickets
  const [isFree, setIsFree] = useState(true)
  const [entryFee, setEntryFee] = useState('')
  const [isTicketed, setIsTicketed] = useState(false)
  const [ticketPrice, setTicketPrice] = useState('')
  const [maxTickets, setMaxTickets] = useState('')
  const [ticketTypes, setTicketTypes] = useState([{ name: 'General Admission', description: '', price: '', capacity: '' }])

  // Section 9 — Rules
  const [eventRules, setEventRules] = useState('')

  // Section 10 — Visibility
  const [visibility, setVisibility] = useState<'public' | 'club' | 'friends'>('public')
  const [clubId, setClubId] = useState('')

  // Load user data on mount
  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('free_event_credits, plan, stripe_connect_account_id')
        .eq('id', user.id)
        .single()
      if (profile) {
        setUserCredits(profile.free_event_credits || 0)
        setUserPlan(profile.plan || 'free')
        setHasStripeConnect(!!profile.stripe_connect_account_id)
      }
      const { data: clubData } = await supabase
        .from('club_memberships')
        .select('club_id, clubs(id, name)')
        .eq('user_id', user.id)
      if (clubData) {
        setMyClubs(clubData.map((d: any) => ({
          id: d.clubs?.id || d.club_id,
          name: d.clubs?.name || 'Unknown Club'
        })))
      }

      // Load owned clubs for visibility section
      const { data: ownedClubs } = await supabase
        .from('club_memberships')
        .select('club_id, clubs(id, name, logo_url)')
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin'])
      setMyOwnedClubs(ownedClubs?.map((c: any) => ({
        id: c.clubs?.id || c.club_id,
        name: c.clubs?.name || 'Unknown',
        logo_url: c.clubs?.logo_url || null
      })) || [])

      // Load friends for visibility section
      const { data: friendsData } = await supabase
        .from('friends')
        .select('user_id, friend_id, profiles!friend_id(id, username, display_name, avatar_url)')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')
      setAllFriends(friendsData?.map((f: any) => ({
        id: f.user_id === user.id ? f.friend_id : f.user_id,
        ...f.profiles
      })) || [])
    }
    load()
  }, [user?.id])

  // Make search
  const allMakes = useMemo(() => getMakesByType('all'), [])
  const filteredMakes = useMemo(() => {
    const q = makeSearch.toLowerCase().trim()
    if (!q) return allMakes.slice(0, 8)
    return allMakes.filter(m => m.name.toLowerCase().includes(q)).slice(0, 8)
  }, [makeSearch, allMakes])

  // Click outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (makeSearchRef.current && !makeSearchRef.current.contains(e.target as Node)) {
        setShowMakeSuggestions(false)
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationSuggestions([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Map picker initialisation
  useEffect(() => {
    if (!showMapPicker || !mapPickerRef.current) return
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapPickerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: locationLng && locationLat ? [locationLng, locationLat] : [-1.5, 52.5],
      zoom: locationLat ? 14 : 6,
      attributionControl: false,
    })
    pickerMapRef.current = map

    if (locationLat && locationLng) {
      pickerMarkerRef.current = new mapboxgl.Marker({ color: '#CC2222' })
        .setLngLat([locationLng, locationLat])
        .addTo(map)
    }

    map.on('click', async (e) => {
      const { lng, lat } = e.lngLat
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLngLat([lng, lat])
      } else {
        pickerMarkerRef.current = new mapboxgl.Marker({ color: '#CC2222' })
          .setLngLat([lng, lat])
          .addTo(map)
      }
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&types=address,poi,place`
        )
        const data = await res.json()
        const placeName = data.features?.[0]?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        setLocation(placeName)
        setLocationQuery(placeName)
        setLocationLat(lat)
        setLocationLng(lng)
      } catch {
        setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        setLocationLat(lat)
        setLocationLng(lng)
      }
    })

    return () => {
      map.remove()
      pickerMapRef.current = null
      pickerMarkerRef.current = null
    }
  }, [showMapPicker])

  // Location search
  useEffect(() => {
    if (locationQuery.length < 3) { setLocationSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=gb&limit=5&types=address,poi,place,postcode`
        )
        const data = await res.json()
        setLocationSuggestions(data.features || [])
      } catch { setLocationSuggestions([]) }
    }, 400)
    return () => clearTimeout(timer)
  }, [locationQuery])

  const selectLocation = (feature: any) => {
    const [lng, lat] = feature.center
    setLocation(feature.place_name)
    setLocationQuery(feature.place_name)
    setLocationLat(lat)
    setLocationLng(lng)
    setLocationSuggestions([])
  }

  // Date management
  const addDate = () => {
    setDates(prev => [...prev, {
      id: crypto.randomUUID(),
      date: '',
      startTime: '10:00',
      endTime: '14:00'
    }])
  }

  const removeDate = (id: string) => {
    if (dates.length === 1) return
    setDates(prev => prev.filter(d => d.id !== id))
  }

  const updateDate = (id: string, field: string, value: string) => {
    setDates(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const generateRecurringDates = useCallback(() => {
    if (!dates[0]?.date) {
      toast.error('Set the first date before generating recurring dates')
      return
    }
    const base = new Date(dates[0].date)
    const generated = [dates[0]]
    for (let i = 1; i < recurringCount; i++) {
      let next: Date
      if (recurringFrequency === 'weekly') next = addWeeks(base, i)
      else if (recurringFrequency === 'fortnightly') next = addWeeks(base, i * 2)
      else next = addMonths(base, i)
      generated.push({
        id: crypto.randomUUID(),
        date: format(next, 'yyyy-MM-dd'),
        startTime: dates[0].startTime,
        endTime: dates[0].endTime,
      })
    }
    setDates(generated)
    toast.success(`Generated ${generated.length} dates`)
  }, [dates, recurringFrequency, recurringCount])

  // Credit cost calculation
  const validDates = dates.filter(d => d.date)
  const dateCount = validDates.length
  const isPaidPlan = userPlan === 'pro' || userPlan === 'organiser'
  const creditsToUse = isPaidPlan ? 0 : Math.min(userCredits, dateCount)
  const datesToPay = isPaidPlan ? 0 : Math.max(0, dateCount - userCredits)
  const totalCost = datesToPay * 2.99

  // Banner and photo upload handlers
  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validationError = validateImageFile(file); if (validationError) { toast.error(validationError); e.target.value = ''; return }
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photoFiles.length + files.length > 10) {
      toast.error('Maximum 10 photos allowed')
      return
    }
    for (const file of files) {
      const validationError = validateImageFile(file); if (validationError) { toast.error(validationError); e.target.value = ''; return }
    }
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPhotoFiles(prev => [...prev, ...files])
    setPhotoPreviews(prev => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadBanner = async (uid?: string): Promise<string | null> => {
    const ownerId = uid || user?.id
    if (!bannerFile || !ownerId) return null
    try {
      const ext = bannerFile.name.split('.').pop()
      const path = `${ownerId}/${Date.now()}-banner.${ext}`
      const { error } = await supabase.storage.from('events').upload(path, bannerFile)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(path)
      return publicUrl
    } catch {
      toast.error('Failed to upload banner image')
      return null
    }
  }

  const uploadPhotos = async (uid?: string): Promise<string[]> => {
    const ownerId = uid || user?.id
    if (!photoFiles.length || !ownerId) return []
    const urls: string[] = []
    for (const file of photoFiles) {
      try {
        const ext = file.name.split('.').pop()
        const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('events').upload(path, file)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(path)
        urls.push(publicUrl)
      } catch {
        toast.error('Failed to upload photo')
      }
    }
    return urls
  }

  // Validation
  const validate = (): boolean => {
    if (!title.trim()) { toast.error('Please enter an event name'); return false }
    if (!description.trim() || description.trim().split(/\s+/).length < 15) {
      toast.error('Description must be at least 15 words'); return false
    }
    if (eventTypes.length === 0) { toast.error('Please select at least one event type'); return false }
    if (!location.trim()) { toast.error('Please enter a location'); return false }
    if (!locationLat || !locationLng) { toast.error('Please select a location from the dropdown'); return false }
    const validDatesList = dates.filter(d => d.date)
    if (validDatesList.length === 0) { toast.error('Please add at least one date'); return false }
    if (!maxAttendees) { toast.error('Please enter max attendees'); return false }
    if (isTicketed && (!ticketPrice || Number(ticketPrice) < 1)) {
      toast.error('Minimum ticket price is £1.00'); return false
    }
    if (isTicketed && !hasStripeConnect) {
      toast.error('Please connect your bank account to sell tickets'); return false
    }
    if (visibility === 'club' && !clubId) {
      toast.error('Please select a club'); return false
    }
    return true
  }

  // Main publish handler
  const handlePublish = async () => {
    if (!validate()) return
    if (!user?.id) { toast.error('Please sign in'); return }

    setSaving(true)
    const publishTimeout = setTimeout(() => {
      setSaving(false)
      toast.error('Request timed out. Please try again.')
    }, 15000)

    try {
      // Refresh session first
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession()
      if (sessionError || !sessionData?.session) {
        toast.error('Session expired. Please sign in again.')
        navigate('/auth', { replace: true })
        return
      }
      const userId = sessionData.session.user.id

      const validDatesList = dates.filter(d => d.date)
      const isPaid = userPlan === 'pro' || userPlan === 'organiser' || userPlan === 'club'

      // Check credits for free users
      if (!isPaid) {
        const creditsNeeded = Math.min(userCredits, validDatesList.length)
        const remainingAfter = userCredits - creditsNeeded
        const toPay = Math.max(0, validDatesList.length - userCredits)

        if (toPay > 0) {
          clearTimeout(publishTimeout)
          setSaving(false)
          setShowPaywall(true)
          return
        }

        // Deduct credits via RPC (server-side protected)
        if (creditsNeeded > 0) {
          for (let i = 0; i < creditsNeeded; i++) {
            await supabase.rpc('use_event_credit', { p_user_id: userId })
          }
        }
      }

      // Upload media
      const [bannerUrl, photoUrls] = await Promise.all([
        uploadBanner(userId),
        uploadPhotos(userId)
      ])

      // Create series if multiple dates
      let seriesId: string | null = null
      if (validDatesList.length > 1) {
        const { data: series, error: seriesError } = await supabase
          .from('event_series')
          .insert({
            created_by: userId,
            title: title.trim(),
            description: description.trim(),
            event_count: validDatesList.length,
          })
          .select()
          .single()
        if (!seriesError && series) seriesId = series.id
      }

      // Insert one event per date
      const eventPayloads = validDatesList.map((d, index) => {
        const dateStart = new Date(`${d.date}T${d.startTime}:00`)
        const dateEnd = new Date(`${d.date}T${d.endTime}:00`)
        return {
          created_by: userId,
          title: title.trim(),
          description: description.trim(),
          banner_url: bannerUrl,
          photos: photoUrls,
          type: eventTypes[0] || '',
          event_types: eventTypes,
          vehicle_focus: vehicleFocus,
          vehicle_brands: vehicleFocus === 'specific_makes' ? specificMakes : [],
          vehicle_types: vehicleFocus === 'cars_only' ? ['cars']
            : vehicleFocus === 'motorcycles_only' ? ['bikes'] : [],
          meet_style_tags: meetStyleTags,
          date_start: dateStart.toISOString(),
          date_end: dateEnd.toISOString(),
          location: location.trim(),
          lat: locationLat,
          lng: locationLng,
          what3words: what3words.trim() || null,
          max_attendees: maxAttendees ? Number(maxAttendees) : null,
          is_first_come_first_serve: firstComeFirstServe,
          waitlist_enabled: waitlistEnabled,
          entry_fee: !isFree && !isTicketed && entryFee ? Number(entryFee) : 0,
          is_free: isFree && !isTicketed,
          is_ticketed: isTicketed,
          ticket_price: isTicketed ? Number(ticketPrice) : 0,
          event_rules: eventRules.trim() || null,
          visibility,
          club_id: visibility === 'club' ? clubId : null,
          invited_friends: visibility === 'friends' && friendsMode === 'specific' ? selectedFriends : [],
          invited_club_id: visibility === 'club' ? clubId : null,
          series_id: seriesId,
          series_index: index,
          is_recurring: isRecurring,
          recurring_frequency: isRecurring ? recurringFrequency : null,
          status: 'published',
          attendee_count: 0,
          commission_rate: 0.05,
        }
      })

      const { data: newEvents, error: insertError } = await supabase
        .from('events')
        .insert(eventPayloads)
        .select()

      if (insertError) {
        toast.error('Could not publish: ' + insertError.message)
        return
      }

      // Save ticket types for ticketed events
      if (isTicketed && newEvents && newEvents.length > 0) {
        const ticketTypeRows = ticketTypes
          .filter(t => t.name && t.price)
          .map(t => ({
            event_id: newEvents[0].id,
            name: t.name,
            description: t.description || null,
            price: parseFloat(t.price) || 0,
            capacity: t.capacity ? parseInt(t.capacity) : null,
          }))
        if (ticketTypeRows.length > 0) {
          await supabase.from('event_ticket_types').insert(ticketTypeRows)
        }
      }

      // Self-notification (best-effort)
      try {
        await supabase.rpc('send_notification', {
          p_user_id: userId,
          p_type: 'event_published',
          p_title: 'Your event is live!',
          p_body: `${title} is now visible on the map`,
          p_data: { event_id: newEvents?.[0]?.id }
        })
      } catch {
        // ignore notification errors
      }

      const dateLabel = validDatesList.length === 1
        ? `on ${format(new Date(validDatesList[0].date), 'd MMM yyyy')}`
        : `across ${validDatesList.length} dates`

      toast.success(`Event published ${dateLabel}! 🎉`)
      navigate('/', {
        replace: true,
        state: {
          refreshMap: true,
          centerOn: { lat: locationLat, lng: locationLng }
        }
      })

    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      clearTimeout(publishTimeout)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerSelect} />
      <input ref={photosInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosSelect} />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton />
          <h1 className="text-lg font-bold">Add Event</h1>
        </div>
      </div>

      {/* Scroll area */}
      <div className="px-4 pb-28 space-y-4 pt-4">

        {/* SECTION 1 — Event details */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Event Details</h2>
          </div>

          {/* Banner */}
          {bannerPreview ? (
            <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4">
              <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
              <button onClick={() => { URL.revokeObjectURL(bannerPreview); setBannerPreview(null); setBannerFile(null) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-card/90 text-xs font-medium border border-border/50">
                Change
              </button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-events/50 transition-colors bg-muted/20 mb-4">
              <ImagePlus className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload banner image</span>
              <span className="text-xs text-muted-foreground/60">Recommended 16:9</span>
            </button>
          )}

          {/* Additional photos */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Additional photos (max 10)</p>
            <div className="flex flex-wrap gap-2">
              {photoPreviews.map((preview, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <img src={preview} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photoPreviews.length < 10 && (
                <button onClick={() => photosInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-events/50 transition-colors bg-muted/20">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">Event Name *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Monthly Porsche Meet"
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Description * (min 15 words)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell people what to expect at your event..."
              rows={4}
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {description.trim().split(/\s+/).filter(Boolean).length} / 15 words minimum
            </p>
          </div>
        </div>

        {/* SECTION 2 — Event type */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Event Type *</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setEventTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  eventTypes.includes(type)
                    ? 'bg-events text-events-foreground border-events'
                    : 'bg-muted/50 text-muted-foreground border-border/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3 — Vehicle focus */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Vehicle Focus *</h2>
          </div>
          <div className="space-y-2">
            {VEHICLE_FOCUS_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setVehicleFocus(opt.id as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  vehicleFocus === opt.id
                    ? 'bg-events/10 border-events'
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  vehicleFocus === opt.id ? 'bg-events border-events' : 'border-muted-foreground'
                }`} />
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Specific makes picker */}
          {vehicleFocus === 'specific_makes' && (
            <div className="mt-4" ref={makeSearchRef}>
              {specificMakes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {specificMakes.map(make => (
                    <span key={make} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-events/15 text-events text-xs font-semibold border border-events/30">
                      {make}
                      <button onClick={() => setSpecificMakes(prev => prev.filter(m => m !== make))}
                        className="w-4 h-4 rounded-full bg-events/20 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  value={makeSearch}
                  onChange={e => { setMakeSearch(e.target.value); setShowMakeSuggestions(true) }}
                  onFocus={() => setShowMakeSuggestions(true)}
                  placeholder="Search vehicle make e.g. Porsche..."
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background"
                />
                {showMakeSuggestions && filteredMakes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-1 z-50 max-h-48 overflow-y-auto shadow-lg">
                    {filteredMakes.filter(m => !specificMakes.includes(m.name)).map(make => (
                      <button
                        key={make.id}
                        onClick={() => {
                          setSpecificMakes(prev => [...prev, make.name])
                          setMakeSearch('')
                          setShowMakeSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none"
                      >
                        <span className="font-medium">{make.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{make.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4 — Meet style tags */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Meet Style <span className="text-muted-foreground text-sm font-normal">(optional)</span></h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">What best describes this event? Select all that apply.</p>
          <div className="flex flex-wrap gap-2">
            {MEET_STYLE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setMeetStyleTags(prev =>
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  meetStyleTags.includes(tag)
                    ? 'bg-events text-events-foreground border-events'
                    : 'bg-muted/50 text-muted-foreground border-border/50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 5 — Dates and times */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-events" />
              </div>
              <h2 className="text-base font-bold">Dates & Times *</h2>
            </div>
            <button
              onClick={addDate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-events/10 text-events text-xs font-semibold border border-events/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Date
            </button>
          </div>

          <div className="space-y-3">
            {dates.map((d, index) => (
              <div key={d.id} className="p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Date {index + 1}</span>
                  {dates.length > 1 && (
                    <button onClick={() => removeDate(d.id)} className="text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={d.date}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => updateDate(d.id, 'date', e.target.value)}
                  className="w-full border border-border/50 rounded-lg px-3 py-2 text-sm bg-background mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Start time</label>
                    <input
                      type="time"
                      value={d.startTime}
                      onChange={e => updateDate(d.id, 'startTime', e.target.value)}
                      className="w-full border border-border/50 rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">End time</label>
                    <input
                      type="time"
                      value={d.endTime}
                      onChange={e => updateDate(d.id, 'endTime', e.target.value)}
                      className="w-full border border-border/50 rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recurring toggle */}
          <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium">Recurring event</p>
                <p className="text-[10px] text-muted-foreground">Auto-generate multiple dates</p>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>
            {isRecurring && (
              <div className="space-y-3 mt-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Frequency</label>
                  <div className="flex gap-2">
                    {(['weekly', 'fortnightly', 'monthly'] as const).map(freq => (
                      <button
                        key={freq}
                        onClick={() => setRecurringFrequency(freq)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                          recurringFrequency === freq
                            ? 'bg-events text-events-foreground border-events'
                            : 'bg-muted/50 text-muted-foreground border-border/50'
                        }`}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Number of dates: {recurringCount}</label>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={recurringCount}
                    onChange={e => setRecurringCount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={generateRecurringDates}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-events/10 text-events text-xs font-semibold border border-events/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate {recurringCount} dates
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6 — Location */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Location *</h2>
          </div>

          {/* Address search */}
          <div className="relative" ref={locationRef}>
            <input
              value={locationQuery}
              onChange={e => {
                setLocationQuery(e.target.value)
                setLocation(e.target.value)
                setLocationLat(null)
                setLocationLng(null)
              }}
              placeholder="Search for exact address or venue..."
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background pr-10"
            />
            {locationLat && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">✓</div>
            )}
            {locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-1 z-50 max-h-48 overflow-y-auto shadow-lg">
                {locationSuggestions.map((feature: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(feature)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none"
                  >
                    <p className="font-medium truncate">{feature.text}</p>
                    <p className="text-xs text-muted-foreground truncate">{feature.place_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected location display */}
          {locationLat && locationLng && (
            <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-300 flex-1 truncate">{location}</p>
              <button
                onClick={() => { setLocation(''); setLocationQuery(''); setLocationLat(null); setLocationLng(null) }}
                className="text-green-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Pick on map button */}
          <button
            onClick={() => setShowMapPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/50 bg-muted/30 text-sm font-medium text-muted-foreground hover:border-events/50 transition-colors mt-3"
          >
            <Map className="w-4 h-4" />
            {locationLat ? 'Move pin on map' : 'Pick location on map'}
          </button>

          {/* What3Words */}
          <div className="mt-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">
              What3Words <span className="text-muted-foreground/60">(optional — precise meetup point)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-destructive font-bold text-sm">///</span>
              <input
                value={what3words}
                onChange={e => setWhat3words(e.target.value.replace(/^\/\/\//, ''))}
                placeholder="word.word.word"
                className="w-full border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm bg-background"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Find yours at what3words.com</p>
          </div>
        </div>

        {/* Map picker modal */}
        {showMapPicker && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 safe-top">
              <button
                onClick={() => setShowMapPicker(false)}
                className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <p className="text-sm font-bold">Pick Location</p>
                <p className="text-[10px] text-muted-foreground">Tap anywhere on the map to set location</p>
              </div>
              {locationLat && (
                <button
                  onClick={() => setShowMapPicker(false)}
                  className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold"
                >
                  Confirm
                </button>
              )}
            </div>

            <div ref={mapPickerRef} className="w-full h-full" />

            {locationLat && location && (
              <div className="absolute bottom-6 left-4 right-4 z-10 bg-card/95 backdrop-blur-xl rounded-2xl p-4 border border-border/50 shadow-lg safe-bottom">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-events flex-shrink-0" />
                  <p className="text-sm font-medium truncate">{location}</p>
                </div>
                <button
                  onClick={() => setShowMapPicker(false)}
                  className="w-full mt-2 py-3 rounded-xl bg-events text-events-foreground font-semibold text-sm"
                >
                  Use this location
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION 7 — Capacity */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Capacity *</h2>
          </div>

          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">Max attendees</label>
            <input
              type="number"
              value={maxAttendees}
              onChange={e => setMaxAttendees(e.target.value)}
              placeholder="e.g. 100"
              className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mb-2">
            <div>
              <p className="text-xs font-medium">First come first served</p>
              <p className="text-[10px] text-muted-foreground">Places given in order of attendance</p>
            </div>
            <Switch checked={firstComeFirstServe} onCheckedChange={setFirstComeFirstServe} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
            <div>
              <p className="text-xs font-medium">Enable waitlist</p>
              <p className="text-[10px] text-muted-foreground">Users join a waitlist when event is full</p>
            </div>
            <Switch checked={waitlistEnabled} onCheckedChange={setWaitlistEnabled} />
          </div>
        </div>

        {/* SECTION 8 — Tickets */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Tickets</h2>
          </div>

          {/* Ticketing toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mb-3">
            <div>
              <p className="text-xs font-medium">Sell tickets through RevNet</p>
              <p className="text-[10px] text-muted-foreground">Attendees buy tickets in the app</p>
            </div>
            <Switch checked={isTicketed} onCheckedChange={setIsTicketed} />
          </div>

          {isTicketed && (
            <div className="space-y-3">
              {!hasStripeConnect && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">Connect bank account to receive payments</p>
                  <button
                    onClick={async () => {
                      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account')
                      if (error || !data?.url) { toast.error('Could not start setup'); return }
                      window.open(data.url, '_blank')
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-medium text-amber-800 dark:text-amber-200"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Connect Bank Account
                  </button>
                </div>
              )}

              {/* Ticket Types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Ticket Types</label>
                  <button
                    type="button"
                    onClick={() => setTicketTypes(prev => [...prev, { name: '', description: '', price: '', capacity: '' }])}
                    className="text-xs font-medium"
                    style={{ color: '#d30d37' }}
                  >+ Add Ticket Type</button>
                </div>
                {ticketTypes.map((tt, i) => (
                  <div key={i} className="p-3 rounded-xl border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Ticket {i + 1}</span>
                      {ticketTypes.length > 1 && (
                        <button type="button" onClick={() => setTicketTypes(prev => prev.filter((_, idx) => idx !== i))} className="text-xs text-destructive">Remove</button>
                      )}
                    </div>
                    <input value={tt.name} onChange={e => { const v = [...ticketTypes]; v[i] = { ...v[i], name: e.target.value }; setTicketTypes(v); }}
                      placeholder="e.g. General Admission" className="w-full border border-border/50 rounded-lg px-3 py-2 text-sm bg-background" />
                    <input value={tt.description} onChange={e => { const v = [...ticketTypes]; v[i] = { ...v[i], description: e.target.value }; setTicketTypes(v); }}
                      placeholder="Description (optional)" className="w-full border border-border/50 rounded-lg px-3 py-2 text-sm bg-background" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={tt.price} onChange={e => { const v = [...ticketTypes]; v[i] = { ...v[i], price: e.target.value }; setTicketTypes(v); setTicketPrice(e.target.value); }}
                        placeholder="Price £" min="1" className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-background" />
                      <input type="number" value={tt.capacity} onChange={e => { const v = [...ticketTypes]; v[i] = { ...v[i], capacity: e.target.value }; setTicketTypes(v); }}
                        placeholder="Capacity" className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-background" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 9 — Event rules */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Event Rules <span className="text-muted-foreground text-sm font-normal">(optional)</span></h2>
          </div>
          <textarea
            value={eventRules}
            onChange={e => setEventRules(e.target.value)}
            placeholder="e.g. No loud exhausts after 8pm, clean cars only, no burnouts, respect the venue..."
            rows={3}
            className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background resize-none"
          />
        </div>

        {/* SECTION 10 — Visibility */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Visibility *</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'public' as const, label: 'Public', sub: 'Everyone', icon: Globe },
              { value: 'club' as const, label: 'Club', sub: 'Club members', icon: UsersRound },
              { value: 'friends' as const, label: 'Friends', sub: 'Your friends', icon: Users },
            ]).map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    visibility === opt.value
                      ? 'bg-events/10 border-events'
                      : 'bg-muted/30 border-border/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${visibility === opt.value ? 'text-events' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.sub}</p>
                </button>
              )
            })}
          </div>

          {/* Club selection */}
          {visibility === 'club' && (
            <div className="mt-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Select club *</label>
              {myOwnedClubs.length === 0 ? (
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">You need to be a club owner or admin to post club events</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myOwnedClubs.map(club => (
                    <button
                      key={club.id}
                      onClick={() => setClubId(club.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        clubId === club.id ? 'bg-events/10 border-events' : 'bg-muted/30 border-border/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {club.logo_url ? (
                          <img src={club.logo_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-clubs to-clubs/60 flex items-center justify-center text-white font-bold text-xs">
                            {club.name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium flex-1 text-left">{club.name}</p>
                      <div className={`w-4 h-4 rounded-full border-2 ${clubId === club.id ? 'bg-events border-events' : 'border-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friends selection */}
          {visibility === 'friends' && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFriendsMode('all')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    friendsMode === 'all' ? 'bg-foreground text-background border-foreground' : 'bg-muted/30 border-border/50 text-muted-foreground'
                  }`}
                >
                  All friends
                </button>
                <button
                  onClick={() => setFriendsMode('specific')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    friendsMode === 'specific' ? 'bg-foreground text-background border-foreground' : 'bg-muted/30 border-border/50 text-muted-foreground'
                  }`}
                >
                  Specific friends
                </button>
              </div>

              {friendsMode === 'specific' && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allFriends.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No friends yet</p>
                  ) : (
                    allFriends.map((friend: any) => (
                      <button
                        key={friend.id}
                        onClick={() => setSelectedFriends(prev =>
                          prev.includes(friend.id) ? prev.filter((id: string) => id !== friend.id) : [...prev, friend.id]
                        )}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          selectedFriends.includes(friend.id) ? 'bg-events/10 border-events' : 'bg-muted/30 border-border/30'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {(friend.display_name || friend.username || '?')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium flex-1 text-left">{friend.display_name || friend.username}</p>
                        <div className={`w-4 h-4 rounded-full border-2 ${selectedFriends.includes(friend.id) ? 'bg-events border-events' : 'border-muted-foreground'}`} />
                      </button>
                    ))
                  )}
                </div>
              )}

              {friendsMode === 'specific' && selectedFriends.length > 0 && (
                <p className="text-xs text-muted-foreground">{selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
          )}
        </div>

        {/* Cost summary */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-base font-bold">Publishing Summary</h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dates to publish</span>
              <span className="font-medium">{dateCount}</span>
            </div>
            {!isPaidPlan && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Free credits available</span>
                  <span className="font-medium">{userCredits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credits used</span>
                  <span className="font-medium text-green-600">{creditsToUse} free</span>
                </div>
                {datesToPay > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Additional cost</span>
                    <span className="font-medium text-red-500">£{totalCost.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
            {isPaidPlan && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pro plan</span>
                <span className="font-medium text-green-600">Unlimited — included</span>
              </div>
            )}
            <div className="border-t border-border/30 pt-2 flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{isPaidPlan || datesToPay === 0 ? 'Free' : `£${totalCost.toFixed(2)}`}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky publish button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            onClick={handlePublish}
            disabled={saving}
            className="w-full bg-events hover:bg-events/90 text-events-foreground h-12 text-base font-semibold rounded-2xl"
          >
            {saving ? 'Publishing...' : dateCount > 1 ? `Publish ${dateCount} Events` : 'Publish Event'}
          </Button>
        </div>
      </div>

      <CreationPaywallSheet
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        type="event"
      />
    </div>
  )
}

export default AddEvent
