import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NotificationSettings = () => {
  const navigate = useNavigate();

  // Notification Channels
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Social Notifications
  const [friendRequests, setFriendRequests] = useState(true);
  const [friendAccepts, setFriendAccepts] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [messageReactions, setMessageReactions] = useState(false);
  const [mentions, setMentions] = useState(true);

  // Clubs & Community
  const [newClubPosts, setNewClubPosts] = useState(false);
  const [clubPostReplies, setClubPostReplies] = useState(true);
  const [forumReplies, setForumReplies] = useState(true);
  const [postUpvotes, setPostUpvotes] = useState(false);
  const [newClubMembers, setNewClubMembers] = useState(false);

  // Events & Drives
  const [eventInvitations, setEventInvitations] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [eventChanges, setEventChanges] = useState(true);
  const [groupDriveStarting, setGroupDriveStarting] = useState(true);
  const [groupDriveUpdates, setGroupDriveUpdates] = useState(true);
  const [reminderTiming, setReminderTiming] = useState('2-hours');

  // Live & Safety
  const [breakdownNearby, setBreakdownNearby] = useState(true);
  const [breakdownResponse, setBreakdownResponse] = useState(true);
  const [friendSharesLocation, setFriendSharesLocation] = useState(true);
  const [groupDriveSafety, setGroupDriveSafety] = useState(true);

  // Quiet Hours
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');

  // Notification Digest
  const [digestFrequency, setDigestFrequency] = useState('off');

  return (
    <div className="mobile-container bg-background h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Notifications</h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 pb-6 space-y-4">
          
          {/* 1. Notification Channels */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Notification Channels</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Choose how you receive notifications</p>
            
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-sm text-foreground">Push notifications</span>
                  <p className="text-xs text-muted-foreground">Instant alerts on your device</p>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-sm text-foreground">Email notifications</span>
                  <p className="text-xs text-muted-foreground">Important updates and summaries</p>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>
              <div className="flex items-start justify-between gap-3 opacity-60">
                <div className="flex-1">
                  <span className="text-sm text-foreground">In-app notifications</span>
                  <p className="text-xs text-muted-foreground">Shown inside the app</p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Always on</span>
              </div>
            </div>
          </div>

          {/* 2. Social Notifications */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Social Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Stay updated on friends and community interactions</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">New friend requests</span>
                <Switch checked={pushEnabled && friendRequests} onCheckedChange={setFriendRequests} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Friend accepts request</span>
                <Switch checked={pushEnabled && friendAccepts} onCheckedChange={setFriendAccepts} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">New messages</span>
                <Switch checked={pushEnabled && newMessages} onCheckedChange={setNewMessages} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Message reactions / replies</span>
                <Switch checked={pushEnabled && messageReactions} onCheckedChange={setMessageReactions} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Mentions or replies in discussions</span>
                <Switch checked={pushEnabled && mentions} onCheckedChange={setMentions} disabled={!pushEnabled} />
              </div>
            </div>
          </div>

          {/* 3. Clubs & Community */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Clubs & Community</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Updates from clubs and forums you follow</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">New club posts</span>
                <Switch checked={pushEnabled && newClubPosts} onCheckedChange={setNewClubPosts} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Replies to my club posts</span>
                <Switch checked={pushEnabled && clubPostReplies} onCheckedChange={setClubPostReplies} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">New forum replies</span>
                <Switch checked={pushEnabled && forumReplies} onCheckedChange={setForumReplies} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Upvotes or likes on my posts</span>
                <Switch checked={pushEnabled && postUpvotes} onCheckedChange={setPostUpvotes} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">New members joining my clubs</span>
                <Switch checked={pushEnabled && newClubMembers} onCheckedChange={setNewClubMembers} disabled={!pushEnabled} />
              </div>
            </div>
          </div>

          {/* 4. Events & Drives */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Events & Drives</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Never miss a meet or drive</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Event invitations</span>
                <Switch checked={pushEnabled && eventInvitations} onCheckedChange={setEventInvitations} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Event reminders</span>
                <Switch checked={pushEnabled && eventReminders} onCheckedChange={setEventReminders} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Event changes or cancellations</span>
                <Switch checked={pushEnabled && eventChanges} onCheckedChange={setEventChanges} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Group drive starting</span>
                <Switch checked={pushEnabled && groupDriveStarting} onCheckedChange={setGroupDriveStarting} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Group drive updates</span>
                <Switch checked={pushEnabled && groupDriveUpdates} onCheckedChange={setGroupDriveUpdates} disabled={!pushEnabled} />
              </div>
              
              <div className="pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Event reminder timing</span>
                  <Select value={reminderTiming} onValueChange={setReminderTiming} disabled={!pushEnabled}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24-hours">24 hours before</SelectItem>
                      <SelectItem value="2-hours">2 hours before</SelectItem>
                      <SelectItem value="30-mins">30 mins before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Live & Safety Alerts */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Live & Safety</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Critical alerts when it matters most</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Breakdown requests nearby</span>
                <Switch checked={pushEnabled && breakdownNearby} onCheckedChange={setBreakdownNearby} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Someone responds to my breakdown</span>
                <Switch checked={pushEnabled && breakdownResponse} onCheckedChange={setBreakdownResponse} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Friend shares live location</span>
                <Switch checked={pushEnabled && friendSharesLocation} onCheckedChange={setFriendSharesLocation} disabled={!pushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Group drive safety alerts</span>
                <Switch checked={pushEnabled && groupDriveSafety} onCheckedChange={setGroupDriveSafety} disabled={!pushEnabled} />
              </div>
              
              <p className="text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-lg p-2">
                ⚠️ These notifications are always prioritised and bypass Quiet Hours
              </p>
            </div>
          </div>

          {/* 6. Quiet Hours */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Quiet Hours</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Pause non-urgent notifications during specific times</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <span className="text-sm font-medium text-foreground">Enable Quiet Hours</span>
                <Switch checked={pushEnabled && quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} disabled={!pushEnabled} />
              </div>
              
              {quietHoursEnabled && pushEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Start time</span>
                    <Select value={quietStart} onValueChange={setQuietStart}>
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['20:00', '21:00', '22:00', '23:00', '00:00'].map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">End time</span>
                    <Select value={quietEnd} onValueChange={setQuietEnd}>
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['05:00', '06:00', '07:00', '08:00', '09:00'].map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2 border-t border-border/30">
                    <span className="text-xs font-medium text-muted-foreground">Exempt from Quiet Hours:</span>
                    <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                      <li>• Breakdown help requests</li>
                      <li>• Direct messages from friends</li>
                      <li>• Group drive alerts</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 7. Notification Digest */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Notification Digest</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Receive a summary instead of individual alerts</p>
            
            <RadioGroup value={digestFrequency} onValueChange={setDigestFrequency} className="space-y-1">
              {[
                { value: 'off', label: 'Off' },
                { value: 'daily', label: 'Daily summary' },
                { value: 'weekly', label: 'Weekly summary' },
              ].map((option) => (
                <div key={option.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50">
                  <RadioGroupItem value={option.value} id={`digest-${option.value}`} />
                  <Label htmlFor={`digest-${option.value}`} className="text-sm text-foreground cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationSettings;