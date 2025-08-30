'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Plane } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      try {
        await signInWithPopup(auth, provider);
      } catch {
        // Popup blocked or in PWA/Safari: fallback
        await signInWithRedirect(auth, provider);
        return;
      }

      // Ensure user document exists
      const u = auth.currentUser;
      if (u) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            name: u.displayName || '',
            email: u.email || '',
            joinedAt: new Date(),
            followingCount: 0,
            followerCount: 0,
            favourites: { airlines: [], airports: [] },
            xp: 0,
            level: 1,
            badges: [],
            statsCache: { lifetime: { flights: 0, milesKm: 0, milesMi: 0, hours: 0, airports: [], airlines: [], aircraft: [], countries: [], continents: [], longest: { km: 0, mi: 0 }, shortest: { km: 0, mi: 0 }, topRoute: { count: 0 }, topAirline: { count: 0 }, topAirport: { count: 0 }, seatClassBreakdown: { economy: 0, premium: 0, business: 0, first: 0 }, dayNightRatio: { day: 0, night: 0 }, weekdayWeekend: { weekday: 0, weekend: 0 }, domesticInternational: { domestic: 0, international: 0 } }, perYear: {} },
            privacy: { defaultVisibility: 'public' },
            roles: { admin: false, moderator: false, verified: false, influencer: false }
          });
        }
      }

      toast.success('Welcome back!');
      router.push('/feed');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to log in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-8">
            <Image 
              src="/fyrspit-logo.png" 
              alt="Fyrspit" 
              width={40} 
              height={40} 
              className="rounded-lg sm:rounded-xl shadow-lg sm:w-12 sm:h-12"
            />
            <span className="text-2xl sm:text-3xl font-bold text-white">Fyrspit</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-white">Welcome back</h1>
          <p className="text-gray-400 text-base sm:text-lg">We use Google Sign‑In for secure access</p>
        </div>
        {/* Google-only Sign-In */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-gray-900 font-semibold py-3 sm:py-4 px-6 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg text-sm sm:text-base"
          >
            <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">G</span>
            </div>
            <span>{isLoading ? 'Signing in…' : 'Continue with Google'}</span>
          </button>
          <p className="mt-4 text-xs text-gray-400">Popup blocked? We’ll fall back to redirect.</p>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 sm:mt-8 text-center text-gray-400 text-base sm:text-lg">
          New to Fyrspit?{' '}
          <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Create account with Google
          </Link>
        </p>
      </div>
    </div>
  );
}
