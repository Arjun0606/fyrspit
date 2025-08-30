import axios from 'axios';
import { adminDb } from './firebase-admin';

export interface EnrichInput {
  flightNo: string;
  date: string; // YYYY-MM-DD
  userId: string;
  // Optional user-provided extras
  aircraftManufacturer?: string;
  aircraftModel?: string;
  seatClass?: string; // economy/business/first/premium	narrowing skipped
}

export interface EnrichedFlight {
  flightNumber: string;
  date: string;
  airline: { code?: string; name?: string; icao?: string };
  aircraft: { manufacturer: string; model: string; needsUserInput: boolean };
  from: { iata: string; icao?: string; city?: string; country?: string; lat?: number; lon?: number };
  to:   { iata: string; icao?: string; city?: string; country?: string; lat?: number; lon?: number };
  scheduled: { departure?: string; arrival?: string; departureUtc?: string; arrivalUtc?: string };
  distanceKm: number;
  distanceMi: number;
  durationMinutes: number;
}

const CACHE_COLLECTION = 'flights_cache';
const USER_STATS_COLLECTION = 'user_stats';

const SPEED_KMH: Record<string, number> = {
  A320: 840,
  B737: 828,
  B787: 913,
  A350: 900,
  DEFAULT: 850,
};

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Remove all undefined values recursively to make Firestore writes valid
function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeForFirestore(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v === undefined) continue; // drop undefined
      out[k] = sanitizeForFirestore(v);
    }
    return out as unknown as T;
  }
  return value;
}

function inferCruiseSpeedKmH(model?: string): number {
  if (!model) return SPEED_KMH.DEFAULT;
  const m = model.toUpperCase();
  if (m.includes('A320')) return SPEED_KMH.A320;
  if (m.includes('737')) return SPEED_KMH.B737;
  if (m.includes('787')) return SPEED_KMH.B787;
  if (m.includes('A350')) return SPEED_KMH.A350;
  return SPEED_KMH.DEFAULT;
}

function keyForCache(flightNo: string, date: string): string {
  return `${flightNo.toUpperCase()}_${date}`;
}

async function getFromCache(flightNo: string, date: string): Promise<EnrichedFlight | null> {
  const id = keyForCache(flightNo, date);
  const ref = adminDb.collection(CACHE_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data) return null;
  // TTL 1 year
  const createdAt = data.createdAt?.toDate?.() ?? new Date(data.createdAt);
  if (!createdAt) return null;
  const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays > 365) return null;
  return data.payload as EnrichedFlight;
}

async function saveToCache(flightNo: string, date: string, payload: EnrichedFlight): Promise<void> {
  const id = keyForCache(flightNo, date);
  const cleanPayload = sanitizeForFirestore(payload);
  await adminDb.collection(CACHE_COLLECTION).doc(id).set({
    key: id,
    flightNo: flightNo.toUpperCase(),
    date,
    payload: cleanPayload,
    createdAt: new Date(),
  });
}

async function callAeroDataBox(flightNo: string, date: string) {
  const host = 'aerodatabox.p.rapidapi.com';
  const url = `https://${host}/flights/number/${encodeURIComponent(flightNo)}/${encodeURIComponent(date)}?withLocation=true&withAircraftImage=false`;
  const key = process.env.AERODATABOX_KEY;
  if (!key) throw new Error('AERODATABOX_KEY not configured');
  const resp = await axios.get(url, {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': host,
      'Accept': 'application/json'
    },
    timeout: 12000
  });
  return resp.data;
}

// Fallback within AeroDataBox only: fetch all instances by number, then pick the provided date
async function callAeroDataBoxByNumber(flightNo: string) {
  const host = 'aerodatabox.p.rapidapi.com';
  const url = `https://${host}/flights/number/${encodeURIComponent(flightNo)}?withLocation=true&withOperationalDays=true&withAircraftImage=false`;
  const key = process.env.AERODATABOX_KEY;
  if (!key) throw new Error('AERODATABOX_KEY not configured');
  const resp = await axios.get(url, {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': host,
      'Accept': 'application/json'
    },
    timeout: 12000
  });
  return resp.data;
}

function parseAeroDataBox(data: any, flightNo: string, date: string): EnrichedFlight | null {
  const flight = Array.isArray(data) ? data[0] : (data?.[0] || data?.flights?.[0] || data);
  if (!flight) return null;

  const airline = flight.airline || flight.marketingCarrier || {};
  const dep = flight.departure || flight.origin || {};
  const arr = flight.arrival || flight.destination || {};
  const depAirport = dep.airport || dep;
  const arrAirport = arr.airport || arr;

  const depLat = depAirport?.location?.lat || depAirport?.latitude;
  const depLon = depAirport?.location?.lon || depAirport?.longitude;
  const arrLat = arrAirport?.location?.lat || arrAirport?.latitude;
  const arrLon = arrAirport?.location?.lon || arrAirport?.longitude;

  const distanceKm = (typeof depLat === 'number' && typeof depLon === 'number' && typeof arrLat === 'number' && typeof arrLon === 'number')
    ? haversineKm(depLat, depLon, arrLat, arrLon)
    : 0;
  const distanceMi = Math.round(distanceKm * 0.621371);

  const schedDep = dep?.scheduledTimeLocal || dep?.scheduledTime || dep?.scheduled || flight?.scheduled?.departure;
  const schedArr = arr?.scheduledTimeLocal || arr?.scheduledTime || arr?.scheduled || flight?.scheduled?.arrival;
  const schedDepUtc = dep?.scheduledTimeUtc || dep?.scheduledUtc;
  const schedArrUtc = arr?.scheduledTimeUtc || arr?.scheduledUtc;

  let aircraftModel = flight.aircraft?.model || flight.aircraft?.type || '';
  let aircraftManufacturer = flight.aircraft?.manufacturer || '';
  let needsUserInput = false;
  if (!aircraftModel) { aircraftModel = 'Unknown'; needsUserInput = true; }
  if (!aircraftManufacturer) { aircraftManufacturer = 'Unknown'; needsUserInput = true; }

  // Duration
  let durationMinutes = 0;
  if (schedDep && schedArr) {
    const depD = new Date(schedDep);
    let arrD = new Date(schedArr);
    if (arrD < depD) { arrD = new Date(arrD.getTime() + 24 * 60 * 60 * 1000); }
    durationMinutes = Math.max(0, Math.round((arrD.getTime() - depD.getTime()) / (1000 * 60)));
  } else if (distanceKm > 0) {
    const speed = inferCruiseSpeedKmH(aircraftModel);
    durationMinutes = Math.round((distanceKm / speed) * 60);
  }

  const enriched: EnrichedFlight = {
    flightNumber: flightNo.toUpperCase(),
    date,
    airline: { code: airline?.iata || airline?.code || '', name: airline?.name || '', icao: airline?.icao || '' },
    aircraft: { manufacturer: aircraftManufacturer, model: aircraftModel, needsUserInput },
    from: {
      iata: depAirport?.iata || depAirport?.iataCode || dep?.iata || '',
      icao: depAirport?.icao || depAirport?.icaoCode || '',
      city: depAirport?.city || depAirport?.nameCity || depAirport?.municipalityName || depAirport?.name,
      country: depAirport?.countryName || depAirport?.country,
      lat: depLat,
      lon: depLon,
    },
    to: {
      iata: arrAirport?.iata || arrAirport?.iataCode || arr?.iata || '',
      icao: arrAirport?.icao || arrAirport?.icaoCode || '',
      city: arrAirport?.city || arrAirport?.nameCity || arrAirport?.municipalityName || arrAirport?.name,
      country: arrAirport?.countryName || arrAirport?.country,
      lat: arrLat,
      lon: arrLon,
    },
    scheduled: {
      departure: schedDep || undefined,
      arrival: schedArr || undefined,
      departureUtc: schedDepUtc || undefined,
      arrivalUtc: schedArrUtc || undefined,
    },
    distanceKm,
    distanceMi,
    durationMinutes,
  };

  return enriched;
}

async function updateUserStats(userId: string, flight: EnrichedFlight, extras?: { seatClass?: string; userProvidedAircraft?: boolean }) {
  const ref = adminDb.collection(USER_STATS_COLLECTION).doc(userId);
  const snap = await ref.get();
  const now = new Date();
  const base = snap.exists ? snap.data() || {} : {};

  const totalFlights = (base.totalFlights || 0) + 1;
  const totalMiles = Math.round((base.totalMiles || 0) + flight.distanceMi);
  const totalMinutes = Math.round((base.totalMinutes || 0) + flight.durationMinutes);

  const airports: string[] = Array.from(new Set([...(base.uniqueAirports || []), flight.from.iata, flight.to.iata].filter(Boolean)));
  const airlines: string[] = Array.from(new Set([...(base.uniqueAirlines || []), flight.airline?.name].filter(Boolean)));
  const aircraftModels: string[] = Array.from(new Set([...(base.uniqueAircraftModels || []), flight.aircraft.model].filter(Boolean)));
  const manufacturers: string[] = Array.from(new Set([...(base.uniqueManufacturers || []), flight.aircraft.manufacturer].filter(Boolean)));

  const longestDistanceMi = Math.max(base.longestDistanceMi || 0, flight.distanceMi || 0);
  const longestDurationMin = Math.max(base.longestDurationMin || 0, flight.durationMinutes || 0);

  const routeKey = `${flight.from.iata}-${flight.to.iata}`;
  const routeCounts = base.routeCounts || {};
  routeCounts[routeKey] = (routeCounts[routeKey] || 0) + 1;

  // Gamification XP
  let xpDelta = 50; // base for logging
  if (extras?.userProvidedAircraft) xpDelta += 20;
  if (extras?.seatClass) xpDelta += 10;
  const xp = (base.xp || 0) + xpDelta;

  // Badges (minimal examples)
  const badges: string[] = Array.from(new Set([...(base.badges || [])]));
  if (!badges.includes('first_flight') && totalFlights >= 1) badges.push('first_flight');
  if (!badges.includes('frequent_flyer') && totalFlights >= 50) badges.push('frequent_flyer');
  if (!badges.includes('globetrotter') && (base.uniqueCountriesCount || 0) + 0 >= 10) badges.push('globetrotter');
  if (!badges.includes('data_hero') && (base.manualAircraftEntries || 0) >= 10) badges.push('data_hero');

  const uniqueCountries = new Set<string>([...(base.uniqueCountries || [])]);
  if (flight.from.country) uniqueCountries.add(flight.from.country);
  if (flight.to.country) uniqueCountries.add(flight.to.country);

  await ref.set({
    userId,
    updatedAt: now,
    totalFlights,
    totalMiles,
    totalMinutes,
    uniqueAirports: airports,
    uniqueAirlines: airlines,
    uniqueAircraftModels: aircraftModels,
    uniqueManufacturers: manufacturers,
    uniqueCountries: Array.from(uniqueCountries),
    uniqueCountriesCount: Array.from(uniqueCountries).length,
    longestDistanceMi,
    longestDurationMin,
    routeCounts,
    xp,
    badges,
  }, { merge: true });

  // Year-in-review support: record event
  await adminDb.collection('user_events').add({
    userId,
    type: 'flight_logged',
    at: now,
    payload: sanitizeForFirestore({ flightNumber: flight.flightNumber, date: flight.date, distanceMi: flight.distanceMi, durationMinutes: flight.durationMinutes, route: routeKey })
  });

  // Mirror key stats to the user's public profile document for UI rendering
  const level = Math.floor(xp / 1000) + 1;
  await adminDb.collection('users').doc(userId).set({
    stats: {
      totalFlights,
      totalMiles,
      totalHours: Math.round(totalMinutes / 60),
      level,
      xp,
      airportsVisited: airports.length,
      countriesVisited: Array.from(uniqueCountries).length,
      aircraftTypes: aircraftModels.length,
      manufacturersUnlocked: manufacturers.length,
    }
  }, { merge: true });
}

export async function enrichFlight(input: EnrichInput): Promise<EnrichedFlight | { error: true; message: string }> {
  const { flightNo, date, userId, aircraftManufacturer, aircraftModel, seatClass } = input;
  try {
    const cached = await getFromCache(flightNo, date);
    if (cached) {
      // Do not re-update stats on cache hit (frontend may choose to)
      return cached;
    }

    const data = await callAeroDataBox(flightNo, date);
    let parsed = parseAeroDataBox(data, flightNo, date);

    // If date endpoint returned empty, query by number and select the matching date
    if (!parsed) {
      const list = await callAeroDataBoxByNumber(flightNo);
      if (Array.isArray(list) && list.length > 0) {
        // Try to find an item with scheduled date equal to requested date (YYYY-MM-DD)
        const pick = list.find((f: any) => {
          const d = f?.departure?.scheduledTimeLocal || f?.departure?.scheduledTimeUtc || f?.scheduled?.departure;
          if (!d) return false;
          const ymd = String(d).slice(0, 10);
          return ymd === date;
        }) || list[0];
        parsed = parseAeroDataBox([pick], flightNo, date);
      }
    }

    if (!parsed) return { error: true, message: 'Flight not found from AeroDataBox' };

    // Apply user-provided aircraft override
    let userProvidedAircraft = false;
    if (aircraftManufacturer || aircraftModel) {
      parsed.aircraft.manufacturer = aircraftManufacturer || parsed.aircraft.manufacturer;
      parsed.aircraft.model = aircraftModel || parsed.aircraft.model;
      parsed.aircraft.needsUserInput = false;
      userProvidedAircraft = true;
    }

    await saveToCache(flightNo, date, parsed);

    await updateUserStats(userId, parsed, { seatClass, userProvidedAircraft });

    return parsed;
  } catch (err: any) {
    return { error: true, message: err?.message || 'Failed to enrich flight' };
  }
}

export default enrichFlight;


