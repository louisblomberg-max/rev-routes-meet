import { Calendar, Route, Wrench, Users } from 'lucide-react';

interface CategoryChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showClubs?: boolean;
}

const CategoryChips = ({ activeCategory, onCategoryChange, showClubs = false }: CategoryChipsProps) => {
  const categories = [
    { id: 'events', label: 'Events & Drives', icon: Calendar, chipClass: 'category-chip-events' },
    { id: 'routes', label: 'Routes', icon: Route, chipClass: 'category-chip-routes' },
    { id: 'services', label: 'Services', icon: Wrench, chipClass: 'category-chip-services' },
    ...(showClubs ? [{ id: 'clubs', label: 'Clubs', icon: Users, chipClass: 'category-chip-clubs' }] : []),
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
        
        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
              isActive 
                ? 'bg-green-500 text-white border-green-500 shadow-md' 
                : 'bg-card text-muted-foreground border-border hover:border-green-500/50 hover:bg-green-500/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium text-center leading-tight">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
