# ✈️ Fyrspit - The Social Diary for Flying  https://fyrspit.com/

> Log flights. Tell your story. Discover the culture of flying.

Fyrspit is a social network for aviation enthusiasts that combines flight logging with social features, gamification, and community-driven content. Think of it as "Letterboxd for flights" - a platform where you can track your aviation journey, review airlines and airports, share experiences with photos and stories, and connect with fellow travelers.

## 🎯 Product Vision

Fyrspit is designed for aviation enthusiasts who want to:
- **Document their flying experiences** with rich media and detailed reviews
- **Connect with like-minded travelers** and discover new routes and destinations  
- **Build their aviation identity** through stats, achievements, and social presence
- **Share knowledge** about airlines, airports, aircraft, and travel experiences

## ✨ Key Features

### 🛫 Flight Logging
- **Rich Flight Entries**: Log flights with photos, ratings, reviews, and metadata
- **Comprehensive Ratings**: Rate airlines, aircraft, airports, crew, and food
- **Photo Sharing**: Upload up to 6 photos per flight with Cloudinary integration
- **Smart Data**: Automatic distance calculation, flight time estimation, and XP rewards

### 👥 Social Features
- **Feed & Discovery**: Follow other users and see their latest flight experiences
- **Comments & Likes**: Engage with community content
- **User Profiles**: Showcase your aviation journey and statistics
- **Lists**: Create and share curated collections (planned)

### 🏆 Gamification
- **XP System**: Earn experience points based on distance, cabin class, photos, and reviews
- **Achievements**: Unlock badges for milestones like "First Flight", "Globetrotter", "A380 Club"
- **Statistics**: Track comprehensive flight data including routes, airlines, aircraft types
- **Leaderboards**: Compete with friends and global community (planned)

### 📱 PWA Experience
- **Installable App**: Add to home screen on mobile devices
- **Offline Support**: Browse cached content and queue flights when offline
- **Background Sync**: Automatically sync queued flights when connection returns
- **Native-like UI**: Optimized for mobile with smooth animations and gestures

### 🔍 Discovery & Exploration
- **Airport Guides**: Community-driven information about terminals, food, lounges
- **Airline Reviews**: Aggregate ratings and experiences across the community
- **Trending Content**: Discover popular routes, airlines, and aviation topics
- **Search**: Find users, airports, airlines, and content across the platform

## 🛠 Technical Architecture

### Frontend Stack
- **Next.js 14** with App Router and React Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom design system
- **React Hook Form** + **Zod** for form validation
- **Lucide React** for consistent iconography

### Backend & Database
- **Firebase Authentication** for user management
- **Firestore** for real-time database with offline support
- **Firebase Storage** for file uploads
- **Cloud Functions** for server-side logic and data processing

### Third-Party Integrations
- **Cloudinary** for image optimization and transformation
- **Meilisearch/Algolia** for full-text search (planned)
- **Aviation APIs** for aircraft and airport data enrichment (planned)

### Performance & Quality
- **PWA** with service worker for offline functionality
- **Responsive Design** optimized for mobile-first experience
- **SEO Optimized** with proper meta tags and structured data
- **Accessibility** following WCAG guidelines

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Cloudinary account for image handling

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fyrspit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Firebase and Cloudinary credentials:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Admin (Server-side)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database with security rules
4. Enable Firebase Storage
5. Download the service account key for admin operations

## 📁 Project Structure

```
fyrspit/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Landing page
│   ├── (auth)/                  # Login/signup pages  
│   └── (app)/                   # Main application
│       ├── feed/                # Social feed
│       ├── flights/             # Flight logging & details
│       ├── profile/             # User profiles
│       ├── explore/             # Discovery & search
│       ├── badges/              # Achievement system
│       └── onboarding/          # New user flow
├── components/                   # Reusable UI components
│   ├── forms/                   # Form input components
│   ├── providers/               # Context providers
│   └── ui/                      # Base UI components
├── lib/                         # Utility libraries
│   ├── firebase.ts              # Firebase client config
│   ├── firebase-admin.ts        # Firebase admin config
│   ├── cloudinary.ts            # Image handling
│   └── utils.ts                 # Helper functions
├── types/                       # TypeScript type definitions
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   └── icons/                   # PWA icons
└── server/                      # Server-side code (planned)
```

## 🎨 Design System

Fyrspit uses a dark-first design inspired by Letterboxd with:
- **Colors**: Dark gray backgrounds with teal (#00A6B5) accents and orange CTAs
- **Typography**: Inter font family for clean readability
- **Components**: Consistent card-based layouts with subtle borders and hover effects
- **Responsive**: Mobile-first design that scales beautifully to desktop

## 🔐 Security & Privacy

- **Firestore Security Rules** restrict data access based on user authentication and privacy settings
- **Input Validation** with Zod schemas on both client and server
- **Rate Limiting** prevents spam and abuse
- **Privacy Controls** allow users to set flight visibility (public, friends, private)

## 🚧 Roadmap

### Phase 1: Core Platform ✅
- [x] User authentication and profiles
- [x] Flight logging with photos and ratings
- [x] Social feed and basic interactions
- [x] PWA functionality with offline support
- [x] Achievement system and statistics

### Phase 2: Community Features (Planned)
- [ ] Comments and discussions
- [ ] Follow/follower relationships
- [ ] User-generated lists and collections
- [ ] Enhanced search and filtering
- [ ] Real-time notifications

### Phase 3: Advanced Features (Planned)
- [ ] Flight import from CSV and third-party apps
- [ ] Airport and airline database with community guides
- [ ] Leaderboards and competitions
- [ ] Trip planning and recommendations
- [ ] Mobile app (React Native)

### Phase 4: Platform Growth (Planned)
- [ ] Creator tools and verification system
- [ ] Premium features and subscriptions
- [ ] API for third-party integrations
- [ ] Advanced analytics and insights
- [ ] Multi-language support

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and conventions
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Letterboxd's approach to film logging and social features
- Built with the incredible Next.js and Firebase ecosystems
- Icons by Lucide React
- Design influenced by modern aviation and travel applications

---

**Ready for takeoff?** Start logging your flights and join the Fyrspit community! ✈️
