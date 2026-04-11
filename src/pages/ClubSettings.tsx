import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { validateImageFile } from '@/lib/utils'
import BackButton from '@/components/BackButton'
import { X, ImagePlus, RefreshCw, Crown, AlertTriangle } from 'lucide-react'

const CLUB_TYPES = [
  { id: 'make_model', label: 'Make & Model', emoji: '🏎' },
  { id: 'regional', label: 'Regional', emoji: '📍' },
  { id: 'track_racing', label: 'Track & Racing', emoji: '🏁' },
  { id: 'off_road', label: 'Off Road', emoji: '🌿' },
  { id: 'classics', label: 'Classics & Vintage', emoji: '🏆' },
  { id: 'electric', label: 'Electric', emoji: '⚡' },
  { id: 'motorcycles', label: 'Motorcycles', emoji: '🏍' },
  { id: 'general', label: 'General', emoji: '🚗' },
]

const JOIN_MODES = [
  { id: 'auto', label: 'Open', emoji: '🌐' },
  { id: 'approval', label: 'Approval required', emoji: '✅' },
  { id: 'invite_only', label: 'Invite only', emoji: '🔒' },
]

export default function ClubSettings() {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [joinRequests, setJoinRequests] = useState<any[]>([])
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clubType, setClubType] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [location, setLocation] = useState('')
  const [rules, setRules] = useState<string[]>([])
  const [ruleInput, setRuleInput] = useState('')
  const [joinMode, setJoinMode] = useState('auto')
  const [postingPermissions, setPostingPermissions] = useState('any_member')
  const [isPrivate, setIsPrivate] = useState(false)
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [joinQuestions, setJoinQuestions] = useState<string[]>([])
  const [questionInput, setQuestionInput] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [transferToUserId, setTransferToUserId] = useState('')

  useEffect(() => {
    loadClub()
    loadJoinRequests()
    loadBlockedUsers()
  }, [clubId])

  const loadClub = async () => {
    const { data } = await supabase
      .from('clubs')
      .select('*, club_memberships(user_id, role, profiles!user_id(id, username, display_name, avatar_url))')
      .eq('id', clubId!)
      .single()

    if (!data) { navigate(-1 as any); return }

    const isOwnerOrAdmin = data.club_memberships?.some(
      (m: any) => m.user_id === user?.id && ['owner', 'admin'].includes(m.role)
    )
    if (!isOwnerOrAdmin) { navigate(-1 as any); return }

    setClub(data)
    setName(data.name || '')
    setDescription(data.description || '')
    setClubType(data.club_type || 'general')
    setTags(data.tags || [])
    setLocation(data.location || '')
    const parsedRules = Array.isArray(data.rules) ? (data.rules as any[]).map((r: any) => typeof r === 'string' ? r : String(r)) : []
    setRules(parsedRules)
    setJoinMode(data.join_mode || 'auto')
    setPostingPermissions(data.posting_permissions || 'any_member')
    setIsPrivate(data.is_private || false)
    const socialLinks = typeof data.social_links === 'object' && data.social_links ? data.social_links as Record<string, any> : {}
    setInstagram(socialLinks.instagram || '')
    setFacebook(socialLinks.facebook || '')
    setJoinQuestions(data.join_questions || [])
    setLogoPreview(data.logo_url || null)
    setCoverPreview(data.cover_url || null)
    setMembers(data.club_memberships || [])
    setLoading(false)
  }

  const loadJoinRequests = async () => {
    const { data } = await supabase
      .from('club_join_requests')
      .select('*, profiles!user_id(id, username, display_name, avatar_url)')
      .eq('club_id', clubId!)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setJoinRequests(data || [])
  }

  const loadBlockedUsers = async () => {
    const { data: clubData } = await supabase
      .from('clubs')
      .select('blocked_users')
      .eq('id', clubId!)
      .single()

    if (clubData?.blocked_users?.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', clubData.blocked_users)
      setBlockedUsers(profiles || [])
    } else {
      setBlockedUsers([])
    }
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const [logoUrl, coverUrl] = await Promise.all([
        logoFile ? uploadImage(logoFile, `${clubId}/logo-${Date.now()}`) : Promise.resolve(club.logo_url),
        coverFile ? uploadImage(coverFile, `${clubId}/cover-${Date.now()}`) : Promise.resolve(club.cover_url),
      ])

      const { error } = await supabase
        .from('clubs')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          club_type: clubType,
          tags,
          location: location.trim() || null,
          rules: rules as any,
          join_mode: joinMode,
          posting_permissions: postingPermissions,
          is_private: isPrivate,
          social_links: {
            instagram: instagram.trim() || null,
            facebook: facebook.trim() || null,
          },
          join_questions: joinQuestions,
          logo_url: logoUrl,
          cover_url: coverUrl,
        })
        .eq('id', clubId!)

      if (error) throw error
      toast.success('Club updated!')
      loadClub()
    } catch {
      toast.error('Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    await supabase.rpc('approve_join_request', {
      p_request_id: requestId,
      p_admin_id: user?.id
    })
    toast.success('Request approved')
    loadJoinRequests()
  }

  const handleRejectRequest = async (requestId: string) => {
    await supabase.rpc('reject_join_request', {
      p_request_id: requestId,
      p_admin_id: user?.id,
      p_reason: rejectReason.trim() || null
    })
    setRejectingId(null)
    setRejectReason('')
    toast.success('Request rejected')
    loadJoinRequests()
  }

  const handleBlockUser = async (userId: string) => {
    await supabase.rpc('block_club_member', {
      p_club_id: clubId,
      p_admin_id: user?.id,
      p_user_id: userId
    })
    toast.success('User blocked')
    loadClub()
    loadBlockedUsers()
  }

  const handleUnblockUser = async (userId: string) => {
    await supabase
      .from('clubs')
      .update({
        blocked_users: (club.blocked_users || []).filter((id: string) => id !== userId)
      })
      .eq('id', clubId!)
    toast.success('User unblocked')
    loadBlockedUsers()
    loadClub()
  }

  const handleRemoveMember = async (userId: string) => {
    await supabase.from('club_memberships')
      .delete()
      .eq('club_id', clubId!)
      .eq('user_id', userId)
    await supabase.rpc('send_notification', {
      p_user_id: userId,
      p_type: 'club_removed',
      p_title: 'Removed from club',
      p_body: `You have been removed from ${club.name}`,
      p_data: { club_id: clubId }
    })
    toast.success('Member removed')
    loadClub()
  }

  const handlePromoteMember = async (userId: string, role: string) => {
    await supabase.from('club_memberships')
      .update({ role })
      .eq('club_id', clubId!)
      .eq('user_id', userId)
    await supabase.rpc('send_notification', {
      p_user_id: userId,
      p_type: 'club_role_changed',
      p_title: 'Role updated',
      p_body: `Your role in ${club.name} has been updated to ${role}`,
      p_data: { club_id: clubId }
    })
    toast.success('Role updated')
    loadClub()
  }

  const handleTransferOwnership = async () => {
    if (!transferToUserId) return
    await supabase.from('club_memberships')
      .update({ role: 'admin' })
      .eq('club_id', clubId!)
      .eq('user_id', user?.id!)
    await supabase.from('club_memberships')
      .update({ role: 'owner' })
      .eq('club_id', clubId!)
      .eq('user_id', transferToUserId)
    await supabase.rpc('send_notification', {
      p_user_id: transferToUserId,
      p_type: 'club_ownership',
      p_title: 'You are now the owner!',
      p_body: `Ownership of ${club.name} has been transferred to you`,
      p_data: { club_id: clubId }
    })
    toast.success('Ownership transferred')
    navigate(`/club/${clubId}`)
  }

  const handleRegenerateInviteCode = async () => {
    const newCode = Math.random().toString(36).slice(2, 10).toUpperCase()
    await supabase.from('clubs').update({ invite_code: newCode }).eq('id', clubId!)
    toast.success('Invite code regenerated')
    loadClub()
  }

  const handleDeleteClub = async () => {
    if (deleteConfirmText !== 'DELETE') return
    await supabase.from('clubs').delete().eq('id', clubId!)
    toast.success('Club deleted')
    navigate('/clubs', { replace: true })
  }

  const SECTIONS = [
    { id: 'general', label: 'General' },
    { id: 'branding', label: 'Branding' },
    { id: 'requests', label: `Requests${joinRequests.length > 0 ? ` (${joinRequests.length})` : ''}` },
    { id: 'members', label: 'Members' },
    { id: 'blocked', label: 'Blocked' },
    { id: 'danger', label: 'Danger Zone' },
  ]

  if (loading) return (
    <div className="mobile-container bg-background min-h-screen flex items-center justify-center md:max-w-2xl md:mx-auto">
      <div className="w-10 h-10 rounded-2xl bg-muted/50 animate-pulse" />
    </div>
  )

  return (
    <div className="mobile-container bg-background min-h-screen pb-24 md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" />
            <h1 className="text-lg font-bold text-foreground">Club Settings</h1>
          </div>
          {(activeSection === 'general' || activeSection === 'branding') && (
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40">
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {SECTIONS.map(section => (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeSection === section.id
                  ? 'bg-foreground text-background border-foreground'
                  : section.id === 'danger'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800'
                  : 'bg-muted/50 text-muted-foreground border-border/50'
              }`}>
              {section.label}
            </button>
          ))}
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

      <div className="px-4 py-4 space-y-4">
        {/* GENERAL SETTINGS */}
        {activeSection === 'general' && (
          <>
            <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
              <h2 className="font-bold text-sm">Club details</h2>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Club name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={3} className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background resize-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Bristol, South West"
                  className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background" />
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h2 className="font-bold text-sm mb-3">Club type</h2>
              <div className="grid grid-cols-2 gap-2">
                {CLUB_TYPES.map(type => (
                  <button key={type.id} onClick={() => setClubType(type.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      clubType === type.id ? 'bg-foreground/5 border-foreground' : 'bg-muted/30 border-border/50'
                    }`}>
                    <span className="text-xl">{type.emoji}</span>
                    <p className="text-xs font-semibold mt-1">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h2 className="font-bold text-sm mb-3">Tags</h2>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                    {tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setTags(prev => [...prev, tagInput.trim()]); setTagInput('') }}}
                  placeholder="Add tag..." className="flex-1 border border-border/50 rounded-xl px-3 py-2 text-sm bg-background" />
                <button onClick={() => { if (tagInput.trim()) { setTags(prev => [...prev, tagInput.trim()]); setTagInput('') }}}
                  className="px-4 py-2 rounded-xl bg-muted text-sm font-medium">Add</button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h2 className="font-bold text-sm mb-3">Rules</h2>
              <div className="space-y-2 mb-3">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <p className="flex-1 text-xs">{rule}</p>
                    <button onClick={() => setRules(prev => prev.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={ruleInput} onChange={e => setRuleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && ruleInput.trim()) { setRules(prev => [...prev, ruleInput.trim()]); setRuleInput('') }}}
                  placeholder="Add rule..." className="flex-1 border border-border/50 rounded-xl px-3 py-2 text-sm bg-background" />
                <button onClick={() => { if (ruleInput.trim()) { setRules(prev => [...prev, ruleInput.trim()]); setRuleInput('') }}}
                  className="px-4 py-2 rounded-xl bg-muted text-sm font-medium">Add</button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h2 className="font-bold text-sm mb-3">Privacy</h2>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 mb-3">
                <div>
                  <p className="text-xs font-medium">Private club</p>
                  <p className="text-[10px] text-muted-foreground">Hidden from discovery — invite only</p>
                </div>
                <button onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPrivate ? 'bg-foreground' : 'bg-muted'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isPrivate ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              <h3 className="text-xs font-medium mb-2">Join mode</h3>
              <div className="space-y-2">
                {JOIN_MODES.map(mode => (
                  <button key={mode.id} onClick={() => setJoinMode(mode.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${
                      joinMode === mode.id ? 'bg-foreground/5 border-foreground' : 'bg-muted/30 border-border/50'
                    }`}>
                    <span>{mode.emoji}</span>
                    <p className="text-sm font-medium">{mode.label}</p>
                    <div className={`ml-auto w-4 h-4 rounded-full border-2 ${joinMode === mode.id ? 'bg-foreground border-foreground' : 'border-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>

            {joinMode === 'approval' && (
              <div className="bg-card rounded-2xl border border-border/50 p-4">
                <h2 className="font-bold text-sm mb-3">Join questions</h2>
                <p className="text-xs text-muted-foreground mb-3">Members must answer these when requesting to join</p>
                <div className="space-y-2 mb-3">
                  {joinQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                      <p className="flex-1 text-xs">{q}</p>
                      <button onClick={() => setJoinQuestions(prev => prev.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  ))}
                </div>
                {joinQuestions.length < 3 && (
                  <div className="flex gap-2">
                    <input value={questionInput} onChange={e => setQuestionInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && questionInput.trim()) { setJoinQuestions(prev => [...prev, questionInput.trim()]); setQuestionInput('') }}}
                      placeholder="e.g. What car do you drive?"
                      className="flex-1 border border-border/50 rounded-xl px-3 py-2 text-sm bg-background" />
                    <button onClick={() => { if (questionInput.trim()) { setJoinQuestions(prev => [...prev, questionInput.trim()]); setQuestionInput('') }}}
                      className="px-4 py-2 rounded-xl bg-muted text-sm font-medium">Add</button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
              <h2 className="font-bold text-sm">Social links</h2>
              <div className="flex items-center border border-border/50 rounded-xl overflow-hidden bg-background">
                <span className="px-3 py-3 text-sm text-muted-foreground bg-muted/50 border-r border-border/50">@</span>
                <input value={instagram} onChange={e => setInstagram(e.target.value)}
                  placeholder="Instagram handle"
                  className="flex-1 px-3 py-3 text-sm bg-transparent" />
              </div>
              <input value={facebook} onChange={e => setFacebook(e.target.value)}
                placeholder="Facebook page URL"
                className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background" />
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h2 className="font-bold text-sm mb-3">Invite code</h2>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-muted/30 rounded-xl px-4 py-3 font-mono text-sm tracking-widest">
                  {club?.invite_code?.toUpperCase()}
                </div>
                <button onClick={() => { navigator.clipboard.writeText(club?.invite_code?.toUpperCase() || ''); toast.success('Copied!') }}
                  className="px-4 py-3 rounded-xl bg-muted text-sm font-semibold border border-border/50">Copy</button>
              </div>
              <button onClick={handleRegenerateInviteCode}
                className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate code
              </button>
            </div>
          </>
        )}

        {/* BRANDING */}
        {activeSection === 'branding' && (
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-5">
            <h2 className="font-bold text-base">Club branding</h2>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Cover image</label>
              {coverPreview ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-border/50">
                  <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-medium">Change</button>
                    <button onClick={() => { setCoverPreview(null); setCoverFile(null) }}
                      className="px-3 py-1.5 rounded-xl bg-destructive text-white text-xs font-medium">Remove</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => coverInputRef.current?.click()}
                  className="w-full h-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-muted/20">
                  <ImagePlus className="w-7 h-7 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload cover photo</span>
                </button>
              )}
            </div>
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
                  <button onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-muted text-sm font-medium border border-border/50">Upload logo</button>
                  {logoPreview && (
                    <button onClick={() => { setLogoPreview(null); setLogoFile(null) }}
                      className="block text-xs text-destructive">Remove</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JOIN REQUESTS */}
        {activeSection === 'requests' && (
          <div className="space-y-3">
            {joinRequests.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-3xl">✅</p>
                <p className="font-semibold text-foreground">No pending requests</p>
                <p className="text-sm text-muted-foreground">All join requests have been reviewed</p>
              </div>
            ) : (
              joinRequests.map((request: any) => (
                <div key={request.id} className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {request.profiles?.avatar_url ? (
                        <img src={request.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                          {(request.profiles?.display_name || request.profiles?.username || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{request.profiles?.display_name || request.profiles?.username}</p>
                      <p className="text-[10px] text-muted-foreground">@{request.profiles?.username}</p>
                    </div>
                  </div>

                  {request.answers?.length > 0 && (
                    <div className="space-y-2 bg-muted/30 rounded-xl p-3">
                      {(club.join_questions as string[] || []).map((q: string, i: number) => (
                        <div key={i}>
                          <p className="text-[10px] text-muted-foreground font-medium">{q}</p>
                          <p className="text-xs text-foreground">{request.answers[i] || 'No answer'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {rejectingId === request.id ? (
                    <div className="space-y-2">
                      <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (optional)"
                        className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-background" />
                      <div className="flex gap-2">
                        <button onClick={() => handleRejectRequest(request.id)}
                          className="flex-1 py-2 rounded-xl bg-destructive text-white text-sm font-semibold">Confirm Reject</button>
                        <button onClick={() => setRejectingId(null)}
                          className="flex-1 py-2 rounded-xl bg-muted text-sm font-medium">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveRequest(request.id)}
                        className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold">Approve ✓</button>
                      <button onClick={() => setRejectingId(request.id)}
                        className="flex-1 py-2.5 rounded-xl bg-muted border border-border/50 text-sm font-medium text-destructive">Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* MEMBERS MANAGEMENT */}
        {activeSection === 'members' && (
          <div className="space-y-2">
            {members.map((m: any) => {
              const isOwner = m.role === 'owner'
              const isMe = m.user_id === user?.id
              return (
                <div key={m.user_id} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {m.profiles?.avatar_url ? (
                      <img src={m.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {(m.profiles?.display_name || m.profiles?.username || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {m.profiles?.display_name || m.profiles?.username}
                      {isOwner && <span className="ml-1">👑</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{m.role}</p>
                  </div>
                  {!isMe && !isOwner && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      {m.role === 'member' && (
                        <button onClick={() => handlePromoteMember(m.user_id, 'admin')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-semibold">
                          Make Admin
                        </button>
                      )}
                      {m.role === 'admin' && (
                        <button onClick={() => handlePromoteMember(m.user_id, 'member')}
                          className="px-2.5 py-1.5 rounded-lg bg-muted text-[10px] font-semibold">Demote</button>
                      )}
                      <button onClick={() => handleRemoveMember(m.user_id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 text-[10px] font-semibold">Remove</button>
                      <button onClick={() => handleBlockUser(m.user_id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 text-[10px] font-semibold">Block</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* BLOCKED USERS */}
        {activeSection === 'blocked' && (
          <div className="space-y-2">
            {blockedUsers.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-3xl">🛡️</p>
                <p className="font-semibold text-foreground">No blocked users</p>
                <p className="text-sm text-muted-foreground">Blocked users cannot rejoin the club</p>
              </div>
            ) : (
              blockedUsers.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {(u.display_name || u.username || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{u.display_name || u.username}</p>
                    <p className="text-[10px] text-muted-foreground">@{u.username}</p>
                  </div>
                  <button onClick={() => handleUnblockUser(u.id)}
                    className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 text-xs font-semibold">Unblock</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* DANGER ZONE */}
        {activeSection === 'danger' && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm">Transfer Ownership</h2>
              </div>
              <p className="text-xs text-muted-foreground">Transfer club ownership to another member. You will become an admin.</p>
              <select value={transferToUserId} onChange={e => setTransferToUserId(e.target.value)}
                className="w-full border border-border/50 rounded-xl px-4 py-3 text-sm bg-background mb-3">
                <option value="">Select a member...</option>
                {members.filter((m: any) => m.user_id !== user?.id && m.role !== 'owner').map((m: any) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profiles?.display_name || m.profiles?.username}
                  </option>
                ))}
              </select>
              <button onClick={handleTransferOwnership} disabled={!transferToUserId}
                className="w-full py-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 text-sm font-semibold disabled:opacity-40">
                Transfer Ownership
              </button>
            </div>

            <div className="bg-card rounded-2xl border border-destructive/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h2 className="font-bold text-sm">Delete Club</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                This will permanently delete the club and all its posts, members and data.
                <strong className="text-foreground"> This cannot be undone.</strong>
              </p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold">
                  Delete Club
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-destructive">Type DELETE to confirm</p>
                  <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full border border-destructive/50 rounded-xl px-4 py-3 text-sm bg-background font-mono tracking-widest" />
                  <div className="flex gap-2">
                    <button onClick={handleDeleteClub} disabled={deleteConfirmText !== 'DELETE'}
                      className="flex-1 py-3 rounded-xl bg-destructive text-white text-sm font-semibold disabled:opacity-40">
                      Permanently Delete
                    </button>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                      className="flex-1 py-3 rounded-xl bg-muted text-sm font-medium">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
