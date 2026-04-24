import { MapPin, Users, Car, AlertTriangle, Wrench, Heart, MessageSquare, Route, Plus, ChevronRight, Radio, Clock, Navigation } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const SocialDiscoverySettings = () => {
  const navigate = useNavigate();

  const liveActivities = [
    {
      id: '1',
      type: 'group-drive',
      icon: Car,
      color: 'text-routes',
      bgColor: 'bg-routes/10',
      title: '3 drivers on a group drive near you',
      distance: '1.2 miles',
      status: 'Live',
    },
    {
      id: '2',
      type: 'breakdown',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      title: 'Breakdown help requested',
      distance: '2.1 miles',
      status: 'Live',
    },
    {
      id: '3',
      type: 'club',
      icon: Users,
      color: 'text-events',
      bgColor: 'bg-events/10',
      title: 'South Coast Porsche Club active now',
      distance: '3.4 miles',
      status: 'Live',
    },
    {
      id: '4',
      type: 'event',
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      title: 'Evening drive-out starting in 45 minutes',
      distance: '5.8 miles',
      status: 'Starting soon',
    },
  ];

  const peopleCategories = [
    { id: 'friends', label: 'Friends', count: 24 },
    { id: 'nearby', label: 'Nearby drivers', count: 8 },
    { id: 'recent', label: 'Recently interacted', count: 12 },
  ];

  const groupDrives = [
    {
      id: '1',
      name: 'Cotswolds Sunday Run',
      participants: 7,
      startTime: 'Today, 2:00 PM',
      vehicleType: 'Cars',
    },
    {
      id: '2',
      name: 'Peak District Twisties',
      participants: 12,
      startTime: 'Tomorrow, 10:00 AM',
      vehicleType: 'Mixed',
    },
    {
      id: '3',
      name: 'Night Cruise M25',
      participants: 5,
      startTime: 'Sat, 9:00 PM',
      vehicleType: 'Cars',
    },
  ];

  const clubsActivity = [
    {
      id: '1',
      name: 'BMW Enthusiasts UK',
      announcement: 'Summer meet confirmed for July 15th!',
      upcomingEvent: 'Track Day - Brands Hatch',
    },
    {
      id: '2',
      name: 'Porsche Club GB',
      announcement: 'New member discount at Euro Specialists',
      upcomingEvent: 'Monthly Coffee Meet',
    },
  ];

  return (
    <div className="mobile-container bg-background min-h-dvh flex flex-col pb-6 md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Social & Discovery</h1>
            <p className="text-xs text-muted-foreground">Connect with people, drives, and activity around you</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 space-y-6 pt-4">
        {/* 1️⃣ Live Activity */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            Live nearby activity
          </h2>
          <div className="space-y-2">
            {liveActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <Card key={activity.id} className="border-border/30 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{activity.distance}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 2️⃣ Friends & People */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            People
          </h2>
          <Card className="border-border/30 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/30">
              {peopleCategories.map((category) => (
                <button
                  key={category.id}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{category.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* 3️⃣ Group Drives & Social Routes */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            Group drives
          </h2>
          <div className="space-y-2">
            {groupDrives.map((drive) => (
              <Card key={drive.id} className="border-border/30 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{drive.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{drive.startTime}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{drive.vehicleType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{drive.participants} participants</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                        View route
                      </Button>
                      <Button size="sm" className="h-7 text-xs px-2">
                        Join drive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 4️⃣ Help & Community Support */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Help & support
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/30 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">I need help</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Breakdown, tools, mechanical advice
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/30 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-routes/10 flex items-center justify-center mx-auto mb-2">
                  <Wrench className="w-6 h-6 text-routes" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">I can help</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Offer tools, skills, or respond nearby
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5️⃣ Clubs Activity Snapshot */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Clubs you follow
          </h2>
          <div className="space-y-2">
            {clubsActivity.map((club) => (
              <Card key={club.id} className="border-border/30 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-clubs/10 text-clubs text-xs font-semibold">
                        {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{club.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{club.announcement}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">{club.upcomingEvent}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 6️⃣ Entry Points */}
        <section className="pb-2">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <MessageSquare className="w-5 h-5" />
              <span className="text-[11px] font-medium">Start chat</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Route className="w-5 h-5" />
              <span className="text-[11px] font-medium">Group drive</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Plus className="w-5 h-5" />
              <span className="text-[11px] font-medium">Post</span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialDiscoverySettings;
