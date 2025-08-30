'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Plane } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { User } from '@/types';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createUserDocument = async (uid: string, email: string, name: string) => {
    const userData: Omit<User, 'id'> = {
      name,
      email,
      joinedAt: new Date(),
      followingCount: 0,
      followerCount: 0,
      favourites: { airlines: [], airports: [] },
      xp: 0,
      level: 1,
      badges: [],
      statsCache: {
        lifetime: {
          flights: 0,
          milesKm: 0,
          milesMi: 0,
          hours: 0,
          airports: [],
          airlines: [],
          aircraft: [],
          countries: [],
          continents: [],
          longest: { km: 0, mi: 0 },
          shortest: { km: 0, mi: 0 },
          topRoute: { count: 0 },
          topAirline: { count: 0 },
          topAirport: { count: 0 },
          seatClassBreakdown: { economy: 0, premium: 0, business: 0, first: 0 },
          dayNightRatio: { day: 0, night: 0 },
          weekdayWeekend: { weekday: 0, weekend: 0 },
          domesticInternational: { domestic: 0, international: 0 },
        },
        perYear: {},
      },
      privacy: { defaultVisibility: 'public' },
      roles: { admin: false, moderator: false, verified: false, influencer: false },
    };

    await setDoc(doc(db, 'users', uid), userData);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      let user;
      try {
        ({ user } = await signInWithPopup(auth, provider));
      } catch {
        await signInWithRedirect(auth, provider);
        return;
      }
      await createUserDocument(user.uid, user.email!, user.displayName || '');

      toast.success('Welcome to Fyrspit!');
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast.error(error.message || 'Failed to create account with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <Image 
              src="/fyrspit-logo.png" 
              alt="Fyrspit" 
              width={40} 
              height={40} 
              className="rounded-lg sm:rounded-xl shadow-lg sm:w-12 sm:h-12"
            />
            <span className="text-2xl sm:text-3xl font-bold text-white">Fyrspit</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Join Fyrspit</h1>
          <p className="text-gray-400 text-sm sm:text-base">Create your account with Google</p>
        </div>

        {/* Google-only Signup */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="mt-2 w-full bg-white text-gray-900 font-semibold py-3 sm:py-4 px-6 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{isLoading ? 'Creating…' : 'Continue with Google'}</span>
          </button>
          <p className="mt-4 text-xs text-gray-400">Popup blocked? We’ll fall back to redirect.</p>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
