import { ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const PrivacySafetySettings = () => {
  const navigate = useNavigate();

  // Profile Visibility
  const [profileVisibility, setProfileVisibility] = useState('public');

  // Garage Privacy
  const [showGarageOnProfile, setShowGarageOnProfile] = useState(true);
  const [friendsViewVehicleDetails, setFriendsViewVehicleDetails] = useState(true);
  const [othersSeeMods, setOthersSeeMods] = useState(true);

  // Location Sharing
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(false);
  const [locationVisibility, setLocationVisibility] = useState('friends');
  const [autoShareGroupDrives, setAutoShareGroupDrives] = useState(true);
  const [autoShareBreakdown, setAutoShareBreakdown] = useState(true);

  // Breakdown Privacy
  const [nearbyBreakdownVisible, setNearbyBreakdownVisible] = useState(true);
  const [shareVehicleBreakdown, setShareVehicleBreakdown] = useState(true);
  const [allowHelpersMessage, setAllowHelpersMessage] = useState(true);

  // Messaging Privacy
  const [whoCanMessage, setWhoCanMessage] = useState('friends-clubs');
  const [allowMessageRequests, setAllowMessageRequests] = useState(true);
  const [muteUnknownSenders, setMuteUnknownSenders] = useState(false);

  // Activity Controls
  const [showEventsAttend, setShowEventsAttend] = useState(true);
  const [showRoutesCreate, setShowRoutesCreate] = useState(true);
  const [showForumPosts, setShowForumPosts] = useState(true);

  return (
    <div className="mobile-container bg-background h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top shrink-0">
        <div className="flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
          <h1 className="text-lg font-bold text-foreground">Privacy & Safety</h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 pb-6 space-y-4">
          
          {/* 1. Profile Visibility */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Profile Visibility</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Control who can view your profile, garage, and activity</p>
            
            <RadioGroup value={profileVisibility} onValueChange={setProfileVisibility} className="space-y-2">
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="public" id="public" className="mt-0.5" />
                <Label htmlFor="public" className="flex-1 cursor-pointer">
                  <span className="text-sm font-medium text-foreground">Public</span>
                  <p className="text-xs text-muted-foreground">Anyone can view your profile, vehicles, and activity</p>
                </Label>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="friends" id="friends" className="mt-0.5" />
                <Label htmlFor="friends" className="flex-1 cursor-pointer">
                  <span className="text-sm font-medium text-foreground">Friends only</span>
                  <p className="text-xs text-muted-foreground">Only people you've added as friends can see your profile</p>
                </Label>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="private" id="private" className="mt-0.5" />
                <Label htmlFor="private" className="flex-1 cursor-pointer">
                  <span className="text-sm font-medium text-foreground">Private</span>
                  <p className="text-xs text-muted-foreground">Your profile is hidden from everyone</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 2. Garage & Vehicle Visibility */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Garage Privacy</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Manage who can see your vehicles and build details</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Show garage on profile</span>
                <Switch checked={showGarageOnProfile} onCheckedChange={setShowGarageOnProfile} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Allow friends to view vehicle details</span>
                <Switch checked={friendsViewVehicleDetails} onCheckedChange={setFriendsViewVehicleDetails} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Allow others to see mods & notes</span>
                <Switch checked={othersSeeMods} onCheckedChange={setOthersSeeMods} />
              </div>
            </div>
          </div>

          {/* 3. Location Sharing */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Live Location Sharing</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Choose when and with whom your live location is shared</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <span className="text-sm font-medium text-foreground">Live location sharing</span>
                <Switch checked={liveLocationEnabled} onCheckedChange={setLiveLocationEnabled} />
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Auto-share during group drives</span>
                      <Switch checked={autoShareGroupDrives} onCheckedChange={setAutoShareGroupDrives} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Auto-share when requesting breakdown help</span>
                      <Switch checked={autoShareBreakdown} onCheckedChange={setAutoShareBreakdown} />
                    </div>
                  </div>
                </>
              )}
              
              <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg p-2">
                🛡️ Your location is never shared without your permission
              </p>
            </div>
          </div>

          {/* 4. Breakdown & Help Privacy */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Breakdown & Help Requests</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Control how your information is shared when you need help</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Allow nearby users to see breakdown requests</span>
                <Switch checked={nearbyBreakdownVisible} onCheckedChange={setNearbyBreakdownVisible} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Share vehicle details during breakdowns</span>
                <Switch checked={shareVehicleBreakdown} onCheckedChange={setShareVehicleBreakdown} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Allow helpers to message me</span>
                <Switch checked={allowHelpersMessage} onCheckedChange={setAllowHelpersMessage} />
              </div>
              
              <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg p-2">
                Your exact location is only shared with people responding to your request
              </p>
            </div>
          </div>

          {/* 5. Messaging & Contact Controls */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Messaging Privacy</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Decide who can contact you</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Who can message me</span>
                <RadioGroup value={whoCanMessage} onValueChange={setWhoCanMessage} className="mt-2 space-y-1">
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Allow message requests</span>
                  <Switch checked={allowMessageRequests} onCheckedChange={setAllowMessageRequests} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Mute unknown senders</span>
                  <Switch checked={muteUnknownSenders} onCheckedChange={setMuteUnknownSenders} />
                </div>
              </div>
            </div>
          </div>

          {/* 6. Blocking & Reporting */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="text-left">
                <h2 className="text-sm font-semibold text-foreground">Blocked Users</h2>
                <p className="text-xs text-muted-foreground">View and manage blocked accounts</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </button>
          </div>

          {/* 7. Data & Activity Controls */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Activity & Data</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Manage how your activity appears to others</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Show events I attend</span>
                <Switch checked={showEventsAttend} onCheckedChange={setShowEventsAttend} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Show routes I create</span>
                <Switch checked={showRoutesCreate} onCheckedChange={setShowRoutesCreate} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Show forum posts on profile</span>
                <Switch checked={showForumPosts} onCheckedChange={setShowForumPosts} />
              </div>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default PrivacySafetySettings;