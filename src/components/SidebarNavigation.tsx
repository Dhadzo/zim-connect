import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, User, Settings, ThumbsUp, Sparkles } from 'lucide-react';

const SidebarNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/app/discover',
      icon: Heart,
      label: 'Discover',
      active:
        location.pathname === '/app/discover' || location.pathname === '/app'
    },
    {
      path: '/app/matches',
      icon: MessageCircle,
      label: 'Matches',
      active: location.pathname === '/app/matches'
    },
    {
      path: '/app/profile',
      icon: User,
      label: 'Profile',
      active: location.pathname === '/app/profile'
    },
    {
      path: '/app/likes',
      icon: ThumbsUp,
      label: 'Likes',
      active: location.pathname === '/app/likes'
    },
    {
      path: '/app/settings',
      icon: Settings,
      label: 'Settings',
      active: location.pathname === '/app/settings'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl border border-gray-200/50 shadow-2xl hover:shadow-red-500/20 mx-4 mt-4 sticky top-4 transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
      {/* Sparkle Effects */}
      <div className="absolute top-5 right-5 w-1 h-1 bg-red-300 rounded-full animate-pulse"></div>
      
      {/* Header with Profile Summary */}
      <div className="p-4 border-b border-gray-100/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">ZimConnect</h3>
            <p className="text-xs text-gray-500">Find your match</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden ${
                  item.active
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg shadow-red-500/30'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                {item.active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-20 animate-pulse"></div>
                )}
                <Icon
                  className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                    item.active ? 'text-white drop-shadow-sm' : 'text-gray-500 group-hover:text-red-500'
                  }`}
                />
                <span
                  className={`text-sm font-semibold transition-all duration-300 ${
                    item.active ? 'text-white drop-shadow-sm' : 'text-gray-700 group-hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-bounce"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default SidebarNavigation;
