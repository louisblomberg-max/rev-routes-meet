import BackButton from '@/components/BackButton';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, any>>({});

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('user_preferences').select('push_notifications, email_notifications, notification_prefs').eq('user_id', user.id).single();
      if (data) {
        setPushEnabled(data.push_notifications ?? true);
        setEmailEnabled(data.email_notifications ?? false);
        setPrefs(typeof data.notification_prefs === 'object' && data.notification_prefs ? data.notification_prefs as Record<string, any> : {});
      }
      setIsLoading(false);
    })();
  }, [user?.id]);

  const updatePref = async (field: string, value: any) => {
    if (!user?.id) return;
    await supabase.from('user_preferences').update({ [field]: value }).eq('user_id', user.id);
  };

  const updateNotifPref = async (key: string, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    if (!user?.id) return;
    await supabase.from('user_preferences').update({ notification_prefs: updated }).eq('user_id', user.id);
  };

  const getPref = (key: string, def: any = false) => prefs[key] ?? def;

  const handlePush = (v: boolean) => { setPushEnabled(v); updatePref('push_notifications', v); };
  const handleEmail = (v: boolean) => { setEmailEnabled(v); updatePref('email_notifications', v); };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background h-dvh flex flex-col md:max-w-2xl md:mx-auto">
        <div className="px-4 pt-4 pb-2 safe-top shrink-0">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
            <h1 className="text-lg font-bold text-foreground">Notifications</h1>
          </div>
        </div>
        <div className="px-4 pt-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border/30 shadow-sm p-4 space-y-3">
              <Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /><Skeleton className="h-8 w-full" />
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
          <h1 className="text-lg font-bold text-foreground">Notifications</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-6 space-y-4">
          {/* Channels */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Notification Channels</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Choose how you receive notifications</p>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1"><span className="text-sm text-foreground">Push notifications</span><p className="text-xs text-muted-foreground">Instant alerts on your device</p></div>
                <Switch checked={pushEnabled} onCheckedChange={handlePush} />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1"><span className="text-sm text-foreground">Email notifications</span><p className="text-xs text-muted-foreground">Important updates and summaries</p></div>
                <Switch checked={emailEnabled} onCheckedChange={handleEmail} />
              </div>
              <div className="flex items-start justify-between gap-3 opacity-60">
                <div className="flex-1"><span className="text-sm text-foreground">In-app notifications</span><p className="text-xs text-muted-foreground">Shown inside the app</p></div>
                <span className="text-xs text-muted-foreground font-medium">Always on</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Social Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Stay updated on friends and community interactions</p>
            <div className="space-y-3">
              {[
                { key: 'new_friend_requests', label: 'New friend requests' },
                { key: 'friend_accepts', label: 'Friend accepts request' },
                { key: 'new_messages', label: 'New messages' },
                { key: 'message_reactions', label: 'Message reactions / replies' },
                { key: 'mentions_in_discussions', label: 'Mentions or replies in discussions' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Switch checked={getPref(item.key)} onCheckedChange={v => updateNotifPref(item.key, v)} disabled={!pushEnabled} />
                </div>
              ))}
            </div>
          </div>

          {/* Clubs & Community */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Clubs & Community</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Updates from clubs and forums you follow</p>
            <div className="space-y-3">
              {[
                { key: 'new_club_posts', label: 'New club posts' },
                { key: 'replies_to_club_posts', label: 'Replies to my club posts' },
                { key: 'new_forum_replies', label: 'New forum replies' },
                { key: 'upvotes_on_posts', label: 'Upvotes or likes on my posts' },
                { key: 'new_members_joining_clubs', label: 'New members joining my clubs' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Switch checked={getPref(item.key)} onCheckedChange={v => updateNotifPref(item.key, v)} disabled={!pushEnabled} />
                </div>
              ))}
            </div>
          </div>

          {/* Events & Drives */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Events & Drives</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Never miss a meet or drive</p>
            <div className="space-y-3">
              {[
                { key: 'event_invitations', label: 'Event invitations' },
                { key: 'event_reminders', label: 'Event reminders' },
                { key: 'event_changes', label: 'Event changes or cancellations' },
                { key: 'group_drive_starting', label: 'Group drive starting' },
                { key: 'group_drive_updates', label: 'Group drive updates' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Switch checked={getPref(item.key)} onCheckedChange={v => updateNotifPref(item.key, v)} disabled={!pushEnabled} />
                </div>
              ))}
              <div className="pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Event reminder timing</span>
                  <Select value={getPref('event_reminder_timing', '2_hours')} onValueChange={v => updateNotifPref('event_reminder_timing', v)} disabled={!pushEnabled}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24_hours">24 hours before</SelectItem>
                      <SelectItem value="2_hours">2 hours before</SelectItem>
                      <SelectItem value="30_mins">30 mins before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Live & Safety */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Live & Safety</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Critical alerts when it matters most</p>
            <div className="space-y-3">
              {[
                { key: 'breakdown_requests_nearby', label: 'Breakdown requests nearby' },
                { key: 'someone_responds_to_breakdown', label: 'Someone responds to my breakdown' },
                { key: 'friend_shares_live_location', label: 'Friend shares live location' },
                { key: 'group_drive_safety_alerts', label: 'Group drive safety alerts' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Switch checked={getPref(item.key, true)} onCheckedChange={v => updateNotifPref(item.key, v)} disabled={!pushEnabled} />
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-lg p-2">⚠️ These notifications are always prioritised and bypass Quiet Hours</p>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className={`bg-card rounded-xl border border-border/30 shadow-sm p-4 ${!pushEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-foreground">Quiet Hours</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Pause non-urgent notifications during specific times</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <span className="text-sm font-medium text-foreground">Enable Quiet Hours</span>
                <Switch checked={getPref('quiet_hours_enabled')} onCheckedChange={v => updateNotifPref('quiet_hours_enabled', v)} disabled={!pushEnabled} />
              </div>
            </div>
          </div>

          {/* Digest */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-foreground">Notification Digest</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Receive a summary instead of individual alerts</p>
            <RadioGroup value={getPref('notification_digest', 'off')} onValueChange={v => updateNotifPref('notification_digest', v)} className="space-y-1">
              {[{ value: 'off', label: 'Off' }, { value: 'daily', label: 'Daily summary' }, { value: 'weekly', label: 'Weekly summary' }].map(o => (
                <div key={o.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50">
                  <RadioGroupItem value={o.value} id={`digest-${o.value}`} />
                  <Label htmlFor={`digest-${o.value}`} className="text-sm text-foreground cursor-pointer">{o.label}</Label>
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
