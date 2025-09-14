import React, { useState } from 'react';
import {
  Input,
  Button,
  SpaceBetween,
  Box
} from '@cloudscape-design/components';

interface SearchWithFiltersProps {
  placeholder: string;
  categories: string[];
  onSearch: (query: string, category?: string) => void;
  onClear: () => void;
}

export default function SearchWithFilters({
  placeholder,
  categories,
  onSearch,
  onClear
}: SearchWithFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = () => {
    onSearch(searchQuery, selectedCategory || undefined);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    if (searchQuery) {
      onSearch(searchQuery, newCategory || undefined);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    onClear();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SpaceBetween size="s">
      <SpaceBetween direction="horizontal" size="s">
        <Input
          placeholder={placeholder}
          type="search"
          value={searchQuery}
          onChange={({ detail }) => setSearchQuery(detail.value)}
          onKeyPress={handleKeyPress}
        />
        <Button 
          variant="primary" 
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
        >
          Search
        </Button>
        {(searchQuery || selectedCategory) && (
          <Button 
            variant="normal" 
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </SpaceBetween>
      
      {categories.length > 0 && (
        <SpaceBetween direction="horizontal" size="s">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'normal'}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Button>
          ))}
        </SpaceBetween>
      )}
    </SpaceBetween>
  );
}