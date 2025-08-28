'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface AirportAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Mock airport data - in a real app, this would come from an API
const mockAirports: Airport[] = [
  { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  { iata: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
  { iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States' },
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  { iata: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  { iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
];

export function AirportAutocomplete({ value, onChange, placeholder }: AirportAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const airport = mockAirports.find(a => a.iata === value);
      if (airport) {
        setSelectedAirport(airport);
        setQuery(`${airport.iata} - ${airport.name}`);
      }
    }
  }, [value]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockAirports.filter(airport =>
        airport.iata.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase()) ||
        airport.city.toLowerCase().includes(query.toLowerCase()) ||
        airport.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setFilteredAirports(filtered);
    } else {
      setFilteredAirports([]);
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

  const handleSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    setQuery(`${airport.iata} - ${airport.name}`);
    onChange(airport.iata);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    if (!newQuery) {
      setSelectedAirport(null);
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
          placeholder={placeholder || "Search airports..."}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && filteredAirports.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredAirports.map((airport) => (
            <button
              key={airport.iata}
              onClick={() => handleSelect(airport)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-teal-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-teal-400">{airport.iata}</span>
                    <span className="text-gray-300 truncate">{airport.name}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {airport.city}, {airport.country}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
