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

const Discover = () => {
  const { user } = useAuth();
  const { selectedProfile, setSelectedProfile } = useUIStore();

  // Local state for current profile index and loading states
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
    // Reset photo index when profile changes
    setCurrentPhotoIndex(0);
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 min-h-full overflow-x-hidden">

      {/* LinkedIn-style layout with centered content and right sidebar */}
      <div className="flex gap-4 lg:gap-8 overflow-x-hidden">
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
                <div className="flex-1 flex items-center justify-center py-1">
                  <div className="w-full max-w-sm mx-auto">
                    {/* Profile Card - Enhanced Design with Glow Effect */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 transform hover:scale-[1.02] relative">
                      {/* Sparkle Effect */}
                      <div className="absolute top-6 right-6 w-2 h-2 bg-yellow-300 rounded-full animate-pulse z-10"></div>
                      {/* Profile Image - Smaller height */}
                      <div
                        className="relative h-56 bg-gray-100 group overflow-hidden"
                      >
                        {currentProfile.photos &&
                        currentProfile.photos.length > 0 ? (
                          <img
                            src={currentProfile.photos[currentPhotoIndex] || currentProfile.photos[0]}
                            alt={currentProfile.displayName || 'Profile'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Heart className="h-16 w-16 text-gray-400" />
                          </div>
                        )}

                        {/* Photo Navigation Icon - Top Right */}
                        {currentProfile.photos && currentProfile.photos.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPhotoIndex((prev) => 
                                prev < currentProfile.photos.length - 1 ? prev + 1 : 0
                              );
                            }}
                            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-gray-700 p-2 rounded-full border border-white/50 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 z-20"
                            title="Next photo"
                          >
                            <span className="text-sm font-bold">→</span>
                          </button>
                        )}


                      </div>

                      {/* Photo Navigation Below Image */}
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleProfileClick(currentProfile)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            View Full Profile
                          </button>
                          {currentProfile.photos && currentProfile.photos.length > 1 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {currentPhotoIndex + 1} of {currentProfile.photos.length}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPhotoIndex((prev) => 
                                    prev < currentProfile.photos.length - 1 ? prev + 1 : 0
                                  );
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <span className="text-xs">→</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="p-4">
                        {/* Profile Name and Status */}
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-xl font-bold text-gray-900">
                            {currentProfile.displayName ||
                              `${currentProfile.first_name} ${currentProfile.last_name}`}
                          </h2>
                          {/* Online Status Indicator */}
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse shadow-lg"></div>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          </div>
                        </div>

                        {/* Age and Location */}
                        {currentProfile.showLocation && (
                          <div className="flex items-center text-gray-600 mb-3">
                            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm font-medium">
                                {currentProfile.displayLocation ||
                                  `${currentProfile.city}, ${currentProfile.state}`}
                              </span>
                              {/* Distance indicator */}
                              <span className="ml-2 text-xs text-gray-500">• 2.5 mi</span>
                            </div>
                          </div>
                        )}

                        
                        {/* Quick Info Tags */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center bg-purple-100 rounded-full px-2 py-1">
                            <span className="text-xs text-purple-700 font-medium">Age 28</span>
                          </div>
                          <div className="flex items-center bg-pink-100 rounded-full px-2 py-1">
                            <span className="text-xs text-pink-700 font-medium">🎓 College</span>
                          </div>
                          <div className="flex items-center bg-blue-100 rounded-full px-2 py-1">
                            <span className="text-xs text-blue-700 font-medium">💼 Professional</span>
                          </div>
                        </div>

                        {/* Compact Interests - No heading */}
                        {currentProfile.interests &&
                          currentProfile.interests.length > 0 && (
                            <div className="mb-3">
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

                        {/* Enhanced Action Buttons with Slick Animations */}
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePass();
                            }}
                            disabled={isPassing}
                            className="group flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-3 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                          >
                            {isPassing ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <X className="h-4 w-4 mr-1 group-hover:rotate-90 transition-transform duration-300" />
                            )}
                            <span className="font-bold text-sm">Pass</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike();
                            }}
                            disabled={isLiking}
                            className="group flex-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 text-white py-3 px-3 rounded-xl font-semibold hover:from-red-600 hover:via-pink-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-red-500/50 transform hover:scale-105 active:scale-95 animate-pulse"
                          >
                            {isLiking ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Heart className="h-4 w-4 mr-1 group-hover:animate-bounce fill-current" />
                            )}
                            <span className="font-bold text-sm">❤️ Like</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Profile Counter - Professional Style - Moved to Bottom */}
                    <div className="text-center mt-3">
                      <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                        <span className="text-gray-700 font-semibold text-sm">
                          {currentProfileIndex + 1} of {profiles.length}
                        </span>
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

    </div>
  );
};

export default Discover;