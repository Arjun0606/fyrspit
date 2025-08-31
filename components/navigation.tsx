'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Home,
  Plus,
  Search,
  User,
  Bell,
  Trophy,
  Settings,
  LogOut,
  Plane,
  Map,
  Upload,
  Award,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NavigationProps {
  currentPath: string;
}

export function Navigation({ currentPath }: NavigationProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const [profile, setProfile] = useState<{ username?: string; profilePictureUrl?: string } | null>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    getDoc(doc(db, 'users', u.uid)).then(s => setProfile(s.exists() ? (s.data() as any) : null)).catch(() => {});
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navItems = [
    { icon: Home, label: 'Feed', href: '/feed', active: currentPath === '/feed' || currentPath === '/' },
    { icon: Search, label: 'Explore', href: '/explore', active: currentPath === '/explore' },
    { icon: Plus, label: 'Log Flight', href: '/flights/new', active: currentPath === '/flights/new' || currentPath.startsWith('/flights') },
    { icon: Users, label: 'Social', href: '/social', active: currentPath === '/social' },
    { icon: Bell, label: 'Notifications', href: '/notifications', active: currentPath === '/notifications' },
  ];

  const menuItems = [
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Trophy, label: 'Leaderboards', href: '/leaderboards' },
    { icon: Award, label: 'Badges', href: '/badges' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/feed" className="flex items-center space-x-2">
              <img src="/logo/fyrspit.png" alt="Fyrspit" className="h-8 w-8" />
              <span className="text-xl font-bold">Fyrspit</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-8">
              {navItems.map(({ icon: Icon, label, href, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {profile?.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
                  {menuItems.map(({ icon: Icon, label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <hr className="border-gray-700 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map(({ icon: Icon, href, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                active ? 'text-teal-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          ))}
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Profile Menu */}
      {isProfileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsProfileMenuOpen(false)}>
          <div className="absolute bottom-16 left-4 right-4 bg-gray-800 rounded-lg border border-gray-700 py-2">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
            <hr className="border-gray-700 my-1" />
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop top padding */}
      <div className="hidden md:block h-16" />
    </>
  );
}
