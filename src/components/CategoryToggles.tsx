import { Calendar, Route, Wrench, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface CategoryTogglesProps {
  activeCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const CategoryToggles = ({ activeCategories, onCategoriesChange }: CategoryTogglesProps) => {
  const categories = [
    { id: 'events', label: 'Meets & Events', icon: Calendar, chipClass: 'category-chip-events' },
    { id: 'routes', label: 'Routes', icon: Route, chipClass: 'category-chip-routes' },
    { id: 'services', label: 'Services', icon: Wrench, chipClass: 'category-chip-services' },
    { id: 'clubs', label: 'Clubs', icon: Users, chipClass: 'category-chip-clubs' },
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
          <button
            key={category.id}
            onClick={() => handleToggle(category.id)}
            className={`category-chip ${category.chipClass} ${isActive ? 'active' : ''} flex-1 flex items-center justify-center gap-1 whitespace-nowrap px-2 py-1.5`}
          >
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-medium">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryToggles;
