import { Calendar, Route, Wrench, Users } from 'lucide-react';

interface CategoryChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showClubs?: boolean;
}

const CategoryChips = ({ activeCategory, onCategoryChange, showClubs = false }: CategoryChipsProps) => {
  const categories = [
    { id: 'events', label: 'Meets & Events', icon: Calendar, chipClass: 'category-chip-events' },
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
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`category-chip ${category.chipClass} ${isActive ? 'active shadow-md scale-105' : ''} flex items-center gap-2 whitespace-nowrap transition-all duration-200`}
          >
            <Icon className="w-4 h-4" />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
