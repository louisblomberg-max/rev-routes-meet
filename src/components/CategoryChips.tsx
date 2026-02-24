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
    <div className="inline-flex items-center bg-white/15 backdrop-blur-2xl rounded-full p-[3px] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/20">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        const activeColorMap: Record<string, string> = {
          events: 'bg-events text-white shadow-[0_2px_12px_-2px] shadow-events/50',
          routes: 'bg-routes text-white shadow-[0_2px_12px_-2px] shadow-routes/50',
          services: 'bg-services text-white shadow-[0_2px_12px_-2px] shadow-services/50',
        };

        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all duration-300 ease-out ${
              isActive 
                ? activeColorMap[category.id] 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
            <span className={`text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${isActive ? 'tracking-[0.1em]' : ''}`}>
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
