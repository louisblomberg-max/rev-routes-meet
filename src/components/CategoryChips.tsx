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
      activeClass: 'bg-[#1B4D3E]/80 text-white border-[#1B4D3E]/80',
      hoverClass: 'hover:border-[#1B4D3E]/50 hover:bg-[#1B4D3E]/10'
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
            className={`h-12 flex items-center justify-center gap-2 px-3 rounded-2xl border transition-all duration-300 ${
              isActive 
                ? `${category.activeClass} shadow-lg scale-[1.02]` 
                : `bg-white/90 backdrop-blur-sm text-muted-foreground border-white/50 shadow-md ${category.hoverClass} hover:scale-[1.02]`
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-[11px] font-semibold leading-tight truncate">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
