'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({ tags, onChange, placeholder, maxTags = 10 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only alphanumeric characters, spaces, and hyphens
    const sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-]/g, '');
    setInputValue(sanitizedValue);
  };

  const canAddMore = tags.length < maxTags;

  return (
    <div className="space-y-3">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-teal-600/20 text-teal-400 text-sm rounded-full border border-teal-600/30"
            >
              <Tag className="h-3 w-3" />
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:text-teal-300 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      {canAddMore && (
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="input w-full"
            placeholder={placeholder || "Add tags... (Press Enter or comma to add)"}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Tag className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Use tags to help others discover your flight</p>
        <p>• Press Enter or comma to add a tag</p>
        <p>• {maxTags - tags.length} tags remaining</p>
      </div>

      {/* Suggested Tags */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400">Suggested tags:</p>
        <div className="flex flex-wrap gap-2">
          {['window-seat', 'aisle-seat', 'turbulence', 'smooth-flight', 'great-views', 'delayed', 'on-time', 'upgrade', 'meal', 'entertainment'].map((suggestedTag) => (
            !tags.includes(suggestedTag) && canAddMore && (
              <button
                key={suggestedTag}
                type="button"
                onClick={() => addTag(suggestedTag)}
                className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-gray-300 transition-colors"
              >
                #{suggestedTag}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
