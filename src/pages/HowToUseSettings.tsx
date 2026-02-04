import { ArrowLeft, Map, Users, Calendar, Route, MessageSquare, Car, Star, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowToUseSettings = () => {
  const navigate = useNavigate();

  const guides = [
    {
      icon: Map,
      title: "Explore the Map",
      description: "Discover routes, events, and services near you. Use filters to find exactly what you're looking for.",
      color: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Route,
      title: "Create & Save Routes",
      description: "Plot your favorite driving routes, add waypoints, and share them with the community.",
      color: "bg-routes/10",
      iconColor: "text-routes"
    },
    {
      icon: Calendar,
      title: "Join Events",
      description: "Browse car meets, cruises, and shows. RSVP to events and get notified when they're starting.",
      color: "bg-events/10",
      iconColor: "text-events"
    },
    {
      icon: Users,
      title: "Connect with Clubs",
      description: "Join clubs that match your interests. Chat with members, share posts, and organize group drives.",
      color: "bg-clubs/10",
      iconColor: "text-clubs"
    },
    {
      icon: Car,
      title: "Build Your Garage",
      description: "Showcase your vehicles with photos and specs. Track modifications and share your builds.",
      color: "bg-muted",
      iconColor: "text-foreground"
    },
    {
      icon: MessageSquare,
      title: "Engage in Forums",
      description: "Ask questions, share advice, and discuss everything automotive with fellow enthusiasts.",
      color: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Star,
      title: "Rate & Review",
      description: "Help the community by rating routes and services. Your reviews help others find the best spots.",
      color: "bg-services/10",
      iconColor: "text-services"
    },
    {
      icon: Share2,
      title: "Share Your Experience",
      description: "Post photos, stories, and updates. Tag locations and invite friends to join your adventures.",
      color: "bg-events/10",
      iconColor: "text-events"
    },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">How to Use</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-3 pb-6 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">
          Get started with RevNet and make the most of your experience.
        </p>

        <div className="space-y-3">
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <div 
                key={index}
                className="bg-card rounded-xl border border-border/30 shadow-sm p-4"
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-lg ${guide.color} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${guide.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Getting Started Tips */}
        <div className="mt-6 bg-primary/5 rounded-xl p-4 border border-primary/20">
          <h3 className="text-sm font-semibold text-foreground mb-2">💡 Pro Tips</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• Complete your profile to connect with like-minded enthusiasts</li>
            <li>• Enable location services for the best map experience</li>
            <li>• Turn on notifications to never miss an event</li>
            <li>• Join at least one club to unlock community features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HowToUseSettings;
