import { Calendar, Route, Wrench, SlidersHorizontal } from 'lucide-react';

interface CategoryTogglesProps {
  activeCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  onFilterClick?: (category: string) => void;
}

const CategoryToggles = ({ activeCategories, onCategoriesChange, onFilterClick }: CategoryTogglesProps) => {
  const categories = [
    { id: 'events', label: 'Meets & Events', icon: Calendar, chipClass: 'category-chip-events' },
    { id: 'routes', label: 'Routes', icon: Route, chipClass: 'category-chip-routes' },
    { id: 'services', label: 'Services', icon: Wrench, chipClass: 'category-chip-services' },
  ];

  const handleToggle = (categoryId: string) => {
    if (activeCategories.includes(categoryId)) {
      onCategoriesChange(activeCategories.filter(c => c !== categoryId));
    } else {
      onCategoriesChange([...activeCategories, categoryId]);
    }
  };

  return (
    <div className="flex gap-1 w-full">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategories.includes(category.id);
        
        return (
          <div key={category.id} className="flex-1 flex items-center gap-0.5">
            <button
              onClick={() => handleToggle(category.id)}
              className={`category-chip ${category.chipClass} ${isActive ? 'active' : ''} flex-1 flex items-center justify-center gap-1 whitespace-nowrap px-2 py-1.5`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-[10px] font-medium">{category.label}</span>
            </button>
            {isActive && onFilterClick && (
              <button
                onClick={() => onFilterClick(category.id)}
                className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryToggles;
