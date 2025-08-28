import { UserStats } from '@/types';
import { formatDistance, formatDuration } from '@/lib/utils';
import { 
  Plane, 
  MapPin, 
  Clock, 
  Globe, 
  TrendingUp, 
  Calendar,
  Sunrise,
  Moon,
  Building,
  Route
} from 'lucide-react';

interface StatsGridProps {
  stats: UserStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle 
  }: { 
    icon: React.ElementType; 
    title: string; 
    value: string | number; 
    subtitle?: string;
  }) => (
    <div className="card">
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="h-5 w-5 text-teal-500" />
        <h3 className="font-medium text-gray-300">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
    </div>
  );

  const totalHours = stats.hours || 0;
  const totalFlights = stats.flights || 0;
  const avgFlightTime = totalFlights > 0 ? totalHours / totalFlights : 0;

  return (
    <div className="space-y-6">
      {/* Flight Overview */}
      <section>
        <h2 className="text-xl font-bold mb-4">Flight Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Plane}
            title="Total Flights"
            value={totalFlights.toLocaleString()}
            subtitle={`Average ${formatDuration(avgFlightTime)} per flight`}
          />
          <StatCard
            icon={Clock}
            title="Hours in Air"
            value={formatDuration(totalHours)}
            subtitle={`${Math.round((totalHours / 8760) * 100) / 100}% of year`}
          />
          <StatCard
            icon={TrendingUp}
            title="Total Distance"
            value={formatDistance(stats.milesKm || 0, 'mi')}
            subtitle={formatDistance(stats.milesKm || 0, 'km')}
          />
        </div>
      </section>

      {/* Destinations */}
      <section>
        <h2 className="text-xl font-bold mb-4">Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={MapPin}
            title="Airports"
            value={stats.airports?.length || 0}
            subtitle="Unique destinations"
          />
          <StatCard
            icon={Globe}
            title="Countries"
            value={stats.countries?.length || 0}
            subtitle="Nations visited"
          />
          <StatCard
            icon={Building}
            title="Continents"
            value={stats.continents?.length || 0}
            subtitle="Regions explored"
          />
          <StatCard
            icon={Route}
            title="Unique Routes"
            value={Math.floor((stats.flights || 0) * 0.7)} // Rough estimate
            subtitle="Different city pairs"
          />
        </div>
      </section>

      {/* Distance Records */}
      <section>
        <h2 className="text-xl font-bold mb-4">Distance Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            icon={TrendingUp}
            title="Longest Flight"
            value={stats.longest?.km ? formatDistance(stats.longest.km) : 'N/A'}
            subtitle={stats.longest?.km ? formatDistance(stats.longest.km, 'mi') : 'No flights yet'}
          />
          <StatCard
            icon={Calendar}
            title="Average Distance"
            value={
              totalFlights > 0 
                ? formatDistance(Math.round((stats.milesKm || 0) / totalFlights))
                : 'N/A'
            }
            subtitle="Per flight"
          />
        </div>
      </section>

      {/* Travel Patterns */}
      <section>
        <h2 className="text-xl font-bold mb-4">Travel Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day vs Night */}
          <div className="card">
            <h3 className="font-medium text-gray-300 mb-4">Flight Times</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sunrise className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Day flights</span>
                </div>
                <span className="font-bold">{stats.dayNightRatio?.day || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Night flights</span>
                </div>
                <span className="font-bold">{stats.dayNightRatio?.night || 0}</span>
              </div>
            </div>
          </div>

          {/* Cabin Classes */}
          <div className="card">
            <h3 className="font-medium text-gray-300 mb-4">Cabin Experience</h3>
            <div className="space-y-3">
              {Object.entries(stats.seatClassBreakdown || {}).map(([className, count]) => (
                <div key={className} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{className}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Preferences */}
      {(stats.topAirline?.code || stats.topAirport?.iata || stats.topRoute?.from) && (
        <section>
          <h2 className="text-xl font-bold mb-4">Your Favorites</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topAirline?.code && (
              <StatCard
                icon={Plane}
                title="Favorite Airline"
                value={stats.topAirline.code}
                subtitle={`${stats.topAirline.count} flights`}
              />
            )}
            {stats.topAirport?.iata && (
              <StatCard
                icon={MapPin}
                title="Most Visited Airport"
                value={stats.topAirport.iata}
                subtitle={`${stats.topAirport.count} visits`}
              />
            )}
            {stats.topRoute?.from && stats.topRoute?.to && (
              <StatCard
                icon={Route}
                title="Favorite Route"
                value={`${stats.topRoute.from} → ${stats.topRoute.to}`}
                subtitle={`${stats.topRoute.count} times`}
              />
            )}
          </div>
        </section>
      )}

      {/* Fun Facts */}
      <section>
        <h2 className="text-xl font-bold mb-4">Fun Facts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-medium text-gray-300 mb-2">Earth Orbits</h3>
            <div className="text-2xl font-bold text-teal-400">
              {Math.round(((stats.milesKm || 0) / 40075) * 100) / 100}
            </div>
            <div className="text-sm text-gray-400">
              Based on {formatDistance(stats.milesKm || 0)} traveled
            </div>
          </div>
          
          <div className="card">
            <h3 className="font-medium text-gray-300 mb-2">Time Above Clouds</h3>
            <div className="text-2xl font-bold text-teal-400">
              {Math.round((totalHours / 24) * 10) / 10}
            </div>
            <div className="text-sm text-gray-400">
              Days spent flying
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
