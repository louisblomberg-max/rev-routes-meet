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

        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`flex-1 h-10 flex items-center justify-center gap-1.5 px-2 rounded-full transition-all duration-300 active:scale-95 ${
              isActive 
                ? 'bg-primary text-primary-foreground shadow-glow-blue' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
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