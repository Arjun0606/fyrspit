import { Flight } from '@/types/flight';

export function calculateDayNightRatio(flights: Flight[]) {
  const dayFlights = flights.filter(flight => {
    const departureHour = new Date(flight.timing.scheduled.departure).getHours();
    return departureHour >= 6 && departureHour < 18; // 6 AM to 6 PM
  });

  return {
    day: dayFlights.length,
    night: flights.length - dayFlights.length,
    ratio: flights.length ? (dayFlights.length / flights.length) : 0,
    percentage: {
      day: flights.length ? Math.round((dayFlights.length / flights.length) * 100) : 0,
      night: flights.length ? Math.round(((flights.length - dayFlights.length) / flights.length) * 100) : 0
    }
  };
}

export function calculateFlightStats(flights: Flight[]) {
  const totalMiles = flights.reduce((sum, flight) => sum + (flight.route.distance || 0), 0);
  const totalHours = flights.reduce((sum, flight) => {
    const duration = flight.timing.duration.match(/(\d+)h(?:\s+(\d+)m)?/);
    if (!duration) return sum;
    const hours = parseInt(duration[1]) || 0;
    const minutes = parseInt(duration[2]) || 0;
    return sum + hours + (minutes / 60);
  }, 0);

  const uniqueAircraft = new Set(flights.map(f => `${f.aircraft.manufacturer} ${f.aircraft.model}`));
  const uniqueAirlines = new Set(flights.map(f => f.airline.code));
  const uniqueAirports = new Set([
    ...flights.map(f => f.route.from.iata),
    ...flights.map(f => f.route.to.iata)
  ]);
  const uniqueCountries = new Set([
    ...flights.map(f => f.route.from.country),
    ...flights.map(f => f.route.to.country)
  ]);

  const dayNight = calculateDayNightRatio(flights);

  // Calculate airline loyalty
  const airlineCounts = flights.reduce((acc, flight) => {
    const airline = flight.airline.code;
    acc[airline] = (acc[airline] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteAirlines = Object.entries(airlineCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([code, count]) => ({ code, count }));

  return {
    totalFlights: flights.length,
    totalMiles,
    totalHours,
    averageFlightLength: totalMiles / flights.length || 0,
    averageFlightDuration: totalHours / flights.length || 0,
    uniqueStats: {
      aircraft: uniqueAircraft.size,
      airlines: uniqueAirlines.size,
      airports: uniqueAirports.size,
      countries: uniqueCountries.size
    },
    dayNightRatio: dayNight,
    favoriteAirlines,
    achievements: calculateAchievements({
      flights: flights.length,
      miles: totalMiles,
      hours: totalHours,
      aircraft: uniqueAircraft.size,
      airlines: uniqueAirlines.size,
      airports: uniqueAirports.size,
      countries: uniqueCountries.size,
      dayNightRatio: dayNight.ratio
    })
  };
}

interface AchievementCriteria {
  flights: number;
  miles: number;
  hours: number;
  aircraft: number;
  airlines: number;
  airports: number;
  countries: number;
  dayNightRatio: number;
}

function calculateAchievements(stats: AchievementCriteria) {
  const achievements = [];

  // Flight count achievements
  if (stats.flights >= 1) achievements.push({ id: 'first_flight', name: 'First Flight', icon: '✈️' });
  if (stats.flights >= 10) achievements.push({ id: 'frequent_flyer', name: 'Frequent Flyer', icon: '🛫' });
  if (stats.flights >= 50) achievements.push({ id: 'aviation_enthusiast', name: 'Aviation Enthusiast', icon: '🛩️' });
  if (stats.flights >= 100) achievements.push({ id: 'sky_master', name: 'Sky Master', icon: '👨‍✈️' });

  // Distance achievements
  if (stats.miles >= 10000) achievements.push({ id: 'globe_trotter', name: 'Globe Trotter', icon: '🌍' });
  if (stats.miles >= 50000) achievements.push({ id: 'world_explorer', name: 'World Explorer', icon: '🗺️' });
  if (stats.miles >= 100000) achievements.push({ id: 'mile_high_club', name: 'Mile High Club', icon: '🏆' });

  // Aircraft variety achievements
  if (stats.aircraft >= 5) achievements.push({ id: 'aircraft_collector', name: 'Aircraft Collector', icon: '✈️' });
  if (stats.aircraft >= 20) achievements.push({ id: 'plane_spotter', name: 'Plane Spotter', icon: '📸' });

  // Airline achievements
  if (stats.airlines >= 5) achievements.push({ id: 'airline_explorer', name: 'Airline Explorer', icon: '🎫' });
  if (stats.airlines >= 20) achievements.push({ id: 'alliance_master', name: 'Alliance Master', icon: '🌟' });

  // Airport achievements
  if (stats.airports >= 10) achievements.push({ id: 'airport_collector', name: 'Airport Collector', icon: '🛄' });
  if (stats.airports >= 50) achievements.push({ id: 'terminal_master', name: 'Terminal Master', icon: '🏛️' });

  // Country achievements
  if (stats.countries >= 5) achievements.push({ id: 'country_hopper', name: 'Country Hopper', icon: '🗽' });
  if (stats.countries >= 20) achievements.push({ id: 'world_citizen', name: 'World Citizen', icon: '🌎' });

  // Time achievements
  if (stats.hours >= 100) achievements.push({ id: 'century_club', name: 'Century Club', icon: '⏰' });
  if (stats.hours >= 500) achievements.push({ id: 'time_lord', name: 'Time Lord', icon: '⌛' });

  // Day/Night balance achievement
  if (stats.dayNightRatio >= 0.4 && stats.dayNightRatio <= 0.6) {
    achievements.push({ id: 'day_night_balance', name: 'Day & Night Master', icon: '🌓' });
  }

  return achievements;
}

export function calculateLevel(stats: { totalFlights: number; totalMiles: number; achievements: any[] }) {
  const baseXP = stats.totalFlights * 100 + stats.totalMiles * 0.1;
  const achievementXP = stats.achievements.length * 500;
  const totalXP = baseXP + achievementXP;
  
  const level = Math.floor(Math.sqrt(totalXP / 1000)) + 1;
  const nextLevelXP = Math.pow((level) * 1000, 2);
  
  return {
    current: level,
    xp: Math.round(totalXP),
    nextLevel: level + 1,
    progress: Math.round((totalXP / nextLevelXP) * 100),
    needed: Math.round(nextLevelXP - totalXP)
  };
}
