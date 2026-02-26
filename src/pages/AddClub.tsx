import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Users, MapPin, Eye, Globe, Lock, UserCheck, Shield, Hash, Image, Link as LinkIcon, Instagram, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import LocationPicker from '@/components/LocationPicker';

const CLUB_TYPES = ['Car Club', 'Motorcycle Club', 'Mixed', 'Brand-specific', 'Track / Performance', 'Off-road', 'Classic'];
const TAG_OPTIONS = ['Porsche', 'BMW', 'Audi', 'Mercedes', 'VW', 'JDM', 'Supercars', 'Classics', 'EV', 'Ford', 'Ferrari', 'Lamborghini'];
const VEHICLE_FOCUS = ['All Welcome', 'Cars', 'Motorcycles', 'Classic', 'Supercars', 'JDM', 'Euro', 'American', 'Off-road'];

const DEFAULT_RULES = [
  'Be respectful to all members',
  'No dangerous driving content',
  'No spam or promotions',
  'Meet safety first',
];

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: 'Public', description: 'Anyone can view & request to join', icon: Globe },
  { value: 'private' as const, label: 'Private', description: 'Posts visible to members only', icon: Eye },
  { value: 'inviteOnly' as const, label: 'Invite Only', description: 'Hidden from search, invite only', icon: Lock },
];

const JOINING_OPTIONS = [
  { value: 'auto' as const, label: 'Auto-join', description: 'Members join instantly' },
  { value: 'adminApproval' as const, label: 'Admin Approval', description: 'Requests need approval' },
];

const POSTING_OPTIONS = [
  { value: 'anyMember' as const, label: 'Any Member', description: 'All members can post' },
  { value: 'adminsOnly' as const, label: 'Admins Only', description: 'Only admins can post' },
];

// ── Shared layout components (matching Add Event/Service) ──
const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-card p-5 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-xl bg-clubs/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-clubs" />
    </div>
    <h2 className="text-base font-bold text-foreground">{children}</h2>
  </div>
);

const AddClub = () => {
  const navigate = useNavigate();
  const { clubs: clubsRepo, state } = useData();
  const currentUser = state.currentUser;

  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    description: '',
    location: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    instagram: '',
    website: '',
    tiktok: '',
    youtube: '',
    x: '',
  });

  const [clubType, setClubType] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [vehicleFocus, setVehicleFocus] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private' | 'inviteOnly'>('public');
  const [joinApproval, setJoinApproval] = useState<'auto' | 'adminApproval'>('auto');
  const [postingPermissions, setPostingPermissions] = useState<'anyMember' | 'adminsOnly'>('anyMember');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [enabledRules, setEnabledRules] = useState<boolean[]>(DEFAULT_RULES.map(() => true));
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [newCustomRule, setNewCustomRule] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const autoHandle = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Club name is required';
    if (!formData.handle.trim()) errs.handle = 'Handle is required';
    else if (!/^[a-z0-9_]+$/.test(formData.handle)) errs.handle = 'Only lowercase letters, numbers, underscores';
    else if (!clubsRepo.isHandleAvailable(formData.handle)) errs.handle = 'Handle already taken';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!visibility) errs.visibility = 'Select visibility';
    if (!joinApproval) errs.joining = 'Select joining mode';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogoUpload = () => {
    toast.info('Logo upload will connect to storage later');
    setLogoImage('logo-placeholder');
  };

  const handleCoverUpload = () => {
    toast.info('Cover upload will connect to storage later');
    setCoverImage('cover-placeholder');
  };

  const toggleChip = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const addCustomRule = () => {
    if (newCustomRule.trim()) {
      setCustomRules(prev => [...prev, newCustomRule.trim()]);
      setNewCustomRule('');
    }
  };

  const update = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (!currentUser) {
      toast.error('You must be logged in to create a club');
      return;
    }

    setIsSubmitting(true);

    try {
      const activeRules = DEFAULT_RULES.filter((_, i) => enabledRules[i]);
      const allRules = [...activeRules, ...customRules];

      const newClub = clubsRepo.create({
        name: formData.name.trim(),
        handle: formData.handle.trim(),
        description: formData.description.trim(),
        tagline: tags.length > 0 ? tags.slice(0, 2).join(' · ') : clubType || undefined,
        location: formData.location.trim(),
        locationCoords: formData.locationCoords,
        coverPhoto: coverImage,
        logo: logoImage,
        image: null,
        members: 1,
        categories: tags,
        clubType,
        vehicleFocus,
        membershipType: 'free',
        visibility,
        postingPermissions,
        joinApproval,
        roles: {
          ownerId: currentUser.id,
          adminIds: [currentUser.id],
          moderatorIds: [],
        },
        socialLinks: {
          instagram: formData.instagram || undefined,
          website: formData.website || undefined,
          tiktok: formData.tiktok || undefined,
          youtube: formData.youtube || undefined,
          x: formData.x || undefined,
        },
        rules: allRules,
        createdBy: currentUser.id,
      });

      // Auto-join creator as admin
      clubsRepo.join(currentUser.id, newClub.id);

      toast.success('Club created successfully!', { description: formData.name });
      navigate(`/club/${newClub.id}`);
    } catch {
      toast.error('Failed to create club. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.handle.trim() && formData.location.trim();

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Create Club</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-32">

        {/* ── A) CLUB BRANDING ── */}
        <SectionCard>
          <SectionTitle icon={Camera}>Club Branding</SectionTitle>
          <div className="space-y-4">
            {/* Logo */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Club Logo</Label>
              {logoImage ? (
                <div className="relative w-24 h-24 rounded-2xl bg-clubs/10 flex items-center justify-center overflow-hidden border border-border/50">
                  <Users className="w-8 h-8 text-clubs" />
                  <button onClick={() => setLogoImage(null)} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={handleLogoUpload} className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:border-clubs/50 transition-colors bg-muted/30">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">Add Logo</span>
                </button>
              )}
            </div>

            {/* Cover */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Cover Photo</Label>
              {coverImage ? (
                <div className="relative w-full h-32 rounded-2xl bg-clubs/10 flex items-center justify-center overflow-hidden border border-border/50">
                  <Image className="w-8 h-8 text-clubs" />
                  <button onClick={() => setCoverImage(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={handleCoverUpload} className="w-full h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:border-clubs/50 transition-colors bg-muted/30">
                  <Image className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Add Cover Photo</span>
                </button>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── B) CLUB INFO ── */}
        <SectionCard>
          <SectionTitle icon={Users}>Club Info</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Club Name *</Label>
              <Input
                placeholder="e.g. Porsche Enthusiasts UK"
                value={formData.name}
                onChange={e => {
                  update('name', e.target.value);
                  if (!formData.handle || formData.handle === autoHandle(formData.name)) {
                    update('handle', autoHandle(e.target.value));
                  }
                }}
                className="rounded-xl h-11"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Handle *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="clubhandle"
                  value={formData.handle}
                  onChange={e => update('handle', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="pl-10 rounded-xl h-11"
                  maxLength={20}
                />
              </div>
              {formData.handle && (
                <p className="text-[10px] text-muted-foreground">@{formData.handle}</p>
              )}
              {errors.handle && <p className="text-xs text-destructive">{errors.handle}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                placeholder="Tell people what your club is about..."
                value={formData.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Location *</Label>
              <LocationPicker
                value={formData.location}
                onChange={(loc, coords) => {
                  update('location', loc);
                  update('locationCoords', coords);
                }}
                error={errors.location}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── C) CLUB TYPE & TAGS ── */}
        <SectionCard>
          <SectionTitle icon={Users}>Club Type & Tags</SectionTitle>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Club Type</Label>
              <div className="flex flex-wrap gap-2">
                {CLUB_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setClubType(clubType === type ? '' : type)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      clubType === type
                        ? 'bg-clubs text-clubs-foreground border-clubs shadow-sm'
                        : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-clubs/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleChip(tags, setTags, tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      tags.includes(tag)
                        ? 'bg-clubs text-clubs-foreground border-clubs shadow-sm'
                        : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-clubs/40'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Vehicle Focus</Label>
              <div className="flex flex-wrap gap-2">
                {VEHICLE_FOCUS.map(focus => (
                  <button
                    key={focus}
                    onClick={() => toggleChip(vehicleFocus, setVehicleFocus, focus)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      vehicleFocus.includes(focus)
                        ? 'bg-clubs text-clubs-foreground border-clubs shadow-sm'
                        : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-clubs/40'
                    }`}
                  >
                    {focus}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── D) PRIVACY & JOINING ── */}
        <SectionCard>
          <SectionTitle icon={Shield}>Privacy & Joining</SectionTitle>
          <div className="space-y-4">
            {/* Visibility */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Visibility *</Label>
              <div className="space-y-2">
                {VISIBILITY_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setVisibility(opt.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border ${
                        visibility === opt.value
                          ? 'bg-clubs/10 border-clubs shadow-sm'
                          : 'bg-muted/30 border-border/50 hover:border-clubs/40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        visibility === opt.value ? 'bg-clubs text-clubs-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${visibility === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Joining */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Join Mode *</Label>
              <div className="flex gap-2">
                {JOINING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setJoinApproval(opt.value)}
                    className={`flex-1 p-3 rounded-xl text-left transition-all duration-200 border ${
                      joinApproval === opt.value
                        ? 'bg-clubs/10 border-clubs shadow-sm'
                        : 'bg-muted/30 border-border/50 hover:border-clubs/40'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${joinApproval === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Posting */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Posting Permissions</Label>
              <div className="flex gap-2">
                {POSTING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPostingPermissions(opt.value)}
                    className={`flex-1 p-3 rounded-xl text-left transition-all duration-200 border ${
                      postingPermissions === opt.value
                        ? 'bg-clubs/10 border-clubs shadow-sm'
                        : 'bg-muted/30 border-border/50 hover:border-clubs/40'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${postingPermissions === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── E) RULES ── */}
        <SectionCard>
          <SectionTitle icon={CheckSquare}>Club Rules</SectionTitle>
          <div className="space-y-3">
            {DEFAULT_RULES.map((rule, i) => (
              <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 cursor-pointer">
                <Switch
                  checked={enabledRules[i]}
                  onCheckedChange={v => setEnabledRules(prev => { const n = [...prev]; n[i] = v; return n; })}
                />
                <span className="text-xs font-medium text-foreground">{rule}</span>
              </label>
            ))}

            {customRules.map((rule, i) => (
              <div key={`custom-${i}`} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                <span className="text-xs font-medium text-foreground flex-1">{rule}</span>
                <button onClick={() => setCustomRules(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Add custom rule..."
                value={newCustomRule}
                onChange={e => setNewCustomRule(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomRule())}
                className="rounded-xl h-10 text-xs"
              />
              <Button variant="outline" size="sm" onClick={addCustomRule} disabled={!newCustomRule.trim()} className="rounded-xl h-10 px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* ── F) SOCIAL LINKS ── */}
        <SectionCard>
          <SectionTitle icon={LinkIcon}>Social Links</SectionTitle>
          <div className="space-y-3">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="@instagram" className="pl-10 rounded-xl h-11 text-xs" value={formData.instagram} onChange={e => update('instagram', e.target.value)} />
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="https://website.com" className="pl-10 rounded-xl h-11 text-xs" value={formData.website} onChange={e => update('website', e.target.value)} />
            </div>
            <Input placeholder="TikTok @username" className="rounded-xl h-11 text-xs" value={formData.tiktok} onChange={e => update('tiktok', e.target.value)} />
            <Input placeholder="YouTube channel URL" className="rounded-xl h-11 text-xs" value={formData.youtube} onChange={e => update('youtube', e.target.value)} />
            <Input placeholder="X (Twitter) @handle" className="rounded-xl h-11 text-xs" value={formData.x} onChange={e => update('x', e.target.value)} />
          </div>
        </SectionCard>

        {/* ── G) CONFIRMATION ── */}
        <SectionCard>
          <SectionTitle icon={UserCheck}>Confirmation</SectionTitle>

          {/* Preview Card */}
          {formData.name && (
            <div className="bg-muted/30 rounded-xl p-4 border border-border/30 mb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-semibold">Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clubs to-clubs/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-clubs-foreground">
                    {formData.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{formData.name}</p>
                  {formData.handle && <p className="text-[10px] text-muted-foreground">@{formData.handle}</p>}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {formData.location || 'Location'}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">{visibility}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={agreeToTerms}
              onCheckedChange={v => setAgreeToTerms(v === true)}
              className="mt-0.5"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              I confirm this club follows RevNet community guidelines and promotes safe, respectful automotive culture.
            </span>
          </label>
        </SectionCard>

        <p className="text-center text-[11px] text-muted-foreground">Draft auto-saved • Changes sync automatically</p>
      </div>

      {/* ── STICKY BOTTOM CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-background via-background to-background/0">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { toast.success('Draft saved'); navigate(-1); }}
              className="flex-1 h-12 rounded-2xl text-sm font-semibold border-clubs/30 text-clubs"
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              className="flex-[2] h-12 rounded-2xl text-base font-semibold bg-clubs hover:bg-clubs/90 text-clubs-foreground shadow-elevated disabled:opacity-40"
            >
              {isSubmitting ? 'Creating...' : 'Create Club'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClub;
