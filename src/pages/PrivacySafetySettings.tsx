import { ChevronRight, X, UserX } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

const PrivacySafetySettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showGarageOnProfile, setShowGarageOnProfile] = useState(true);
  const [friendsViewVehicleDetails, setFriendsViewVehicleDetails] = useState(true);
  const [othersSeeMods, setOthersSeeMods] = useState(true);
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(false);
  const [locationVisibility, setLocationVisibility] = useState('friends');
  const [autoShareGroupDrives, setAutoShareGroupDrives] = useState(true);
  const [autoShareBreakdown, setAutoShareBreakdown] = useState(true);
  const [nearbyBreakdownVisible, setNearbyBreakdownVisible] = useState(true);
  const [shareVehicleBreakdown, setShareVehicleBreakdown] = useState(true);
  const [allowHelpersMessage, setAllowHelpersMessage] = useState(true);
  const [whoCanMessage, setWhoCanMessage] = useState('friends-clubs');
  const [allowMessageRequests, setAllowMessageRequests] = useState(true);
  const [muteUnknownSenders, setMuteUnknownSenders] = useState(false);
  const [showEventsAttend, setShowEventsAttend] = useState(true);
  const [showRoutesCreate, setShowRoutesCreate] = useState(true);
  const [showForumPosts, setShowForumPosts] = useState(true);

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [showBlockedSection, setShowBlockedSection] = useState(false);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // Load from Supabase
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setProfileVisibility(data.profile_visibility || 'public');
        setShowGarageOnProfile(data.show_garage_on_profile ?? true);
        setFriendsViewVehicleDetails(data.allow_friends_view_vehicles ?? true);
        setOthersSeeMods(data.allow_others_see_mods ?? true);
        setLiveLocationEnabled(data.live_location_sharing ?? false);
        setWhoCanMessage(data.who_can_message === 'friends' ? 'friends' : data.who_can_message === 'anyone' ? 'anyone' : 'friends-clubs');
        setAllowMessageRequests(data.allow_message_requests ?? true);
        setShowEventsAttend(data.show_events_i_attend ?? true);
        setShowRoutesCreate(data.show_routes_i_create ?? true);
        setShowForumPosts(data.show_forum_posts ?? true);
      }
      setIsLoading(false);
    })();
  }, [user?.id]);

  const loadBlockedUsers = async () => {
    if (!user?.id) return;
    setLoadingBlocked(true);
    try {
      const { data } = await supabase
        .from('blocked_users')
        .select('id, blocked_user_id')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        const blockedIds = data.map(b => b.blocked_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', blockedIds);

        const merged: BlockedUser[] = data.map(b => {
          const p = profiles?.find(pr => pr.id === b.blocked_user_id);
          return {
            id: b.id,
            blocked_user_id: b.blocked_user_id,
            username: p?.username || 'Unknown',
            display_name: p?.display_name || 'Unknown',
            avatar_url: p?.avatar_url || null,
          };
        });
        setBlockedUsers(merged);
      } else {
        setBlockedUsers([]);
      }
    } catch (err) {
      toast.error('Failed to load blocked users');
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (blockId: string, displayName: string) => {
    const { error } = await supabase.from('blocked_users').delete().eq('id', blockId);
    if (error) {
      toast.error('Could not unblock user');
      return;
    }
    setBlockedUsers(prev => prev.filter(b => b.id !== blockId));
    toast.success(`${displayName} unblocked`);
  };

  const updateField = async (field: string, value: any) => {
    if (!user?.id) return;
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', user.id);
    if (error) toast.error('Failed to save setting');
  };

  const handleProfileVisibility = (v: string) => { setProfileVisibility(v); updateField('profile_visibility', v); };
  const handleShowGarage = (v: boolean) => { setShowGarageOnProfile(v); updateField('show_garage_on_profile', v); };
  const handleFriendsView = (v: boolean) => { setFriendsViewVehicleDetails(v); updateField('allow_friends_view_vehicles', v); };
  const handleOthersMods = (v: boolean) => { setOthersSeeMods(v); updateField('allow_others_see_mods', v); };
  const handleLiveLocation = (v: boolean) => { setLiveLocationEnabled(v); updateField('live_location_sharing', v); };
  const handleWhoCanMessage = (v: string) => {
    setWhoCanMessage(v);
    const dbVal = v === 'friends' ? 'friends' : v === 'anyone' ? 'anyone' : 'friends_and_clubs';
    updateField('who_can_message', dbVal);
  };
  const handleAllowRequests = (v: boolean) => { setAllowMessageRequests(v); updateField('allow_message_requests', v); };
  const handleShowEvents = (v: boolean) => { setShowEventsAttend(v); updateField('show_events_i_attend', v); };
  const handleShowRoutes = (v: boolean) => { setShowRoutesCreate(v); updateField('show_routes_i_create', v); };
  const handleShowForum = (v: boolean) => { setShowForumPosts(v); updateField('show_forum_posts', v); };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background h-dvh flex flex-col md:max-w-2xl md:mx-auto">
        <div className="px-4 pt-4 pb-2 safe-top shrink-0">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
            <h1 className="text-lg font-bold text-foreground">Privacy & Safety</h1>
          </div>
        </div>
        <div className="px-4 pt-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border/30 shadow-sm p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background h-dvh flex flex-col md:max-w-2xl md:mx-auto">
      <div className="px-4 pt-4 pb-2 safe-top shrink-0">
        <div className="flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
          <h1 className="text-lg font-bold text-foreground">Privacy & Safety</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-6 space-y-4">
          {/* 1. Profile Visibility */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Profile Visibility</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Control who can view your profile, garage, and activity</p>
            <RadioGroup value={profileVisibility} onValueChange={handleProfileVisibility} className="space-y-2">
              {[
                { value: 'public', label: 'Public', desc: 'Anyone can view your profile, vehicles, and activity' },
                { value: 'friends', label: 'Friends only', desc: 'Only people you\'ve added as friends can see your profile' },
                { value: 'private', label: 'Private', desc: 'Your profile is hidden from everyone' },
              ].map(o => (
                <div key={o.value} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={o.value} id={o.value} className="mt-0.5" />
                  <Label htmlFor={o.value} className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-foreground">{o.label}</span>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 2. Garage Privacy */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Garage Privacy</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Manage who can see your vehicles and build details</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Show garage on profile</span><Switch checked={showGarageOnProfile} onCheckedChange={handleShowGarage} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Allow friends to view vehicle details</span><Switch checked={friendsViewVehicleDetails} onCheckedChange={handleFriendsView} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Allow others to see mods & notes</span><Switch checked={othersSeeMods} onCheckedChange={handleOthersMods} /></div>
            </div>
          </div>

          {/* 3. Location Sharing */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Live Location Sharing</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Choose when and with whom your live location is shared</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <span className="text-sm font-medium text-foreground">Live location sharing</span>
                <Switch checked={liveLocationEnabled} onCheckedChange={handleLiveLocation} />
              </div>
              {liveLocationEnabled && (
                <>
                  <div className="pt-1">
                    <span className="text-xs font-medium text-muted-foreground">Who can see my location</span>
                    <RadioGroup value={locationVisibility} onValueChange={setLocationVisibility} className="mt-2 space-y-1">
                      {[
                        { value: 'no-one', label: 'No one' },
                        { value: 'friends', label: 'Friends' },
                        { value: 'clubs', label: 'Clubs I\'m in' },
                        { value: 'group-drives', label: 'Active group drives only' },
                        { value: 'breakdown', label: 'Breakdown requests only' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm text-foreground cursor-pointer">{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="pt-2 space-y-3 border-t border-border/30">
                    <div className="flex items-center justify-between"><span className="text-sm text-foreground">Auto-share during group drives</span><Switch checked={autoShareGroupDrives} onCheckedChange={setAutoShareGroupDrives} /></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-foreground">Auto-share when requesting breakdown help</span><Switch checked={autoShareBreakdown} onCheckedChange={setAutoShareBreakdown} /></div>
                  </div>
                </>
              )}
              <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg p-2">🛡️ Your location is never shared without your permission</p>
            </div>
          </div>

          {/* 4. Breakdown Privacy */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Breakdown & Help Requests</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Control how your information is shared when you need help</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Allow nearby users to see breakdown requests</span><Switch checked={nearbyBreakdownVisible} onCheckedChange={setNearbyBreakdownVisible} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Share vehicle details during breakdowns</span><Switch checked={shareVehicleBreakdown} onCheckedChange={setShareVehicleBreakdown} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Allow helpers to message me</span><Switch checked={allowHelpersMessage} onCheckedChange={setAllowHelpersMessage} /></div>
              <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg p-2">Your exact location is only shared with people responding to your request</p>
            </div>
          </div>

          {/* 5. Messaging Privacy */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Messaging Privacy</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Decide who can contact you</p>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Who can message me</span>
                <RadioGroup value={whoCanMessage} onValueChange={handleWhoCanMessage} className="mt-2 space-y-1">
                  {[
                    { value: 'friends', label: 'Friends only' },
                    { value: 'friends-clubs', label: 'Friends & club members' },
                    { value: 'anyone', label: 'Anyone' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50">
                      <RadioGroupItem value={option.value} id={`msg-${option.value}`} />
                      <Label htmlFor={`msg-${option.value}`} className="text-sm text-foreground cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="pt-2 space-y-3 border-t border-border/30">
                <div className="flex items-center justify-between"><span className="text-sm text-foreground">Allow message requests</span><Switch checked={allowMessageRequests} onCheckedChange={handleAllowRequests} /></div>
                <div className="flex items-center justify-between"><span className="text-sm text-foreground">Mute unknown senders</span><Switch checked={muteUnknownSenders} onCheckedChange={setMuteUnknownSenders} /></div>
              </div>
            </div>
          </div>

          {/* 6. Blocked Users */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
            <button
              onClick={() => { setShowBlockedSection(!showBlockedSection); if (!showBlockedSection) loadBlockedUsers(); }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="text-left">
                <h2 className="text-sm font-semibold text-foreground">Blocked Users</h2>
                <p className="text-xs text-muted-foreground">View and manage blocked accounts</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground/50 transition-transform ${showBlockedSection ? 'rotate-90' : ''}`} />
            </button>

            {showBlockedSection && (
              <div className="border-t border-border/30 p-4">
                {loadingBlocked ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <UserX className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No blocked users</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map(bu => (
                      <div key={bu.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {bu.avatar_url ? (
                            <img src={bu.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">{(bu.display_name || '?')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{bu.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{bu.username}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleUnblock(bu.id, bu.display_name)}
                        >
                          Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Activity Controls */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Activity & Data</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Manage how your activity appears to others</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Show events I attend</span><Switch checked={showEventsAttend} onCheckedChange={handleShowEvents} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Show routes I create</span><Switch checked={showRoutesCreate} onCheckedChange={handleShowRoutes} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-foreground">Show forum posts on profile</span><Switch checked={showForumPosts} onCheckedChange={handleShowForum} /></div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PrivacySafetySettings;
