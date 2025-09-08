import React from 'react';
import { Heart, Zap, Users, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLikedProfiles, useUnlikeProfile } from '../hooks/useProfiles';
import { useUIStore } from '../stores/useUIStore';
import ProfileModal from '../components/ProfileModal';

const Likes = () => {
  const { user } = useAuth();
  const { selectedProfile, setSelectedProfile } = useUIStore();

  // React Query hooks for data fetching
  const {
    data: likedProfiles = [],
    isLoading,
    error,
    refetch
  } = useLikedProfiles(user?.id);

  // Unlike profile mutation
  const unlikeProfile = useUnlikeProfile();

  const handleUnlike = async (profileId: string) => {
    if (!user) return;

    try {
      await unlikeProfile.mutateAsync({
        profileId,
        userId: user.id
      });

      // The mutation will automatically update the cache
      // No need to manually update local state
    } catch (error) {
      console.error('Error unliking profile:', error);
      // Could add toast notification here
    }
  };

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
  };

  // Transform profiles for display
  const transformedProfiles = likedProfiles.map((like) => ({
    id: like.liked_id,
    name:
      like.liked_profile.displayName ||
      `${like.liked_profile.first_name} ${like.liked_profile.last_name}`,
    age: like.liked_profile.showAge ? like.liked_profile.age : null,
    location: like.liked_profile.displayLocation || 'Location hidden',
    avatar:
      like.liked_profile.photos && like.liked_profile.photos.length > 0
        ? like.liked_profile.photos[0]
        : 'https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: like.liked_profile.bio || 'No bio available',
    interests: like.liked_profile.interests || [],
    likedAt: new Date(like.created_at).toLocaleDateString(),
    // Add the full profile data for modal
    profile: like.liked_profile
  }));

  return (
    <div className="bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/30 min-h-screen">
      {/* Main Content */}
      <main>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              People You've Liked
            </h1>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-red-600" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't load your liked profiles
                </p>
                <button
                  onClick={() => refetch()}
                  className="bg-red-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Liked Profiles Grid */}
          {!isLoading && !error && transformedProfiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {transformedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="group bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2 border border-gray-200/50"
                  onClick={() => handleProfileClick(profile.profile)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Sparkle Effects */}
                    <div className="absolute top-4 right-14 w-1 h-1 bg-white rounded-full animate-pulse opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlike(profile.id);
                      }}
                      disabled={unlikeProfile.isPending}
                      className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm rounded-full p-2 hover:bg-red-600 transition-all duration-300 disabled:opacity-50 transform hover:scale-110 hover:rotate-90"
                    >
                      {unlikeProfile.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin text-white" />
                      ) : (
                        <X className="h-3 w-3 text-white" />
                      )}
                    </button>
                    
                    {/* Heart Animation on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <Heart className="h-8 w-8 text-red-500 fill-current animate-bounce" />
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-b from-white to-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-red-600 transition-colors duration-300">
                      {profile.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <Heart className="h-3 w-3 text-red-400 mr-1 fill-current" />
                      <span>Liked on {profile.likedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && transformedProfiles.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No likes yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start exploring profiles and like people you're interested in!
                </p>
                <button
                  onClick={() => (window.location.href = '/discover')}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Start Discovering
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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

export default Likes;
