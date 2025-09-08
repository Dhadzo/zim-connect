import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Bell,
  LogOut,
  User,
  Heart,
  Settings,
  ChevronDown,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useUnreadNotificationCount } from '../hooks/useUnreadCounts';
import { useCurrentProfile } from '../hooks/useProfiles';
import NotificationsModal from './NotificationsModal';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Get user display info
  const userName =
    user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  const userFullName =
    user?.user_metadata?.first_name && user?.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : userName;

  // Get user avatar from profile or fallback
  // Get user profile data including avatar
  const { data: userProfile } = useCurrentProfile(user?.id);

  // Get user avatar from profile or fallback
  const userAvatar =
    userProfile?.photos && userProfile.photos.length > 0
      ? userProfile.photos[0]
      : 'https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=150';

  // Use React Query hooks for counts
  const { data: unreadCount = 0 } = useUnreadNotificationCount(user?.id);

  // Calculate profile completion
  const calculateProfileCompletion = (profile: any): number => {
    if (!profile) return 0;

    const fields = [
      'first_name',
      'last_name',
      'age',
      'gender',
      'bio',
      'city',
      'state',
      'photos'
    ];

    let completedFields = 0;

    fields.forEach((field) => {
      if (field === 'photos') {
        if (profile[field] && profile[field].length > 0) {
          completedFields++;
        }
      } else if (profile[field] && profile[field].toString().trim() !== '') {
        completedFields++;
      }
    });

    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = userProfile
    ? calculateProfileCompletion(userProfile)
    : 0;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14">
            {/* Logo - Far Left */}
            <Link
              to="/app/discover"
              className="group flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-all duration-300 flex-shrink-0 transform hover:scale-105"
            >
              <div className="relative">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 group-hover:text-pink-500 transition-colors duration-300 filter group-hover:drop-shadow-lg" />
                <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 bg-red-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-gray-900 via-red-600 to-pink-600 bg-clip-text text-transparent group-hover:from-red-600 group-hover:via-pink-600 group-hover:to-red-600 transition-all duration-300">
                ZimConnect
              </span>
            </Link>

            {/* Spacer to push actions to far right */}
            <div className="flex-1"></div>

            {/* Right: Actions - Far Right */}
            <div className="flex items-center space-x-4 sm:space-x-6">

              {/* Quick Settings (hidden on mobile) */}
              <Link
                to="/app/settings"
                className="hidden lg:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>

              {/* Notifications */}
              <button
                ref={notificationButtonRef}
                onClick={() => setShowNotifications(true)}
                className="group relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 transform hover:scale-110"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-bounce transition-transform duration-300" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount > 9 ? (
                      <span className="text-white text-xs font-bold">9+</span>
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="group flex items-center space-x-2 p-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-lg group-hover:border-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300 transform group-hover:scale-110"
                    />
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {userName}
                    </div>
                    <div className="text-xs text-gray-500">View profile</div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-all duration-300 group-hover:text-purple-500 ${
                      showUserDropdown ? 'rotate-180 text-purple-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl border border-gray-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-300 transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
                    {/* Sparkle Effects */}
                    <div className="absolute top-5 right-5 w-1 h-1 bg-red-300 rounded-full animate-pulse"></div>
                    
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100/80 bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={userAvatar}
                            alt={userName}
                            className="w-10 h-10 rounded-full object-cover shadow-lg"
                          />
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {userFullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <div className="space-y-1">
                        <Link
                          to="/app/settings"
                          onClick={() => setShowUserDropdown(false)}
                          className="group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
                        >
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <Settings className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-semibold">Settings</span>
                        </Link>

                        <Link
                          to="/app/profile"
                          onClick={() => {
                            setShowUserDropdown(false);
                          }}
                          className="group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
                        >
                          <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-semibold">My Profile</span>
                        </Link>

                        <div className="border-t border-gray-100/80 my-2"></div>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            handleSignOut();
                          }}
                          disabled={isSigningOut}
                          className="group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 relative overflow-hidden"
                        >
                          {isSigningOut && (
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-20 animate-pulse"></div>
                          )}
                          <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            {isSigningOut ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <LogOut className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-semibold">
                            {isSigningOut ? 'Signing out...' : 'Sign Out'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile-only logout button for backup */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="sm:hidden p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isSigningOut ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        buttonRef={notificationButtonRef}
      />
    </>
  );
};

export default Header;
