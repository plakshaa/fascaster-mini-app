"use client";

import { CharmProfile } from "@/types/charm-caster";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProfileFrameProps {
  profile: CharmProfile;
  onMatch: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export default function ProfileFrame({ 
  profile, 
  onMatch, 
  onNext, 
  isLoading = false 
}: ProfileFrameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Profile Image */}
        <div className="relative h-80 w-full">
          <Image
            src={profile.pfp_url}
            alt={profile.display_name}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-semibold text-purple-600">
              @{profile.username}
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {profile.display_name}
            </h2>
            {profile.age && (
              <p className="text-gray-600">Age {profile.age}</p>
            )}
          </div>

          {profile.bio && (
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {profile.bio}
            </p>
          )}

          {profile.location && (
            <div className="flex items-center text-gray-600 text-sm">
              <span className="mr-1">📍</span>
              {profile.location}
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{profile.follower_count} followers</span>
            <span>{profile.following_count} following</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
          >
            ⏩ Next
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMatch}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            ❤️ Match
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
