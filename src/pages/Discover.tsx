import React, { useState, useEffect } from 'react';
import { MapPin, Heart, X, Loader2, SkipForward, Search, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  useDiscoverProfiles,
  useLikeProfile,
  usePassProfile
} from '../hooks/useProfiles';
import { useUserSettings } from '../hooks/useUserSettings';
import { useUIStore } from '../stores/useUIStore';

import ProfileModal from '../components/ProfileModal';
import DiscoverSidebar from '../components/DiscoverSidebar';
import MobileSearchModal from '../components/MobileSearchModal';

const Discover = () => {
  const { user } = useAuth();
  const { selectedProfile, setSelectedProfile } = useUIStore();

  // Local state for current profile index and loading states
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Temporary location filter state
  const [tempLocationFilter, setTempLocationFilter] = useState<{
    state: string;
    city: string;
  }>({ state: '', city: '' });

  // Get user settings for filtering
  const { data: userSettings } = useUserSettings(user?.id);

  // Build filters from user settings and temporary location filter
  const filters = {
    gender: userSettings?.discovery?.showMe || 'everyone',
    ageRange: userSettings?.discovery?.ageRange || [22, 35],
    // Use temporary location filter if set, otherwise fall back to user settings
    stateFilter:
      tempLocationFilter.state || userSettings?.discovery?.stateFilter || '',
    cityFilter:
      tempLocationFilter.city || userSettings?.discovery?.cityFilter || '',
    interests: userSettings?.discovery?.interests || []
  };

  // Fetch discoverable profiles using React Query
  const {
    data: profiles = [],
    isLoading,
    error,
    refetch
  } = useDiscoverProfiles(filters, user?.id);

  // Mutations for like/pass actions
  const likeProfile = useLikeProfile();
  const passProfile = usePassProfile();

  // Current profile to display
  const currentProfile = profiles[currentProfileIndex];

  // Effect to handle when profiles array changes (profiles removed)
  useEffect(() => {
    // If current index is beyond the array length, reset to the last valid index
    if (currentProfileIndex >= profiles.length && profiles.length > 0) {
      setCurrentProfileIndex(profiles.length - 1);
    }
    // If profiles array is empty, reset index to 0
    else if (profiles.length === 0) {
      setCurrentProfileIndex(0);
    }
  }, [profiles.length, currentProfileIndex]);

  // Handle temporary location filter changes
  const handleLocationFilterChange = (state: string, city: string) => {
    setTempLocationFilter({ state, city });
    // Reset profile index when filter changes
    setCurrentProfileIndex(0);
  };

  // Clear temporary location filter when navigating away from Discover page
  useEffect(() => {
    // Clear filter when component unmounts (navigating away)
    return () => {
      setTempLocationFilter({ state: '', city: '' });
    };
  }, []);

  // Handle like action
  const handleLike = async () => {
    if (!user || !currentProfile) return;

    setIsLiking(true);
    try {
      await likeProfile.mutateAsync({
        profileId: currentProfile.id,
        userId: user.id
      });

      // Move to next profile, but don't go beyond the array length
      // The profile will be removed from the array, so we need to check the new length
      setCurrentProfileIndex((prev) => {
        const newLength = profiles.length - 1; // Profile will be removed
        return prev < newLength ? prev + 1 : prev;
      });
    } catch (error) {
      console.error('Error liking profile:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle pass action
  const handlePass = async () => {
    if (!currentProfile) return;

    setIsPassing(true);
    try {
      await passProfile.mutateAsync({ profileId: currentProfile.id });

      // Move to next profile, but don't go beyond the array length
      // The profile will be removed from the array, so we need to check the new length
      setCurrentProfileIndex((prev) => {
        const newLength = profiles.length - 1; // Profile will be removed
        return prev < newLength ? prev + 1 : prev;
      });
    } catch (error) {
      console.error('Error passing profile:', error);
    } finally {
      setIsPassing(false);
    }
  };

  // Handle profile selection for modal
  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
  };

  // Handle skip to next profile
  const handleSkip = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Mobile Search Button - Only visible on mobile */}
      <div className="lg:hidden fixed top-20 right-4 z-40">
        <button
          onClick={() => setShowMobileSearch(true)}
          className="bg-white text-gray-700 p-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
          title="Search Profiles"
        >
          <Search className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* LinkedIn-style layout with centered content and right sidebar */}
      <div className="flex gap-8">
        {/* Main Profile Card Area - Wider for better fit */}
        <div className="flex-1 max-w-xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-96">
              <div className="bg-white rounded-2xl p-8 max-w-sm mx-auto">
                <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
                <h3 className="text-gray-900 font-medium text-center mb-2">Finding profiles...</h3>
                <p className="text-gray-600 text-center text-sm">Discovering your matches</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="bg-white rounded-2xl p-8 max-w-sm mx-auto text-center">
                <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  We couldn't load profiles right now
                </p>
                <button
                  onClick={() => refetch()}
                  className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* No Profiles State */}
          {!isLoading && !error && profiles.length === 0 && (
            <div className="flex items-center justify-center h-96">
              <div className="bg-white rounded-2xl p-8 max-w-sm mx-auto text-center">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No profiles available
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Check back later for new profiles
                </p>
                <button
                  onClick={() => refetch()}
                  className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* No More Profiles to Show */}
          {!isLoading &&
            !error &&
            profiles.length > 0 &&
            currentProfileIndex >= profiles.length && (
              <div className="flex items-center justify-center h-96">
                <div className="bg-white rounded-2xl p-8 max-w-sm mx-auto text-center">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    You've seen all profiles
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Check back later for new profiles
                  </p>
                  <button
                    onClick={() => {
                      setCurrentProfileIndex(0);
                      refetch();
                    }}
                    className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}

          {/* Profile Card - Only show when we have profiles and current index is valid */}
          {!isLoading &&
            !error &&
            profiles.length > 0 &&
            currentProfileIndex < profiles.length &&
            currentProfile && (
              <>
                {/* Profile Card */}
                <div className="flex-1 flex items-center justify-center py-4">
                  <div className="w-full max-w-md mx-auto">
                    {/* Profile Counter - Professional Style */}
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                        <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-gray-700 font-semibold text-sm">
                          {currentProfileIndex + 1} of {profiles.length}
                        </span>
                      </div>
                    </div>
                  
                    {/* Profile Card - Enhanced Design with Glow Effect */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 transform hover:scale-[1.02] relative">
                      {/* Sparkle Effect */}
                      <div className="absolute top-6 right-6 w-2 h-2 bg-yellow-300 rounded-full animate-pulse z-10"></div>
                      {/* Profile Image - Adjusted height */}
                      <div
                        className="relative h-72 bg-gray-100 cursor-pointer group overflow-hidden"
                        onClick={() => handleProfileClick(currentProfile)}
                      >
                        {currentProfile.photos &&
                        currentProfile.photos.length > 0 ? (
                          <img
                            src={currentProfile.photos[0]}
                            alt={currentProfile.displayName || 'Profile'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Heart className="h-16 w-16 text-gray-400" />
                          </div>
                        )}

                        {/* Enhanced Skip Button with Tooltip */}
                        <div className="absolute top-4 right-16 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkip();
                            }}
                            disabled={currentProfileIndex >= profiles.length - 1}
                            className="group bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full border border-white/50 hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-110"
                            title="Skip to next profile"
                          >
                            <SkipForward className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                          </button>
                        </div>
                        
                        {/* Photo Indicator Dots */}
                        <div className="absolute top-4 left-4 flex space-x-1 z-20">
                          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        </div>
                        
                        {/* Boost Button */}
                        <div className="absolute top-4 right-4 z-20">
                          <button
                            className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-full shadow-lg hover:shadow-yellow-500/50 transform hover:scale-110 transition-all duration-200 animate-pulse"
                            title="Boost your profile!"
                          >
                            <span className="text-sm font-bold">⚡</span>
                          </button>
                        </div>

                        {/* Enhanced Profile Info Overlay with animations */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                          <div className="text-white transform transition-all duration-300 group-hover:translate-y-[-4px]">
                            <div className="flex items-center justify-between mb-2">
                              <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                {currentProfile.displayName ||
                                  `${currentProfile.first_name} ${currentProfile.last_name}`}
                              </h2>
                              {/* Online Status Indicator */}
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse shadow-lg"></div>
                                <span className="text-xs text-green-300 font-medium">Online</span>
                              </div>
                            </div>

                            {/* Age and Location with enhanced styling */}
                            {currentProfile.showLocation && (
                              <div className="flex items-center text-white/95 mb-3">
                                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                  <MapPin className="h-4 w-4 mr-2 text-blue-300" />
                                  <span className="text-sm font-medium">
                                    {currentProfile.displayLocation ||
                                      `${currentProfile.city}, ${currentProfile.state}`}
                                  </span>
                                  {/* Distance indicator */}
                                  <span className="ml-2 text-xs text-blue-200">• 2.5 mi</span>
                                </div>
                              </div>
                            )}

                            {/* Bio Preview with enhanced styling */}
                            {currentProfile.bio && (
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                                <p className="text-sm text-white/95 line-clamp-2 leading-relaxed">
                                  {currentProfile.bio}
                                </p>
                              </div>
                            )}
                            
                            {/* Quick Info Tags */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center bg-purple-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                                <span className="text-xs text-purple-200 font-medium">Age 28</span>
                              </div>
                              <div className="flex items-center bg-pink-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                                <span className="text-xs text-pink-200 font-medium">🎓 College</span>
                              </div>
                              <div className="flex items-center bg-blue-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                                <span className="text-xs text-blue-200 font-medium">💼 Professional</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="p-6">
                        {/* Compact Interests */}
                        {currentProfile.interests &&
                          currentProfile.interests.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Interests
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {currentProfile.interests
                                  .slice(0, 3)
                                  .map((interest: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium hover:from-purple-200 hover:to-pink-200 transform hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                                {currentProfile.interests.length > 3 && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs rounded-full font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                                    +{currentProfile.interests.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                        {/* Compact Compatibility Score */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-green-700">Compatibility</span>
                            <span className="text-xl font-bold text-green-600">94%</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full w-[94%] shadow-sm"></div>
                          </div>
                          <p className="text-xs text-green-600 mt-1 font-medium">High match! You both love travel & music 🎵</p>
                        </div>

                        {/* Enhanced Action Buttons with Slick Animations */}
                        <div className="flex space-x-3 mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePass();
                            }}
                            disabled={isPassing}
                            className="group flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-4 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                          >
                            {isPassing ? (
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                              <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            )}
                            <span className="font-bold">Pass</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike();
                            }}
                            disabled={isLiking}
                            className="group flex-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-red-600 hover:via-pink-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-red-500/50 transform hover:scale-105 active:scale-95 animate-pulse"
                          >
                            {isLiking ? (
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                              <Heart className="h-5 w-5 mr-2 group-hover:animate-bounce fill-current" />
                            )}
                            <span className="font-bold">❤️ Like</span>
                          </button>
                        </div>
                        
                        {/* Super Like Button */}
                        <button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95">
                          <Star className="h-5 w-5 mr-2 fill-current" />
                          ✨ Super Like
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>

        {/* Right Sidebar - LinkedIn style */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-4">
            <DiscoverSidebar
              onLocationFilterChange={handleLocationFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      )}

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />
    </div>
  );
};

export default Discover;