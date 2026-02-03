import { Calendar, Route, Wrench } from 'lucide-react';

interface CategoryChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showClubs?: boolean;
}

const CategoryChips = ({ activeCategory, onCategoryChange }: CategoryChipsProps) => {
  const categories = [
    { 
      id: 'events', 
      label: 'Events & Drives', 
      icon: Calendar, 
    },
    { 
      id: 'routes', 
      label: 'Routes', 
      icon: Route, 
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: Wrench, 
    },
  ];

  const handleClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        const colorClasses = {
          events: isActive 
            ? 'bg-events text-events-foreground border-events shadow-lg' 
            : 'bg-card text-events border-border/50 hover:border-events/50 hover:bg-events-muted',
          routes: isActive 
            ? 'bg-routes text-routes-foreground border-routes shadow-lg' 
            : 'bg-card text-routes border-border/50 hover:border-routes/50 hover:bg-routes-muted',
          services: isActive 
            ? 'bg-services text-services-foreground border-services shadow-lg' 
            : 'bg-card text-services border-border/50 hover:border-services/50 hover:bg-services-muted',
        };
        
        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`h-11 flex items-center justify-center gap-1.5 px-2 rounded-lg border transition-all duration-200 ${
              colorClasses[category.id as keyof typeof colorClasses]
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-2xs font-bold tracking-wide whitespace-nowrap">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;