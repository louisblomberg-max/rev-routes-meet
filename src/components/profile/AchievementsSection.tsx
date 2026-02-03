import { HeartHandshake, Map, Users, CalendarCheck, Lock } from 'lucide-react';
import { Achievement } from '@/data/profileData';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const iconMap: Record<string, typeof HeartHandshake> = {
  'heart-handshake': HeartHandshake,
  'map': Map,
  'users': Users,
  'calendar-check': CalendarCheck,
};

const AchievementsSection = ({ achievements }: AchievementsSectionProps) => {
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Achievements ({earnedCount}/{achievements.length})
      </h2>

      <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden p-4">
        <div className="grid grid-cols-4 gap-3">
          {achievements.map((achievement) => {
            const Icon = iconMap[achievement.icon] || HeartHandshake;
            return (
              <div
                key={achievement.id}
                className="flex flex-col items-center gap-1.5"
                title={achievement.description}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-events/20 to-primary/10 border border-events/30'
                    : 'bg-muted/50 border border-border/30'
                }`}>
                  {achievement.earned ? (
                    <Icon className="w-6 h-6 text-events" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground/50" />
                  )}
                </div>
                <span className={`text-xs text-center line-clamp-1 ${
                  achievement.earned ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {achievement.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsSection;
