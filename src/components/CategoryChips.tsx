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
          events: 'bg-events text-white border-events',
          routes: 'bg-routes text-white border-routes',
          services: 'bg-services text-white border-services',
        };

        const inactiveStyles = 'bg-[#FAFAFA] text-foreground border-[#E5E5E5] hover:bg-white';

        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`flex-1 h-10 flex items-center justify-center gap-1.5 px-2 rounded-xl border-2 transition-colors duration-200 active:scale-95 ${
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
