import { Users, Shield, ChevronRight, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClubMembership } from '@/data/profileData';

interface ClubsSectionProps {
  memberships: ClubMembership[];
}

const ClubsSection = ({ memberships }: ClubsSectionProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        My Clubs
      </h2>

      <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
        {memberships.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Not a member of any clubs</p>
          </div>
        ) : (
          memberships.map((membership) => (
            <button
              key={membership.id}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-clubs/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-clubs" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">{membership.clubName}</span>
                  {membership.role === 'admin' && (
                    <Badge className="bg-clubs/10 text-clubs border-0 gap-1 text-xs px-1.5">
                      <Shield className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Feed
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Events
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubsSection;
