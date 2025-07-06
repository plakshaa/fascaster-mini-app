"use client";

import { CharmProfile } from "@/types/charm-caster";
import { motion } from "framer-motion";
import Image from "next/image";

interface MatchFrameProps {
  matchedProfile: CharmProfile;
  onContinue: () => void;
  onMintNFT?: () => void;
  isNftMinting?: boolean;
}

export default function MatchFrame({ 
  matchedProfile, 
  onContinue, 
  onMintNFT,
  isNftMinting = false 
}: MatchFrameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-md"
      >
        {/* Celebration Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3 
            }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            It&apos;s a Match!
          </h1>
          <p className="text-xl text-white/90">
            You&apos;ve charmed each other ✨
          </p>
        </motion.div>

        {/* Matched Profile */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 space-y-4"
        >
          <div className="relative w-24 h-24 mx-auto">
            <Image
              src={matchedProfile.pfp_url}
              alt={matchedProfile.display_name}
              fill
              className="object-cover rounded-full border-4 border-white"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {matchedProfile.display_name}
            </h3>
            <p className="text-gray-600">@{matchedProfile.username}</p>
          </div>

          {matchedProfile.bio && (
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
              {matchedProfile.bio}
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Optional NFT Minting */}
          {onMintNFT && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMintNFT}
              disabled={isNftMinting}
              className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
            >
              {isNftMinting ? "Minting... ⏳" : "🏆 Mint Match NFT on Celo"}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="w-full py-3 px-6 bg-white text-purple-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            💫 Continue Matching
          </motion.button>
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-white/60 text-sm space-y-2"
        >
          <p>🌟 You both liked each other!</p>
          <p>💬 Start a conversation in Farcaster</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
