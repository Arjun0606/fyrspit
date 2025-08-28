'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  max?: number;
}

export function RatingStars({ label, value, onChange, max = 5 }: RatingStarsProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-1">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isActive = value !== undefined && starValue <= value;
          const isHovered = false; // We could add hover state later
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(starValue)}
              className={`transition-colors ${
                isActive || isHovered
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-gray-600 hover:text-gray-500'
              }`}
            >
              <Star
                className={`h-6 w-6 ${
                  isActive ? 'fill-current' : ''
                }`}
              />
            </button>
          );
        })}
        {value && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {value && (
        <p className="text-xs text-gray-400">
          {value} out of {max} stars
        </p>
      )}
    </div>
  );
}
