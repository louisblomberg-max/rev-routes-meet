import { Calendar, Route, Wrench, Users } from 'lucide-react';

interface CategoryChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showClubs?: boolean;
}

const CategoryChips = ({ activeCategory, onCategoryChange, showClubs = false }: CategoryChipsProps) => {
  const categories = [
    { 
      id: 'events', 
      label: 'Events & Drives', 
      icon: Calendar, 
      activeClass: 'bg-[#7B1E22]/80 text-white border-[#7B1E22]/80',
      hoverClass: 'hover:border-[#7B1E22]/50 hover:bg-[#7B1E22]/10'
    },
    { 
      id: 'routes', 
      label: 'Routes', 
      icon: Route, 
      activeClass: 'bg-[#1E40AF]/80 text-white border-[#1E40AF]/80',
      hoverClass: 'hover:border-[#1E40AF]/50 hover:bg-[#1E40AF]/10'
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: Wrench, 
      activeClass: 'bg-[#B45309]/80 text-white border-[#B45309]/80',
      hoverClass: 'hover:border-[#B45309]/50 hover:bg-[#B45309]/10'
    },
    ...(showClubs ? [{ 
      id: 'clubs', 
      label: 'Clubs', 
      icon: Users, 
      activeClass: 'bg-[#6B21A8]/80 text-white border-[#6B21A8]/80',
      hoverClass: 'hover:border-[#6B21A8]/50 hover:bg-[#6B21A8]/10'
    }] : []),
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
                ? `${category.activeClass} shadow-md` 
                : `bg-card text-muted-foreground border-border ${category.hoverClass}`
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
