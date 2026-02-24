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
    <div className="inline-flex items-center bg-black/40 backdrop-blur-xl rounded-[30px] p-1 shadow-lg shadow-black/20 border border-white/10">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        const activeColorMap: Record<string, string> = {
          events: 'bg-events text-white shadow-md shadow-events/40',
          routes: 'bg-routes text-white shadow-md shadow-routes/40',
          services: 'bg-services text-white shadow-md shadow-services/40',
        };

        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-[26px] transition-all duration-200 ${
              isActive 
                ? activeColorMap[category.id] 
                : 'text-white/70 hover:text-white/90'
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] font-semibold tracking-wide whitespace-nowrap">
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
