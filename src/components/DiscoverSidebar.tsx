import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Eye,
  TrendingUp,
  MapPin,
  Sparkles,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMatchCount } from "../hooks/useMatchCount";
import { useLikesReceived } from "../hooks/useLikesReceived";
import { useLikedProfiles } from "../hooks/useProfiles";
import { useCurrentProfile } from "../hooks/useProfiles";
import SearchBar from "./SearchBar";
import LocationIndicator from "./LocationIndicator";

interface DiscoverSidebarProps {
  onLocationFilterChange?: (state: string, city: string) => void;
}

const DiscoverSidebar: React.FC<DiscoverSidebarProps> = ({
  onLocationFilterChange,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user stats
  const { data: matchCount = 0 } = useMatchCount(user?.id);
  const { data: likesReceived = 0 } = useLikesReceived(user?.id);
  const { data: likedProfiles = [] } = useLikedProfiles(user?.id);
  const { data: userProfile } = useCurrentProfile(user?.id);

  // Calculate stats
  const likesGiven = likedProfiles.length;
  const matchSuccessRate =
    likesGiven > 0 ? Math.round((matchCount / likesGiven) * 100) : 0;
  const profileCompletion = userProfile
    ? calculateProfileCompletion(userProfile)
    : 0;


  return (
    <div className="bg-gradient-to-br from-white via-purple-50 to-white rounded-2xl border border-gray-200/50 shadow-2xl hover:shadow-purple-500/20 transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
      {/* Sparkle Effects */}
      <div className="absolute top-5 left-5 w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
      
      {/* Compact Header */}
      <div className="p-3 border-b border-gray-100/80 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Target className="h-3 w-3 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xs">Discover Hub</h3>
          </div>
        </div>
      </div>
      
      {/* Compact Search Bar */}
      <div className="p-2 border-b border-gray-100/80">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg opacity-50"></div>
          <div className="relative">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Compact Location Settings */}
      <div className="p-2 border-b border-gray-100/80 bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center">
          <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-1">
            <MapPin className="h-2 w-2 text-white" />
          </div>
          <span>Location</span>
        </h3>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg opacity-50"></div>
          <div className="relative">
            <LocationIndicator onLocationChange={onLocationFilterChange} />
          </div>
        </div>
      </div>

      {/* Compact Profile Stats */}
      <div className="p-2 bg-gradient-to-br from-orange-50 to-yellow-50">
        <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center">
          <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mr-1">
            <Trophy className="h-2 w-2 text-white" />
          </div>
          <span>Stats</span>
        </h3>

        <div className="space-y-1.5">
          {/* Compact Matches */}
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg border border-red-200/50 shadow-sm hover:shadow-red-200/50 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <Heart className="h-3 w-3 text-white fill-current" />
              </div>
              <span className="text-red-700 text-xs font-semibold">Matches</span>
            </div>
            <div className="text-lg font-bold text-red-600">{matchCount}</div>
          </div>

          {/* Compact Likes Received */}
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200/50 shadow-sm hover:shadow-blue-200/50 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <Eye className="h-3 w-3 text-white" />
              </div>
              <span className="text-blue-700 text-xs font-semibold">Likes</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{likesReceived}</div>
          </div>

          {/* Compact Success Rate */}
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200/50 shadow-sm hover:shadow-green-200/50 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              <span className="text-green-700 text-xs font-semibold">Success</span>
            </div>
            <div className="text-lg font-bold text-green-600">{matchSuccessRate}%</div>
          </div>

          {/* Compact Profile Completion */}
          <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200/50 shadow-sm hover:shadow-purple-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-purple-700 text-xs font-semibold">Profile</span>
              </div>
              <div className="text-lg font-bold text-purple-600">{profileCompletion}%</div>
            </div>
            <div className="w-full bg-purple-200/50 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(profile: any): number {
  const fields = [
    "first_name",
    "last_name",
    "age",
    "gender",
    "bio",
    "city",
    "state",
    "photos",
  ];

  let completedFields = 0;

  fields.forEach((field) => {
    if (field === "photos") {
      if (profile[field] && profile[field].length > 0) {
        completedFields++;
      }
    } else if (profile[field] && profile[field].toString().trim() !== "") {
      completedFields++;
    }
  });

  return Math.round((completedFields / fields.length) * 100);
}

export default DiscoverSidebar;
