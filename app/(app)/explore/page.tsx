'use client';

import { useState } from 'react';
import { Search, TrendingUp, Users, MapPin, Plane, Star } from 'lucide-react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');

  const tabs = [
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'people', name: 'People', icon: Users },
    { id: 'places', name: 'Places', icon: MapPin },
    { id: 'airlines', name: 'Airlines', icon: Plane },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
            placeholder="Search people, places, airlines..."
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {tabs.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 flex-1 px-4 py-2 rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'trending' && <TrendingContent />}
      {activeTab === 'people' && <PeopleContent />}
      {activeTab === 'places' && <PlacesContent />}
      {activeTab === 'airlines' && <AirlinesContent />}
    </div>
  );
}

function TrendingContent() {
  return (
    <div className="space-y-6">
      {/* Trending This Week */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Trending This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TrendingCard
            title="Summer Routes"
            description="Popular vacation destinations this season"
            count="2.1k flights"
            trend="+15%"
          />
          <TrendingCard
            title="Business Class"
            description="Premium cabin experiences"
            count="847 reviews"
            trend="+8%"
          />
          <TrendingCard
            title="A350 Aircraft"
            description="Latest aircraft reviews"
            count="312 flights"
            trend="+22%"
          />
          <TrendingCard
            title="Asian Carriers"
            description="Airlines from Asia-Pacific"
            count="1.8k reviews"
            trend="+12%"
          />
        </div>
      </section>

      {/* Popular Tags */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
        <div className="flex flex-wrap gap-2">
          {['window-seat', 'upgrade', 'delayed', 'smooth-flight', 'great-views', 'turbulence', 'meal', 'entertainment', 'lounge', 'first-class'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-800 text-teal-400 text-sm rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function PeopleContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Aviation Enthusiasts</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <PersonCard
            key={i}
            name={`User ${i}`}
            bio="Aviation enthusiast and frequent flyer"
            stats="127 flights • 15 countries"
            avatar=""
          />
        ))}
      </div>
    </div>
  );
}

function PlacesContent() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-4">Popular Airports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', reviews: '2.1k' },
            { code: 'LHR', name: 'Heathrow', city: 'London', reviews: '1.8k' },
            { code: 'NRT', name: 'Narita Intl', city: 'Tokyo', reviews: '1.5k' },
            { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', reviews: '1.3k' },
          ].map((airport) => (
            <PlaceCard key={airport.code} {...airport} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AirlinesContent() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-4">Top Airlines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { code: 'SQ', name: 'Singapore Airlines', rating: 4.8, reviews: '892' },
            { code: 'EK', name: 'Emirates', rating: 4.7, reviews: '1.2k' },
            { code: 'QF', name: 'Qantas', rating: 4.6, reviews: '743' },
            { code: 'LH', name: 'Lufthansa', rating: 4.5, reviews: '987' },
          ].map((airline) => (
            <AirlineCard key={airline.code} {...airline} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TrendingCard({ title, description, count, trend }: {
  title: string;
  description: string;
  count: string;
  trend: string;
}) {
  return (
    <div className="card hover:bg-gray-800/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-green-400 text-sm font-medium">{trend}</span>
      </div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <p className="text-teal-400 text-sm">{count}</p>
    </div>
  );
}

function PersonCard({ name, bio, stats, avatar }: {
  name: string;
  bio: string;
  stats: string;
  avatar: string;
}) {
  return (
    <div className="card hover:bg-gray-800/50 transition-colors cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-gray-700 rounded-full flex items-center justify-center">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-gray-400 text-sm">{bio}</p>
          <p className="text-teal-400 text-sm">{stats}</p>
        </div>
        <button className="btn-secondary">Follow</button>
      </div>
    </div>
  );
}

function PlaceCard({ code, name, city, reviews }: {
  code: string;
  name: string;
  city: string;
  reviews: string;
}) {
  return (
    <div className="card hover:bg-gray-800/50 transition-colors cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-teal-600/20 rounded-lg flex items-center justify-center">
          <MapPin className="h-6 w-6 text-teal-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-teal-400">{code}</span>
            <span className="font-semibold">{name}</span>
          </div>
          <p className="text-gray-400 text-sm">{city}</p>
          <p className="text-gray-500 text-sm">{reviews} reviews</p>
        </div>
      </div>
    </div>
  );
}

function AirlineCard({ code, name, rating, reviews }: {
  code: string;
  name: string;
  rating: number;
  reviews: string;
}) {
  return (
    <div className="card hover:bg-gray-800/50 transition-colors cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-teal-600/20 rounded-lg flex items-center justify-center">
          <Plane className="h-6 w-6 text-teal-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-teal-400">{code}</span>
            <span className="font-semibold">{name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">{rating} • {reviews} reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}
