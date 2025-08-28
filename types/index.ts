import { z } from 'zod';

// Enums
export const VisibilityEnum = z.enum(['public', 'friends', 'private']);
export const CabinClassEnum = z.enum(['economy', 'premium', 'business', 'first']);
export const TimeOfDayEnum = z.enum(['day', 'night']);
export const ImportSourceEnum = z.enum(['csv', 'tripit', 'appintheair']);
export const NotificationTypeEnum = z.enum(['flight_published', 'comment', 'like', 'follow', 'badge_earned']);
export const ReportReasonEnum = z.enum(['spam', 'inappropriate', 'harassment', 'fake']);
export const LeaderboardPeriodEnum = z.enum(['month', 'year', 'lifetime']);
export const LeaderboardScopeEnum = z.enum(['global', 'friends']);

export type Visibility = z.infer<typeof VisibilityEnum>;
export type CabinClass = z.infer<typeof CabinClassEnum>;
export type TimeOfDay = z.infer<typeof TimeOfDayEnum>;
export type ImportSource = z.infer<typeof ImportSourceEnum>;
export type NotificationType = z.infer<typeof NotificationTypeEnum>;
export type ReportReason = z.infer<typeof ReportReasonEnum>;
export type LeaderboardPeriod = z.infer<typeof LeaderboardPeriodEnum>;
export type LeaderboardScope = z.infer<typeof LeaderboardScopeEnum>;

// User Schema
export const UserStatsSchema = z.object({
  flights: z.number().default(0),
  milesKm: z.number().default(0),
  milesMi: z.number().default(0),
  hours: z.number().default(0),
  airports: z.array(z.string()).default([]),
  airlines: z.array(z.string()).default([]),
  aircraft: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  continents: z.array(z.string()).default([]),
  longest: z.object({
    flightId: z.string().optional(),
    km: z.number().default(0),
    mi: z.number().default(0),
  }).default({}),
  shortest: z.object({
    flightId: z.string().optional(),
    km: z.number().default(0),
    mi: z.number().default(0),
  }).default({}),
  topRoute: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    count: z.number().default(0),
  }).default({}),
  topAirline: z.object({
    code: z.string().optional(),
    count: z.number().default(0),
  }).default({}),
  topAirport: z.object({
    iata: z.string().optional(),
    count: z.number().default(0),
  }).default({}),
  seatClassBreakdown: z.object({
    economy: z.number().default(0),
    premium: z.number().default(0),
    business: z.number().default(0),
    first: z.number().default(0),
  }).default({}),
  dayNightRatio: z.object({
    day: z.number().default(0),
    night: z.number().default(0),
  }).default({}),
  weekdayWeekend: z.object({
    weekday: z.number().default(0),
    weekend: z.number().default(0),
  }).default({}),
  domesticInternational: z.object({
    domestic: z.number().default(0),
    international: z.number().default(0),
  }).default({}),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  homeAirportIata: z.string().optional(),
  joinedAt: z.date(),
  followingCount: z.number().default(0),
  followerCount: z.number().default(0),
  favourites: z.object({
    airlines: z.array(z.string()).default([]),
    airports: z.array(z.string()).default([]),
  }).default({}),
  xp: z.number().default(0),
  level: z.number().default(1),
  badges: z.array(z.string()).default([]),
  statsCache: z.object({
    lifetime: UserStatsSchema.default({}),
    perYear: z.record(z.string(), UserStatsSchema).default({}),
  }).default({}),
  privacy: z.object({
    defaultVisibility: VisibilityEnum.default('public'),
  }).default({}),
  roles: z.object({
    admin: z.boolean().default(false),
    moderator: z.boolean().default(false),
    verified: z.boolean().default(false),
    influencer: z.boolean().default(false),
  }).default({}),
});

// Flight Schema
export const FlightRatingsSchema = z.object({
  airline: z.number().min(1).max(5).optional(),
  aircraft: z.number().min(1).max(5).optional(),
  airportFrom: z.number().min(1).max(5).optional(),
  airportTo: z.number().min(1).max(5).optional(),
  crew: z.number().min(1).max(5).optional(),
  food: z.number().min(1).max(5).optional(),
});

export const FlightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  visibility: VisibilityEnum.default('public'),
  createdAt: z.date(),
  editedAt: z.date().optional(),
  importedFrom: ImportSourceEnum.optional(),
  fromIata: z.string().length(3),
  toIata: z.string().length(3),
  airlineCode: z.string(),
  flightNumber: z.string().optional(),
  date: z.string(), // ISO date string
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  aircraftCode: z.string().optional(),
  seat: z.string().optional(),
  cabinClass: CabinClassEnum.default('economy'),
  ratings: FlightRatingsSchema.default({}),
  reviewShort: z.string().min(1, 'Short review is required'),
  reviewLong: z.string().optional(),
  photos: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  milesKm: z.number().default(0),
  milesMi: z.number().default(0),
  hoursEstimate: z.number().default(0),
  timeOfDay: TimeOfDayEnum.optional(),
  onTime: z.boolean().optional(),
  delayMinutes: z.number().optional(),
  xpAwarded: z.number().default(0),
});

// Airport Schema
export const AirportSchema = z.object({
  iata: z.string().length(3),
  name: z.string(),
  city: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  reviewCount: z.number().default(0),
  avgRating: z.number().default(0),
  terminals: z.array(z.string()).default([]),
  timezone: z.string(),
  countryCode: z.string().length(2),
});

// Airline Schema
export const AirlineSchema = z.object({
  code: z.string(),
  name: z.string(),
  logoUrl: z.string().optional(),
  alliance: z.string().optional(),
  country: z.string(),
  reviewCount: z.number().default(0),
  avgRating: z.number().default(0),
  fleet: z.array(z.string()).default([]),
});

// Comment Schema
export const CommentSchema = z.object({
  id: z.string(),
  flightId: z.string(),
  userId: z.string(),
  body: z.string().min(1),
  createdAt: z.date(),
});

// Follow Schema
export const FollowSchema = z.object({
  followerId: z.string(),
  followeeId: z.string(),
  createdAt: z.date(),
});

// List Schema
export const ListItemSchema = z.object({
  type: z.enum(['flight', 'airport', 'airline']),
  refId: z.string(),
});

export const ListSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(ListItemSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
  likes: z.number().default(0),
  comments: z.number().default(0),
});

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeEnum,
  payload: z.record(z.any()),
  read: z.boolean().default(false),
  createdAt: z.date(),
});

// Import Schema
export const ImportSchema = z.object({
  id: z.string(),
  userId: z.string(),
  source: ImportSourceEnum,
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  importedCount: z.number().default(0),
  errors: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Report Schema
export const ReportSchema = z.object({
  id: z.string(),
  reporterId: z.string(),
  targetType: z.enum(['flight', 'comment', 'user']),
  targetId: z.string(),
  reason: ReportReasonEnum,
  createdAt: z.date(),
  status: z.enum(['pending', 'resolved', 'dismissed']).default('pending'),
});

// Badge Schema
export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  criteria: z.string(),
  tier: z.string().optional(),
});

// Leaderboard Schema
export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  value: z.number(),
  rank: z.number(),
});

export const LeaderboardSchema = z.object({
  id: z.string(),
  period: LeaderboardPeriodEnum,
  metric: z.string(),
  scope: LeaderboardScopeEnum,
  entries: z.array(LeaderboardEntrySchema),
  updatedAt: z.date(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type Flight = z.infer<typeof FlightSchema>;
export type FlightRatings = z.infer<typeof FlightRatingsSchema>;
export type Airport = z.infer<typeof AirportSchema>;
export type Airline = z.infer<typeof AirlineSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Follow = z.infer<typeof FollowSchema>;
export type List = z.infer<typeof ListSchema>;
export type ListItem = z.infer<typeof ListItemSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Import = z.infer<typeof ImportSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type Badge = z.infer<typeof BadgeSchema>;
export type Leaderboard = z.infer<typeof LeaderboardSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// Form schemas for frontend validation
export const CreateFlightSchema = FlightSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  milesKm: true,
  milesMi: true,
  hoursEstimate: true,
  timeOfDay: true,
  xpAwarded: true,
});

export const UpdateProfileSchema = UserSchema.pick({
  name: true,
  bio: true,
  homeAirportIata: true,
}).partial();

export type CreateFlightData = z.infer<typeof CreateFlightSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
