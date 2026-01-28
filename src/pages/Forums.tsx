import { ArrowLeft, Search, MessageSquare, Wrench, AlertCircle, Flag, Shield, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const Forums = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 'general', name: 'General', icon: MessageSquare, color: 'bg-muted', textColor: 'text-foreground' },
    { id: 'mods', name: 'Mods & Tuning', icon: Wrench, color: 'bg-routes', textColor: 'text-white' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle, color: 'bg-events', textColor: 'text-white' },
    { id: 'track', name: 'Track & Motorsport', icon: Flag, color: 'bg-clubs', textColor: 'text-white' },
    { id: 'insurance', name: 'Insurance', icon: Shield, color: 'bg-services', textColor: 'text-foreground' },
    { id: 'buying', name: 'Buying & Selling Advice', icon: DollarSign, color: 'bg-primary', textColor: 'text-primary-foreground' },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 safe-top sticky top-0 bg-background z-10">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-border/50"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Advice & Forums</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search questions, topics"
            className="pl-10 bg-card border-border/50"
          />
        </div>
      </div>

      {/* Category Tiles */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className={`${category.color} rounded-xl p-5 text-left transition-transform hover:scale-[1.02] active:scale-[0.98]`}
              >
                <Icon className={`w-7 h-7 ${category.textColor} mb-3`} />
                <h3 className={`font-semibold ${category.textColor}`}>{category.name}</h3>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Forums;
