'use client';

import { useState, useEffect } from 'react';

interface WordFilterProps {
  onFilterChange: (filters: string[]) => void;
}

export default function WordFilter({ onFilterChange }: WordFilterProps) {
  const [filterText, setFilterText] = useState<string>('');
  const [filterWords, setFilterWords] = useState<string[]>(['abuse']);

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange(filterWords);
  }, [filterWords, onFilterChange]);

  const handleAddFilter = () => {
    if (filterText.trim() && !filterWords.includes(filterText.trim().toLowerCase())) {
      const newFilters = [...filterWords, filterText.trim().toLowerCase()];
      setFilterWords(newFilters);
      setFilterText('');
    }
  };

  const handleRemoveFilter = (word: string) => {
    setFilterWords(filterWords.filter(w => w !== word));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFilter();
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Highlight Comments with Words:</h3>
      
      <div className="flex items-center mb-3">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add word to filter"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleAddFilter}
        >
          Add
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filterWords.map((word) => (
          <div key={word} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
            <span>{word}</span>
            <button
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={() => handleRemoveFilter(word)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 