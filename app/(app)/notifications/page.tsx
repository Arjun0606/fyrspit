'use client';

import { useState } from 'react';
import { Bell, Trophy, Users, Plane, CheckCircle, Clock, Star } from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'social' | 'flight' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Mock notifications - in production, these would come from the database
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'New Badge Earned!',
      message: 'You earned the "First Flight" badge for logging your first flight',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: '2',
      type: 'social',
      title: '@aviation_pro followed you',
      message: 'aviation_pro started following your flight journey',
      timestamp: '5 hours ago',
      read: false
    },
    {
      id: '3',
      type: 'flight',
      title: 'Flight Reminder',
      message: 'Don\'t forget to log your recent AA123 flight from LAX to JFK',
      timestamp: '1 day ago',
      read: true
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Level Up!',
      message: 'Congratulations! You\'ve reached Level 2',
      timestamp: '2 days ago',
      read: true
    },
    {
      id: '5',
      type: 'system',
      title: 'New Feature: Flight Stats',
      message: 'Check out the new detailed flight statistics in your profile',
      timestamp: '3 days ago',
      read: true
    }
  ];

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'social':
        return <Users className="h-6 w-6 text-blue-500" />;
      case 'flight':
        return <Plane className="h-6 w-6 text-orange-500" />;
      case 'system':
        return <Bell className="h-6 w-6 text-gray-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const markAllAsRead = () => {
    // In production, this would update the database
    console.log('Marking all notifications as read');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400">Stay updated on your aviation journey</p>
          </div>
          
          <button
            onClick={markAllAsRead}
            className="btn-secondary flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className="bg-orange-500 text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'unread' 
                  ? "You've read all your notifications" 
                  : "We'll notify you when something important happens"
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`card hover:bg-gray-800/80 transition-colors cursor-pointer ${
                  !notification.read ? 'border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        <span className="text-sm text-gray-400 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{notification.timestamp}</span>
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm">{notification.message}</p>
                    
                    {notification.actionUrl && (
                      <button className="mt-2 text-orange-400 text-sm hover:text-orange-300 transition-colors">
                        View Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="btn-secondary">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
