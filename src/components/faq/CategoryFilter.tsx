
import React from 'react';
import { Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Tag className="h-4 w-4 mr-2 text-chatbot-primary" />
        <h3 className="text-sm font-medium text-gray-700">Filtrar por categoria</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3 py-1 text-sm rounded-full ${
            selectedCategory === null
              ? 'bg-chatbot-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedCategory === category.id
                ? 'bg-chatbot-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
