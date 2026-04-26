import { Calendar, Route, Wrench } from 'lucide-react';

interface CategoryChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showClubs?: boolean;
}

const CategoryChips = ({ activeCategory, onCategoryChange }: CategoryChipsProps) => {
  const categories = [
    { id: 'events', label: 'Events', icon: Calendar },
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
          events: 'bg-events text-white border-events shadow-[0_4px_16px_rgba(211,13,55,0.35)]',
          routes: 'bg-routes text-white border-routes shadow-[0_4px_16px_rgba(79,127,255,0.35)]',
          services: 'bg-services text-white border-services shadow-[0_4px_16px_rgba(255,128,0,0.35)]',
        };

        const inactiveStyles = 'bg-white/95 backdrop-blur-md text-foreground border-white/40 hover:bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]';

        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`flex-1 h-11 flex items-center justify-center gap-1.5 px-2 rounded-2xl border transition-colors duration-200 active:scale-95 ${
              isActive ? activeStyles[category.id] : inactiveStyles
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
            <span className={`text-[13px] tracking-wide whitespace-nowrap ${isActive ? 'font-bold text-white' : 'font-semibold'}`}>
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
