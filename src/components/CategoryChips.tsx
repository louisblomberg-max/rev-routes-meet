import { Calendar, Route, Wrench } from 'lucide-react';

interface CategoryChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  showClubs?: boolean;
}

const CategoryChips = ({ activeCategory, onCategoryChange }: CategoryChipsProps) => {
  const categories = [
    { id: null, label: 'All' },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'services', label: 'Services', icon: Wrench },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ paddingLeft: 12 }}>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id ?? 'all'}
            onClick={() => onCategoryChange(cat.id)}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 btn-press"
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              background: isActive ? '#d30d37' : '#ffffff',
              color: isActive ? '#ffffff' : '#666666',
              border: isActive ? 'none' : '0.5px solid #e8e8e0',
              transition: 'all 200ms',
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
