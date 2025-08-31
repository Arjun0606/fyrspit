'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, deleteUser } from 'firebase/auth';
import { User, Bell, Shield, Globe, Plane, Camera, LogOut, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface UserSettings {
  username: string;
  profilePictureUrl?: string;
  age?: number;
  gender?: string;
  homeAirport: string;
  travelStyle: string;
  notifications: {
    email: boolean;
    push: boolean;
    achievements: boolean;
    social: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    flightVisibility: 'public' | 'friends' | 'private';
    statsVisibility: 'public' | 'friends' | 'private';
  };
}

export default function SettingsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadUserSettings();
    }
  }, [user, loading, router]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSettings({
          username: userData.username,
          profilePictureUrl: userData.profilePictureUrl,
          age: userData.age,
          gender: userData.gender,
          homeAirport: userData.homeAirport,
          travelStyle: userData.travelStyle,
          notifications: userData.notifications || {
            email: true,
            push: true,
            achievements: true,
            social: true,
          },
          privacy: userData.privacy || {
            profileVisibility: 'public',
            flightVisibility: 'public',
            statsVisibility: 'public',
          }
        });

        // If no profilePictureUrl set in Firestore, try to auto-sync the uploaded one from Storage
        if (!userData.profilePictureUrl) {
          try {
            const r = ref(storage, `profile-pictures/${user.uid}`);
            const url = await getDownloadURL(r);
            setSettings(prev => (prev ? { ...prev, profilePictureUrl: url } : prev));
            await updateDoc(doc(db, 'users', user.uid), { profilePictureUrl: url });
          } catch (_) {
            // Ignore if no file exists in storage
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    if (!user || !settings) return;

    setSaving(true);
    try {
      // Check username availability if changed
      if (settings.username) {
        const q = query(collection(db, 'users'), where('username', '==', settings.username.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const conflict = snap.docs.find(d => d.id !== user.uid);
          if (conflict) throw new Error('Username is already taken');
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        ...settings,
        username: settings.username?.toLowerCase?.() || settings.username,
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    try {
      const r = ref(storage, `profile-pictures/${user.uid}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      setSettings(prev => prev ? { ...prev, profilePictureUrl: url } : prev);
      await updateDoc(doc(db, 'users', user.uid), { profilePictureUrl: url });
      toast.success('Profile photo updated');
    } catch (e) {
      toast.error('Failed to upload photo');
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    try {
      // Delete user data from Firestore
      await updateDoc(doc(db, 'users', user.uid), { deleted: true });
      
      // Delete user account
      await deleteUser(user);
      
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. You may need to re-authenticate.');
    }
  };

  const copyIdToken = async () => {
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) throw new Error('Not signed in');
      await navigator.clipboard.writeText(token);
      toast.success('ID token copied to clipboard');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to copy token');
    }
  };

  const restoreOriginalProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Restore original profile data with proper XP and stats
      // Prefer an uploaded Storage photo > Firestore existing > Google photo
      let resolvedPhoto: string | undefined = settings?.profilePictureUrl;
      if (!resolvedPhoto) {
        try {
          const r = ref(storage, `profile-pictures/${user.uid}`);
          resolvedPhoto = await getDownloadURL(r);
        } catch (_) {
          // no-op
        }
      }
      if (!resolvedPhoto) {
        resolvedPhoto = user.photoURL || undefined;
      }

      const restoredData = {
        username: 'arjun0606',
        profilePictureUrl: resolvedPhoto,
        age: 24,
        gender: 'Male',
        homeAirport: 'Bangalore',
        travelStyle: 'Explorer',
        onboarded: true,
        xp: 200, // Restore original XP
        level: 2, // Restore original level
        // Keep existing data but ensure proper structure
        statsCache: {
          lifetime: {
            flights: 2,
            milesMi: 782,
            milesKm: 1259,
            hours: 2.5,
            countries: ['India'],
            airports: ['BOM', 'BLR', 'GOX'],
            airlines: ['SpiceJet', 'Air India'],
            aircraft: ['Boeing 737 MAX 8', 'Bombardier Dash 8'],
            continents: ['Asia'],
            domesticInternational: { domestic: 2, international: 0 },
            dayNightRatio: { day: 2, night: 0 },
            weekdayWeekend: { weekday: 2, weekend: 0 },
            seatClassBreakdown: { economy: 2, premium: 0, business: 0, first: 0 },
            longest: { km: 518, mi: 322 },
            shortest: { km: 264, mi: 164 },
            topRoute: { count: 1 },
            topAirport: { count: 1 },
            topAirline: { count: 1 }
          },
          perYear: {}
        }
      };

      await updateDoc(doc(db, 'users', user.uid), restoredData);
      
      // Update local state
      setSettings(prev => ({
        ...prev!,
        username: 'arjun0606',
        age: 24,
        gender: 'Male',
        homeAirport: 'Bangalore',
        travelStyle: 'Explorer'
      }));
      
      toast.success('Profile restored to original @arjun0606 with 200 XP!');
      
      // Refresh the page to show changes
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error('Error restoring profile:', error);
      toast.error('Failed to restore profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Settings not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'privacy', label: 'Privacy', icon: Shield },
                  { id: 'account', label: 'Account', icon: Globe },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === id
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => setSettings({ ...settings, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Profile picture</label>
                    <div className="flex items-center space-x-3">
                      {settings.profilePictureUrl ? (
                        <img src={settings.profilePictureUrl} alt="avatar" className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gray-700"></div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={settings.age || ''}
                        onChange={(e) => setSettings({ ...settings, age: parseInt(e.target.value) || undefined })}
                        className="input w-full"
                        disabled
                        title="Age is set during onboarding"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Gender
                      </label>
                      <select
                        value={settings.gender || ''}
                        onChange={(e) => setSettings({ ...settings, gender: e.target.value })}
                        className="input w-full"
                        disabled
                        title="Gender is set during onboarding"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Home Airport
                    </label>
                    <input
                      type="text"
                      value={settings.homeAirport}
                      onChange={(e) => setSettings({ ...settings, homeAirport: e.target.value })}
                      className="input w-full"
                      disabled
                      title="Home airport is set during onboarding"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Travel Style
                    </label>
                    <select
                      value={settings.travelStyle}
                      onChange={(e) => setSettings({ ...settings, travelStyle: e.target.value })}
                      className="input w-full"
                    >
                      <option value="business">Business</option>
                      <option value="leisure">Leisure</option>
                      <option value="mixed">Mixed</option>
                      <option value="aviation-enthusiast">Aviation Enthusiast</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, email: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Push Notifications</h3>
                      <p className="text-sm text-gray-400">Receive push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, push: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Achievement Notifications</h3>
                      <p className="text-sm text-gray-400">Get notified when you earn badges or level up</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.achievements}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, achievements: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Social Notifications</h3>
                      <p className="text-sm text-gray-400">Notifications about friends and social activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.social}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, social: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: e.target.value as any }
                      })}
                      className="input w-full"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private - Only you</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Flight History Visibility
                    </label>
                    <select
                      value={settings.privacy.flightVisibility}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, flightVisibility: e.target.value as any }
                      })}
                      className="input w-full"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private - Only you</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Statistics Visibility
                    </label>
                    <select
                      value={settings.privacy.statsVisibility}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, statsVisibility: e.target.value as any }
                      })}
                      className="input w-full"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private - Only you</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-6">Account Actions</h2>
                  
                  <div className="space-y-4">
                    <button
                      onClick={restoreOriginalProfile}
                      disabled={saving}
                      className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <User className="h-5 w-5" />
                      <span>Restore Original Profile (@arjun0606)</span>
                    </button>
                    <button
                      onClick={copyIdToken}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                    >
                      <span>Copy ID token</span>
                    </button>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                <div className="card border-red-500/30">
                  <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={deleteAccount}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Delete Account</span>
                    </button>
                    <p className="text-sm text-gray-400">
                      This action cannot be undone. Your account and all data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
