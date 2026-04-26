import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import BackButton from '@/components/BackButton'
import { ChevronRight, ImagePlus, X } from 'lucide-react'
import { validateImageFile } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const CLUB_TYPES = [
  { id: 'make_model', label: 'Make & Model', description: 'Porsche, BMW M, Honda Type R...', emoji: '🏎' },
  { id: 'regional', label: 'Regional', description: 'South West Meets, London Cruisers...', emoji: '📍' },
  { id: 'track_racing', label: 'Track & Racing', description: 'Track days, motorsport, time attack...', emoji: '🏁' },
  { id: 'off_road', label: 'Off Road', description: '4x4, overlanding, green lanes...', emoji: '🌿' },
  { id: 'classics', label: 'Classics & Vintage', description: 'Pre-2000, retro, restored vehicles...', emoji: '🏆' },
  { id: 'electric', label: 'Electric', description: 'EV owners and enthusiasts...', emoji: '⚡' },
  { id: 'motorcycles', label: 'Motorcycles', description: 'All two-wheeled enthusiasts...', emoji: '🏍' },
  { id: 'general', label: 'General', description: 'Open to all car and bike enthusiasts...', emoji: '🚗' },
]

const JOIN_MODES = [
  { id: 'auto', label: 'Open', description: 'Anyone can join instantly', emoji: '🌐' },
  { id: 'approval', label: 'Approval required', description: 'You approve join requests', emoji: '✅' },
  { id: 'invite_only', label: 'Invite only', description: 'Only joinable with invite code', emoji: '🔒' },
]

export default function AddClub() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1 — Basics
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [handleError, setHandleError] = useState('')
  const [description, setDescription] = useState('')
  const [clubType, setClubType] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Step 2 — Branding
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // Step 3 — Settings
  const [joinMode, setJoinMode] = useState('auto')
  const [postingPermissions, setPostingPermissions] = useState('any_member')
  const [location, setLocation] = useState('')
  const [rules, setRules] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')

  const generateHandle = (clubName: string) => {
    return clubName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 30)
  }

  const validateHandle = async (h: string) => {
    if (!h.trim()) { setHandleError('Handle is required'); return false }
    if (!/^[a-z0-9_]+$/.test(h)) { setHandleError('Only lowercase letters, numbers and underscores'); return false }
    const { data } = await supabase.from('clubs').select('id').eq('handle', h).maybeSingle()
    if (data) { setHandleError('This handle is already taken'); return false }
    setHandleError('')
    return true
  }

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop()
      const filePath = `${path}.${ext}`
      const { error } = await supabase.storage.from('clubs').upload(filePath, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(filePath)
      return publicUrl
    } catch { return null }
  }

  const handleCreate = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const handleValid = await validateHandle(handle)
      if (!handleValid) { setSaving(false); return }

      const [logoUrl, coverUrl] = await Promise.all([
        logoFile ? uploadImage(logoFile, `${user.id}/logo-${Date.now()}`) : Promise.resolve(null),
        coverFile ? uploadImage(coverFile, `${user.id}/cover-${Date.now()}`) : Promise.resolve(null),
      ])

      const { data: newClub, error } = await supabase
        .from('clubs')
        .insert({
          created_by: user.id,
          name: name.trim(),
          handle: handle.trim().toLowerCase(),
          description: description.trim() || null,
          club_type: clubType || 'general',
          tags,
          logo_url: logoUrl,
          cover_url: coverUrl,
          join_mode: joinMode,
          posting_permissions: postingPermissions,
          location: location.trim() || null,
          rules: rules.trim() ? rules.split('\n').filter(Boolean) : [],
          social_links: {
            instagram: instagram.trim() || null,
            facebook: facebook.trim() || null,
          },
          visibility: 'public',
          member_count: 0,
          post_count: 0,
        })
        .select()
        .single()

      if (error) {
        toast.error('Could not create club: ' + error.message)
        return
      }

      // Explicitly insert owner membership as a fallback in case the DB trigger is missing.
      // Idempotent via upsert on the (user_id, club_id) composite key.
      await supabase
        .from('club_memberships')
        .upsert({
          club_id: newClub.id,
          user_id: user!.id,
          role: 'owner',
        }, { onConflict: 'user_id,club_id' })

      toast.success(`${name} is live! 🎉`)
      navigate(`/club/${newClub.id}`, { replace: true })
    } catch (err: any) {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const canProceedStep1 = name.trim().length > 0 && handle.trim().length > 0 && clubType

  return (
    <div className="mobile-container bg-background min-h-dvh flex flex-col md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-10 h-10 rounded-xl bg-muted/80" iconClassName="w-4 h-4" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Create Club</h1>
            <p className="text-[10px] text-muted-foreground">Step {step} of 3</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-2 h-2 rounded-full transition-all ${s <= step ? 'bg-foreground' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      </div>

      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files?.[0]; if (!f) return
        const validationError = validateImageFile(f); if (validationError) { toast.error(validationError); e.target.value = ''; return }
        setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); e.target.value = ''
      }} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files?.[0]; if (!f) return
        const validationError = validateImageFile(f); if (validationError) { toast.error(validationError); e.target.value = ''; return }
        setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); e.target.value = ''
      }} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* STEP 1 — Basics */}
        {step === 1 && (
          <>
            <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
              <h2 className="font-bold text-base text-foreground">Club basics</h2>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Club name *</label>
                <input
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (!handle || handle === generateHandle(name)) {
                      setHandle(generateHandle(e.target.value))
                    }
                  }}
                  placeholder="e.g. Porsche Owners South West"
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Handle * (unique URL)</label>
                <div className="flex items-center border border-border/50 rounded-xl overflow-hidden bg-background">
                  <span className="px-3 py-3 text-sm text-muted-foreground bg-muted/50 border-r border-border/50">@</span>
                  <input
                    value={handle}
                    onChange={e => {
                      const h = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                      setHandle(h)
                      setHandleError('')
                    }}
                    onBlur={() => handle && validateHandle(handle)}
                    placeholder="porsche_sw"
                    className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none"
                  />
                </div>
                {handleError && <p className="text-xs text-destructive mt-1">{handleError}</p>}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is your club about? Who should join?"
                  rows={3}
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <h2 className="font-bold text-base mb-4 text-foreground">Club type *</h2>
              <div className="grid grid-cols-2 gap-2">
                {CLUB_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setClubType(type.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      clubType === type.id
                        ? 'bg-foreground/5 border-foreground'
                        : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.emoji}</div>
                    <p className="text-xs font-semibold text-foreground">{type.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <h2 className="font-bold text-base mb-3 text-foreground">Tags <span className="text-muted-foreground text-sm font-normal">(optional)</span></h2>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    {tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && tagInput.trim() && tags.length < 8) {
                      setTags(prev => [...prev, tagInput.trim()])
                      setTagInput('')
                    }
                  }}
                  placeholder="Add tag e.g. JDM, track, modified..."
                  className="flex-1 border border-border/50 rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => {
                    if (tagInput.trim() && tags.length < 8) {
                      setTags(prev => [...prev, tagInput.trim()])
                      setTagInput('')
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-muted text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 2 — Branding */}
        {step === 2 && (
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-5">
            <h2 className="font-bold text-base text-foreground">Club branding</h2>

            {/* Cover image */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Cover image</label>
              {coverPreview ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-border/50">
                  <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
                  <button
                    onClick={() => { URL.revokeObjectURL(coverPreview); setCoverPreview(null); setCoverFile(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-muted/20"
                >
                  <ImagePlus className="w-7 h-7 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload cover photo</span>
                </button>
              )}
            </div>

            {/* Logo */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Club logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border overflow-hidden bg-muted/20 flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-muted text-sm font-medium border border-border/50"
                  >
                    Upload logo
                  </button>
                  {logoPreview && (
                    <button
                      onClick={() => { URL.revokeObjectURL(logoPreview); setLogoPreview(null); setLogoFile(null) }}
                      className="block text-xs text-destructive"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Settings */}
        {step === 3 && (
          <>
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <h2 className="font-bold text-base mb-4 text-foreground">Join settings</h2>
              <div className="space-y-2">
                {JOIN_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setJoinMode(mode.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      joinMode === mode.id ? 'bg-foreground/5 border-foreground' : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <span className="text-xl">{mode.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </div>
                    <div className={`ml-auto w-4 h-4 rounded-full border-2 ${
                      joinMode === mode.id ? 'bg-foreground border-foreground' : 'border-muted-foreground'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
              <h2 className="font-bold text-base text-foreground">Extra details</h2>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Location / Region</label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Bristol, South West England"
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Club rules <span className="text-muted-foreground/60">(one per line)</span></label>
                <textarea
                  value={rules}
                  onChange={e => setRules(e.target.value)}
                  placeholder={"e.g. Respect all members\nNo selling in the main feed\nPhotos must be your own"}
                  rows={4}
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Instagram handle</label>
                <div className="flex items-center border border-border/50 rounded-xl overflow-hidden bg-background">
                  <span className="px-3 py-3 text-sm text-muted-foreground bg-muted/50 border-r border-border/50">@</span>
                  <input
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="yourclub"
                    className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Facebook page</label>
                <input
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                  placeholder="facebook.com/yourclub"
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 p-4 safe-bottom">
        <div className="space-y-2">
          {step < 3 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              disabled={step === 1 && !canProceedStep1}
              className="w-full h-13 bg-foreground text-background rounded-2xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ height: 52 }}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={saving || !canProceedStep1}
              className="w-full h-13 bg-foreground text-background rounded-2xl font-semibold text-base disabled:opacity-40"
              style={{ height: 52 }}
            >
              {saving ? 'Creating...' : 'Create Club 🎉'}
            </button>
          )}
          {step > 1 && (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="w-full mt-2 py-2.5 text-sm text-muted-foreground"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
