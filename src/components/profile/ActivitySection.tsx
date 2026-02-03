import { Calendar, Route, MessageSquare, Users, ShoppingBag, ChevronRight } from 'lucide-react';
import { UserActivity } from '@/data/profileData';

interface ActivitySectionProps {
  activities: UserActivity[];
}

const ActivitySection = ({ activities }: ActivitySectionProps) => {
  const activityIcons: Record<UserActivity['type'], { icon: typeof Calendar; color: string }> = {
    event_attended: { icon: Calendar, color: 'text-events' },
    event_hosted: { icon: Calendar, color: 'text-events' },
    route_created: { icon: Route, color: 'text-routes' },
    route_saved: { icon: Route, color: 'text-routes' },
    forum_post: { icon: MessageSquare, color: 'text-muted-foreground' },
    forum_reply: { icon: MessageSquare, color: 'text-muted-foreground' },
    club_post: { icon: Users, color: 'text-clubs' },
    listing: { icon: ShoppingBag, color: 'text-services' },
  };

  const activityLabels: Record<UserActivity['type'], string> = {
    event_attended: 'Attended',
    event_hosted: 'Hosted',
    route_created: 'Created route',
    route_saved: 'Saved route',
    forum_post: 'Posted',
    forum_reply: 'Replied',
    club_post: 'Club post',
    listing: 'Listed',
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Recent Activity
      </h2>

      <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 5).map((activity) => {
            const { icon: Icon, color } = activityIcons[activity.type];
            return (
              <button
                key={activity.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activityLabels[activity.type]} • {activity.date}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivitySection;
