import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  { id: 'specific_makes', label: 'Specific Brand', sub: 'Choose which brands are welcome' },
  { id: 'event_style', label: 'Event Style', sub: 'Choose the style of your event' },
  { id: 'vehicle_era', label: 'Vehicle Era', sub: 'Select vehicle era' },
]

const AddEvent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEdit = !!editId
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEdit)
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
  const [vehicleFocus, setVehicleFocus] = useState<string>('all_welcome')
  const [specificMakes, setSpecificMakes] = useState<string[]>([])
  const [makeSearch, setMakeSearch] = useState('')
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false)

  // Section 4 — Meet style tags
  const [meetStyleTags, setMeetStyleTags] = useState<string[]>([])
  const [meetStyleSearch, setMeetStyleSearch] = useState('')
  const [specificYears, setSpecificYears] = useState<string[]>([])
  const [yearSearch, setYearSearch] = useState('')

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

  // Section 7 — Attendance & Entry
  const [unlimitedSpaces, setUnlimitedSpaces] = useState(true)
  const [maxAttendees, setMaxAttendees] = useState('')
  const [waitlistEnabled, setWaitlistEnabled] = useState(false)
  const [entryType, setEntryType] = useState<'free' | 'ticketed'>('free')
  const [ticketPrice, setTicketPrice] = useState('')
  const [ticketTypes, setTicketTypes] = useState([{ name: 'General Admission', description: '', price: '', capacity: '' }])

  // Section 9 — Rules
  const [eventRules, setEventRules] = useState('')

  // Section 10 — Visibility
  const [visibility, setVisibility] = useState<'public' | 'club' | 'friends'>('public')
  const [clubId, setClubId] = useState('')

  // Load user data on mount
  // Load existing event data for edit mode
  useEffect(() => {
    if (!editId || !user?.id) { setIsLoadingEdit(false); return; }
    (async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', editId).single();
      if (error || !data) { toast.error('Event not found'); navigate('/my-events'); return; }
      if (data.created_by !== user.id) { toast.error('Cannot edit this event'); navigate('/my-events'); return; }
      setTitle(data.title || '');
      setDescription(data.description || '');
      if (data.banner_url) setBannerPreview(data.banner_url);
      setEventTypes(data.event_types?.length ? data.event_types : data.type ? [data.type] : []);
      setVehicleFocus(data.vehicle_focus || 'all_welcome');
      setSpecificMakes(data.vehicle_brands || []);
      setMeetStyleTags(data.meet_style_tags || []);
      setSpecificYears(data.specific_years || []);
      setLocation(data.location || '');
      setLocationLat(data.lat ? Number(data.lat) : null);
      setLocationLng(data.lng ? Number(data.lng) : null);
      setWhat3words(data.what3words || '');
      setUnlimitedSpaces(!data.max_attendees);
      setMaxAttendees(data.max_attendees ? String(data.max_attendees) : '');
      setWaitlistEnabled(data.waitlist_enabled || false);
      setEntryType(data.is_ticketed ? 'ticketed' : 'free');
      setEventRules(data.event_rules || '');
      setVisibility((data.visibility as any) || 'public');
      if (data.date_start) {
        const s = new Date(data.date_start);
        setDates([{ id: crypto.randomUUID(), date: s.toISOString().split('T')[0], startTime: s.toTimeString().slice(0,5), endTime: data.date_end ? new Date(data.date_end).toTimeString().slice(0,5) : '14:00' }]);
      }
      setIsLoadingEdit(false);
    })();
  }, [editId, user?.id]);

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

  // Upload helpers removed — inlined in handlePublish for better error control

  // Validation
  const validate = (): boolean => {
    console.log('validate called', { title, description: description.trim().split(/\s+/).length, eventTypes, location, locationLat, locationLng, dates, unlimitedSpaces, maxAttendees, entryType })
    if (!title.trim()) { console.log('FAIL: no title'); toast.error('Please enter an event name'); return false }
    if (!description.trim() || description.trim().split(/\s+/).length < 15) {
      console.log('FAIL: description too short'); toast.error('Description must be at least 15 words'); return false
    }
    if (eventTypes.length === 0) { console.log('FAIL: no event types'); toast.error('Please select at least one event type'); return false }
    if (!location.trim()) { console.log('FAIL: no location'); toast.error('Please enter a location'); return false }
    if (!locationLat || !locationLng) { console.log('FAIL: no lat/lng'); toast.error('Please select a location from the dropdown'); return false }
    const validDatesList = dates.filter(d => d.date)
    if (validDatesList.length === 0) { console.log('FAIL: no dates'); toast.error('Please add at least one date'); return false }
    if (!unlimitedSpaces && !maxAttendees) { console.log('FAIL: no max attendees'); toast.error('Please enter max attendees or enable unlimited spaces'); return false }
    if (entryType === 'ticketed' && (!ticketPrice || Number(ticketPrice) < 1)) {
      console.log('FAIL: ticket price'); toast.error('Minimum ticket price is £1.00'); return false
    }
    if (entryType === 'ticketed' && !hasStripeConnect) {
      console.log('FAIL: no stripe'); toast.error('Please connect your bank account to sell tickets'); return false
    }
    if (visibility === 'club' && !clubId) {
      console.log('FAIL: no club'); toast.error('Please select a club'); return false
    }
    console.log('validation passed')
    return true
  }

  // Main publish handler — no timeout, explicit error handling at every step
  const handlePublish = async () => {
    console.log('handlePublish start')
    if (!validate()) { console.log('validation failed'); return }
    if (!user?.id) { toast.error('Please sign in'); return }

    setSaving(true)

    try {
      // Get session — use getSession (fast) not refreshSession (can hang)
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id || user.id
      console.log('userId:', userId)

      // Upload banner if new file selected
      let bannerUrl: string | null = null
      if (bannerFile) {
        console.log('uploading banner...')
        const ext = bannerFile.name.split('.').pop() || 'jpg'
        const path = `${userId}/${Date.now()}-banner.${ext}`
        const { error: bannerErr } = await supabase.storage.from('events').upload(path, bannerFile, { upsert: true, contentType: bannerFile.type || 'image/heic' })
        if (bannerErr) {
          console.error('banner upload error:', bannerErr)
          toast.error('Banner upload failed: ' + bannerErr.message)
        } else {
          const { data: bu } = supabase.storage.from('events').getPublicUrl(path)
          bannerUrl = bu.publicUrl
          console.log('banner uploaded:', bannerUrl)
        }
      } else if (bannerPreview && bannerPreview.startsWith('http')) {
        bannerUrl = bannerPreview // existing banner from edit mode
      }

      // Upload additional photos
      const uploadedPhotoUrls: string[] = []
      for (const file of photoFiles) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: pe } = await supabase.storage.from('events').upload(path, file, { upsert: true, contentType: file.type || 'image/heic' })
        if (!pe) {
          const { data: pu } = supabase.storage.from('events').getPublicUrl(path)
          uploadedPhotoUrls.push(pu.publicUrl)
        } else {
          console.warn('photo upload failed:', pe.message)
        }
      }

      const validDates = dates.filter(d => d.date)
      console.log('validDates:', validDates.length)

      // Edit mode — UPDATE existing event
      if (isEdit && editId) {
        console.log('updating event:', editId)
        const d = validDates[0] || dates[0]
        const dateStart = d?.date ? new Date(`${d.date}T${d.startTime || '10:00'}`) : null
        const dateEnd = d?.date && d.endTime ? new Date(`${d.date}T${d.endTime}`) : null

        const { error: updateError } = await supabase.from('events').update({
          title: title.trim(), description: description.trim(), banner_url: bannerUrl || null,
          photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : undefined,
          type: eventTypes[0] || '', event_types: eventTypes, vehicle_focus: vehicleFocus,
          vehicle_brands: vehicleFocus === 'specific_makes' ? specificMakes : [],
          meet_style_tags: meetStyleTags, specific_years: specificYears,
          location: location.trim(), lat: locationLat, lng: locationLng,
          what3words: what3words.trim() || null,
          max_attendees: unlimitedSpaces ? null : (maxAttendees ? Number(maxAttendees) : null),
          waitlist_enabled: unlimitedSpaces ? false : waitlistEnabled,
          is_free: entryType === 'free', is_ticketed: entryType === 'ticketed',
          entry_fee: 0, ticket_price: entryType === 'ticketed' ? Number(ticketPrice) : 0,
          event_rules: eventRules.trim() || null, visibility,
          date_start: dateStart?.toISOString() || null, date_end: dateEnd?.toISOString() || null,
        }).eq('id', editId).eq('created_by', userId)

        if (updateError) {
          console.error('update error:', updateError)
          toast.error('Failed to update: ' + updateError.message)
          setSaving(false)
          return
        }

        toast.success('Event updated!')
        navigate('/my-events')
        setSaving(false)
        return
      }

      // CREATE new event(s)
      console.log('creating', validDates.length, 'event(s)...')

      const eventPayloads = validDates.map(d => ({
        created_by: userId,
        title: title.trim(), description: description.trim(),
        banner_url: bannerUrl || null,
        photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : [],
        type: eventTypes[0] || '', event_types: eventTypes,
        vehicle_focus: vehicleFocus,
        vehicle_brands: vehicleFocus === 'specific_makes' ? specificMakes : [],
        meet_style_tags: meetStyleTags, specific_years: specificYears,
        location: location.trim(), lat: locationLat, lng: locationLng,
        what3words: what3words.trim() || null,
        max_attendees: unlimitedSpaces ? null : (maxAttendees ? Number(maxAttendees) : null),
        waitlist_enabled: unlimitedSpaces ? false : waitlistEnabled,
        is_free: entryType === 'free', is_ticketed: entryType === 'ticketed',
        entry_fee: 0,
        ticket_price: entryType === 'ticketed' ? Number(ticketPrice) : 0,
        event_rules: eventRules.trim() || null, visibility,
        status: 'published', attendee_count: 0,
        date_start: new Date(`${d.date}T${d.startTime || '10:00'}`).toISOString(),
        date_end: new Date(`${d.date}T${d.endTime || '12:00'}`).toISOString(),
        club_id: visibility === 'club' ? clubId : null,
      }))

      const { data: newEvents, error: insertError } = await supabase
        .from('events').insert(eventPayloads).select()

      console.log('insert result:', { count: newEvents?.length, insertError })

      if (insertError) {
        console.error('insert error:', insertError)
        toast.error('Failed to publish: ' + insertError.message)
        setSaving(false)
        return
      }

      // Save ticket types (non-blocking)
      if (entryType === 'ticketed' && newEvents && newEvents.length > 0) {
        const ticketRows = ticketTypes.filter(t => t.name && t.price).flatMap(t =>
          newEvents.map(ev => ({
            event_id: ev.id, name: t.name, description: t.description || null,
            price: Number(t.price), capacity: t.capacity ? Number(t.capacity) : null,
          }))
        )
        if (ticketRows.length > 0) {
          supabase.from('event_ticket_types').insert(ticketRows).then(({ error: te }) => {
            if (te) console.warn('ticket types error:', te.message)
          })
        }
      }

      // Non-blocking notification — fire and forget
      supabase.rpc('send_notification', {
        p_user_id: userId, p_type: 'event_published',
        p_title: 'Your event is live!',
        p_body: `${title} is now visible on the map`,
        p_data: { event_id: newEvents?.[0]?.id }
      }).then(() => {}).catch(() => {})

      console.log('publish complete')
      toast.success(validDates.length > 1 ? `${validDates.length} events published!` : 'Event published!')
      navigate('/', { replace: true, state: { refreshMap: true } })

    } catch (err: any) {
      console.error('handlePublish error:', err)
      toast.error(err?.message || 'Failed to publish event')
    } finally {
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
          <h1 className="text-lg font-bold">{isEdit ? 'Edit Event' : 'Add Event'}</h1>
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

          {/* Banner — 9:16 portrait ratio */}
          <div
            style={{ aspectRatio: '9/16', maxHeight: '400px', width: '100%', maxWidth: '225px', margin: '0 auto' }}
            className="relative rounded-2xl overflow-hidden bg-muted/20 border-2 border-dashed border-border/50 cursor-pointer mb-4"
            onClick={() => fileInputRef.current?.click()}
          >
            {bannerPreview ? (
              <>
                <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
                <button onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(bannerPreview); setBannerPreview(null); setBannerFile(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ImagePlus className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground text-center px-4">Add event banner photo</p>
                <p className="text-[10px] text-muted-foreground/60">Portrait format (9:16)</p>
              </div>
            )}
          </div>

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
          <div className="grid grid-cols-2 gap-2">
            {VEHICLE_FOCUS_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setVehicleFocus(vehicleFocus === opt.id ? 'all_welcome' : opt.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                  vehicleFocus === opt.id
                    ? 'bg-events/10 border-events'
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{opt.sub}</p>
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

          {/* Event Style picker */}
          {vehicleFocus === 'event_style' && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-foreground">Event Style</p>
              {meetStyleTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {meetStyleTags.map(tag => (
                    <button key={tag} onClick={() => setMeetStyleTags(prev => prev.filter(t => t !== tag))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-events text-events-foreground text-xs font-semibold">
                      {tag} <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <input type="text" placeholder="Search event styles..." value={meetStyleSearch} onChange={e => setMeetStyleSearch(e.target.value)}
                  className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-background" />
                {meetStyleSearch && (
                  <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-1 z-50 max-h-48 overflow-y-auto shadow-lg">
                    {MEET_STYLE_TAGS.filter(tag => !meetStyleTags.includes(tag)).filter(tag => tag.toLowerCase().includes(meetStyleSearch.toLowerCase())).map(tag => (
                      <button key={tag} onClick={() => { setMeetStyleTags(prev => [...prev, tag]); setMeetStyleSearch(''); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none">{tag}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vehicle Era picker */}
          {vehicleFocus === 'vehicle_era' && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-foreground">Vehicle Era</p>
              {specificYears.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {specificYears.map(y => (
                    <button key={y} onClick={() => setSpecificYears(prev => prev.filter(x => x !== y))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-events text-events-foreground text-xs font-semibold">
                      {y} <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <input type="text" placeholder="Search vehicle era..." value={yearSearch} onChange={e => setYearSearch(e.target.value)}
                  className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-background" />
                {yearSearch && (
                  <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-1 z-50 max-h-48 overflow-y-auto shadow-lg">
                    {['Pre 50s', 'Pre 60s', 'Pre 70s', 'Pre 80s', 'Pre 90s', 'Pre 00s'].filter(y => !specificYears.includes(y)).filter(y => y.toLowerCase().includes(yearSearch.toLowerCase())).map(y => (
                      <button key={y} onClick={() => { setSpecificYears(prev => [...prev, y]); setYearSearch(''); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 border-b border-border/30 last:border-none">{y}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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

        {/* SECTION 7 — Attendance & Entry */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-events/10 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-events" />
            </div>
            <h2 className="text-base font-bold">Attendance & Entry</h2>
          </div>

          {/* Entry type cards */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button type="button" onClick={() => setEntryType('free')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${entryType === 'free' ? 'bg-events/10 border-events' : 'bg-muted/30 border-border/50'}`}>
              <p className="text-xs font-semibold">Free Event</p>
              <p className="text-[9px] text-muted-foreground">Free to attend</p>
            </button>
            <button type="button" onClick={() => setEntryType('ticketed')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${entryType === 'ticketed' ? 'bg-events/10 border-events' : 'bg-muted/30 border-border/50'}`}>
              <p className="text-xs font-semibold">Ticketed Event</p>
              <p className="text-[9px] text-muted-foreground">Sell tickets via RevNet</p>
            </button>
          </div>

          {/* Unlimited spaces toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mb-3">
            <div>
              <p className="text-xs font-medium">Unlimited spaces</p>
              <p className="text-[10px] text-muted-foreground">No cap on attendance</p>
            </div>
            <Switch checked={unlimitedSpaces} onCheckedChange={(checked) => { setUnlimitedSpaces(checked); if (checked) { setMaxAttendees(''); setWaitlistEnabled(false); } }} />
          </div>

          {/* Max attendees — only when unlimited is OFF */}
          {!unlimitedSpaces && (
            <>
              <div className="mb-3">
                <label className="text-xs text-muted-foreground mb-1.5 block">Max attendees</label>
                <input type="number" value={maxAttendees} onChange={e => setMaxAttendees(e.target.value)}
                  placeholder="e.g. 100" min="1" className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background" />
              </div>
              {maxAttendees && Number(maxAttendees) > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mb-3">
                  <div>
                    <p className="text-xs font-medium">Enable waitlist</p>
                    <p className="text-[10px] text-muted-foreground">Users join waitlist when full</p>
                  </div>
                  <Switch checked={waitlistEnabled} onCheckedChange={setWaitlistEnabled} />
                </div>
              )}
            </>
          )}

          {/* Ticketed section */}
          {entryType === 'ticketed' && (
            <div className="space-y-3 mt-2">
              {!hasStripeConnect && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">Connect bank account to receive payments</p>
                  <button type="button" onClick={async () => {
                    const { data, error } = await supabase.functions.invoke('create-stripe-connect-account')
                    if (error || !data?.url) { toast.error('Could not start setup'); return }
                    window.open(data.url, '_blank')
                  }} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-medium text-amber-800 dark:text-amber-200">
                    <CreditCard className="w-3.5 h-3.5" /> Connect Bank Account
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Ticket Types</label>
                <button type="button" onClick={() => setTicketTypes(prev => [...prev, { name: '', description: '', price: '', capacity: '' }])}
                  className="text-xs font-medium" style={{ color: '#d30d37' }}>+ Add Ticket Type</button>
              </div>
              {ticketTypes.map((tt, i) => (
                <div key={i} className="p-3 rounded-xl border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Ticket {i + 1}</span>
                    {ticketTypes.length > 1 && <button type="button" onClick={() => setTicketTypes(prev => prev.filter((_, idx) => idx !== i))} className="text-xs text-destructive">Remove</button>}
                  </div>
                  <input value={tt.name} onChange={e => { const v = [...ticketTypes]; v[i] = { ...v[i], name: e.target.value }; setTicketTypes(v); }}
                    placeholder="e.g. General Admission" className="w-full border border-border/50 rounded-lg px-3 py-2 text-sm bg-background" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={tt.price} onChange={e => { const v = [...ticketTypes]; v[i] = { ...v[i], price: e.target.value }; setTicketTypes(v); setTicketPrice(e.target.value); }}
                      placeholder="Price £" min="1" className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-background" />
                    <input type="number" value={tt.capacity} onChange={e => { const v = [...ticketTypes]; v[i] = { ...v[i], capacity: e.target.value }; setTicketTypes(v); }}
                      placeholder="Capacity" className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-background" />
                  </div>
                </div>
              ))}
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
            {saving ? (isEdit ? 'Saving...' : 'Publishing...') : isEdit ? 'Save Changes' : dateCount > 1 ? `Publish ${dateCount} Events` : 'Publish Event'}
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
