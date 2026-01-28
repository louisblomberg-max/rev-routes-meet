import { Calendar, Route, Wrench, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContributeTab = () => {
  const navigate = useNavigate();

  const options = [
    { 
      id: 'event', 
      label: 'Add Event', 
      description: 'Create a meet, cruise, or car event',
      icon: Calendar, 
      color: 'bg-events text-events-foreground',
      path: '/add/event'
    },
    { 
      id: 'route', 
      label: 'Add Route', 
      description: 'Share a scenic or twisty driving route',
      icon: Route, 
      color: 'bg-routes text-routes-foreground',
      path: '/add/route'
    },
    { 
      id: 'service', 
      label: 'Add Service', 
      description: 'List a garage, detailer, or specialist',
      icon: Wrench, 
      color: 'bg-services text-services-foreground',
      path: '/add/service'
    },
    { 
      id: 'club', 
      label: 'Add Club', 
      description: 'Start or register your car or bike club',
      icon: Users, 
      color: 'bg-clubs text-clubs-foreground',
      path: '/add/club'
    },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="p-6 pt-8">
        <h1 className="text-2xl font-bold text-foreground">Contribute</h1>
        <p className="text-sm text-muted-foreground mt-1">Add content to help the community</p>
      </div>

      {/* Options */}
      <div className="px-4 space-y-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => navigate(option.path)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold text-foreground">{option.label}</span>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContributeTab;
