import { useNavigate } from 'react-router-dom';
import {
  Camera, Settings as SettingsIcon, Share2, Plus,
  Bell, Shield, ChevronRight,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const initials = (name: string | null | undefined) =>
  (name ?? 'U').split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

const FRIEND_AVATAR_PALETTE = [
  'bg-purple-100 text-purple-600',
  'bg-teal-100 text-teal-600',
  'bg-pink-100 text-pink-600',
  'bg-amber-100 text-amber-600',
];

export default function ProfileView() {
  const navigate = useNavigate();
  const { profile, vehicles, friends, loading, updateUserProfile } = useUserProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-background min-h-full flex items-center justify-center pb-24">
        <p className="text-sm text-muted-foreground">Couldn't load your profile.</p>
      </div>
    );
  }

  // "Private" toggle ON means the garage is hidden (show_garage_on_profile = false).
  const garagePrivate = !profile.show_garage_on_profile;
  const handleGaragePrivacyToggle = (newPrivate: boolean) => {
    updateUserProfile({ show_garage_on_profile: !newPrivate });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/user/${profile.username || ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: profile.display_name || 'My RevNet Profile', url }); } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied!');
      } catch { /* clipboard unavailable */ }
    }
  };

  const helperRatingDisplay = profile.helper_count > 0 ? profile.helper_rating.toFixed(1) : '—';

  return (
    <div className="space-y-4 p-4 pb-24 md:max-w-2xl md:mx-auto">
      {/* ─── SECTION 1 · Social Header ─── */}
      <Card>
        <CardContent className="p-5">
          <div className="text-center mb-4">
            <div className="relative inline-block mb-3">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium text-2xl">
                  {initials(profile.display_name)}
                </div>
              )}
              <button
                onClick={() => navigate('/profile')}
                aria-label="Edit profile photo"
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center"
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>

            <h2 className="text-xl font-medium mb-1 text-foreground">
              {profile.display_name || 'RevNet User'}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              @{profile.username || 'user'}
              {profile.location ? ` • ${profile.location}` : ''}
            </p>
            {profile.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Social Stats Grid (real data only — no fake placeholders) */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => navigate('/my-friends')}
              className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">{profile.friends_count}</div>
              <div className="text-xs text-gray-600">Friends</div>
            </button>
            <button
              onClick={() => navigate('/my-clubs')}
              className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">{profile.clubs_joined}</div>
              <div className="text-xs text-gray-600">Clubs</div>
            </button>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-medium text-green-700 mb-1">{helperRatingDisplay}</div>
              <div className="text-xs text-green-700">★ Helper</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/profile')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Edit Profile
            </Button>
            <Button variant="outline" className="px-4" onClick={handleShare} aria-label="Share profile">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 2 · Community Stats ─── */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-medium mb-3 text-foreground">Community stats</h3>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => navigate('/my-events')}
              className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">{profile.events_attended}</div>
              <div className="text-xs text-gray-600">Events attended</div>
            </button>
            <button
              onClick={() => navigate('/my-routes')}
              className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">{profile.routes_shared}</div>
              <div className="text-xs text-gray-600">Routes shared</div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium text-gray-900 mb-1">{profile.helper_count}</div>
              <div className="text-xs text-gray-600">People helped</div>
            </div>
            <button
              onClick={() => navigate('/my-clubs')}
              className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900 mb-1">{profile.clubs_joined}</div>
              <div className="text-xs text-gray-600">Clubs joined</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 3 · Vehicles ─── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Vehicles</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Private</span>
              <Switch
                checked={garagePrivate}
                onCheckedChange={handleGaragePrivacyToggle}
                aria-label="Hide garage from other users"
                className="scale-75"
              />
              <Button size="sm" variant="outline" className="ml-2" onClick={() => navigate('/add/vehicle')}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              No vehicles added yet
            </p>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => {
                const yearLabel = v.year ? `${v.year} ` : '';
                const meta = [v.colour, v.transmission].filter(Boolean).join(' • ');
                return (
                  <button
                    key={v.id}
                    onClick={() => navigate('/my-garage')}
                    className="w-full border rounded-lg p-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {yearLabel}{v.make ?? ''} {v.model ?? ''}
                      </span>
                      {v.is_primary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── SECTION 4 · Friends ─── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">My friends</h3>
            <button
              onClick={() => navigate('/my-friends')}
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              View all
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {friends.map((f, idx) => (
              <button
                key={f.id}
                onClick={() => navigate(`/profile/${f.id}`)}
                className="text-center"
              >
                {f.avatar_url ? (
                  <img
                    src={f.avatar_url}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover mb-1"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full ${FRIEND_AVATAR_PALETTE[idx % FRIEND_AVATAR_PALETTE.length]} flex items-center justify-center font-medium text-sm mb-1`}
                  >
                    {initials(f.display_name)}
                  </div>
                )}
                <span className="text-xs text-muted-foreground block max-w-[60px] truncate">
                  {f.display_name?.split(' ')[0] ?? 'Friend'}
                </span>
              </button>
            ))}
            <button
              onClick={() => navigate('/my-friends')}
              className="text-center"
              aria-label="Find friends"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center mb-1">
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs text-muted-foreground">Add</span>
            </button>
          </div>
          {friends.length === 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              No friends yet. Tap Add to find people you've ridden with.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ─── SECTION 5 · Settings & support ─── */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-medium mb-3 text-foreground">Settings &amp; support</h3>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/settings/account')}
              className="w-full p-3 border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Account settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate('/settings/notifications')}
              className="w-full p-3 border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Notifications</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate('/settings/privacy')}
              className="w-full p-3 border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Privacy &amp; safety</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
