import { Calendar, Route, Wrench } from 'lucide-react';

interface CategoryChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showClubs?: boolean;
}

const CategoryChips = ({ activeCategory, onCategoryChange }: CategoryChipsProps) => {
  const categories = [
    { id: 'events', label: 'Events & Drives', icon: Calendar },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'services', label: 'Services', icon: Wrench },
  ];

  const handleClick = (categoryId: string) => {
    onCategoryChange(activeCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="flex gap-2 w-full">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        const activeStyles: Record<string, string> = {
          events: 'bg-events/90 text-white border-2 border-black shadow-[0_4px_16px_-2px] shadow-events/40',
          routes: 'bg-routes/90 text-white border-2 border-black shadow-[0_4px_16px_-2px] shadow-routes/40',
          services: 'bg-services/90 text-white border-2 border-black shadow-[0_4px_16px_-2px] shadow-services/40',
        };

        const inactiveStyles: Record<string, string> = {
          events: 'bg-events/15 backdrop-blur-md text-events border-events/30 shadow-sm hover:shadow-md hover:bg-events/25',
          routes: 'bg-routes/15 backdrop-blur-md text-routes border-routes/30 shadow-sm hover:shadow-md hover:bg-routes/25',
          services: 'bg-services/15 backdrop-blur-md text-services border-services/30 shadow-sm hover:shadow-md hover:bg-services/25',
        };

        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`flex-1 h-10 flex items-center justify-center gap-1.5 px-2 rounded-xl border transition-all duration-300 active:scale-95 ${
              isActive ? activeStyles[category.id] : inactiveStyles
            }`}
          >
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
            <span className={`text-[11px] font-semibold tracking-wide whitespace-nowrap ${isActive ? 'text-white' : ''}`}>
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
