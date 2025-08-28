'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plane } from 'lucide-react';

interface Airline {
  code: string;
  name: string;
  country: string;
  alliance?: string;
}

interface AirlineAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Mock airline data - in a real app, this would come from an API
const mockAirlines: Airline[] = [
  { code: 'AA', name: 'American Airlines', country: 'United States', alliance: 'Oneworld' },
  { code: 'UA', name: 'United Airlines', country: 'United States', alliance: 'Star Alliance' },
  { code: 'DL', name: 'Delta Air Lines', country: 'United States', alliance: 'SkyTeam' },
  { code: 'BA', name: 'British Airways', country: 'United Kingdom', alliance: 'Oneworld' },
  { code: 'LH', name: 'Lufthansa', country: 'Germany', alliance: 'Star Alliance' },
  { code: 'AF', name: 'Air France', country: 'France', alliance: 'SkyTeam' },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore', alliance: 'Star Alliance' },
  { code: 'EK', name: 'Emirates', country: 'United Arab Emirates' },
  { code: 'QF', name: 'Qantas', country: 'Australia', alliance: 'Oneworld' },
  { code: 'JL', name: 'Japan Airlines', country: 'Japan', alliance: 'Oneworld' },
  { code: 'NH', name: 'All Nippon Airways', country: 'Japan', alliance: 'Star Alliance' },
  { code: 'CX', name: 'Cathay Pacific', country: 'Hong Kong', alliance: 'Oneworld' },
  { code: 'TK', name: 'Turkish Airlines', country: 'Turkey', alliance: 'Star Alliance' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines', country: 'Netherlands', alliance: 'SkyTeam' },
  { code: 'VS', name: 'Virgin Atlantic', country: 'United Kingdom' },
];

export function AirlineAutocomplete({ value, onChange, placeholder }: AirlineAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAirlines, setFilteredAirlines] = useState<Airline[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const airline = mockAirlines.find(a => a.code === value);
      if (airline) {
        setSelectedAirline(airline);
        setQuery(`${airline.code} - ${airline.name}`);
      }
    }
  }, [value]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockAirlines.filter(airline =>
        airline.code.toLowerCase().includes(query.toLowerCase()) ||
        airline.name.toLowerCase().includes(query.toLowerCase()) ||
        airline.country.toLowerCase().includes(query.toLowerCase()) ||
        (airline.alliance && airline.alliance.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8);
      setFilteredAirlines(filtered);
    } else {
      setFilteredAirlines([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airline: Airline) => {
    setSelectedAirline(airline);
    setQuery(`${airline.code} - ${airline.name}`);
    onChange(airline.code);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    if (!newQuery) {
      setSelectedAirline(null);
      onChange('');
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="input w-full pl-10"
          placeholder={placeholder || "Search airlines..."}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && filteredAirlines.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredAirlines.map((airline) => (
            <button
              key={airline.code}
              onClick={() => handleSelect(airline)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <Plane className="h-4 w-4 text-teal-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-teal-400">{airline.code}</span>
                    <span className="text-gray-300 truncate">{airline.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{airline.country}</span>
                    {airline.alliance && (
                      <>
                        <span>•</span>
                        <span>{airline.alliance}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
