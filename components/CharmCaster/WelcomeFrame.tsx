"use client";

import { motion } from "framer-motion";

interface WelcomeFrameProps {
  onStartMatching: () => void;
  isReady?: boolean;
  isConnected?: boolean;
}

export default function WelcomeFrame({ onStartMatching, isReady = true, isConnected = true }: WelcomeFrameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-md"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            ✨ Charm Caster
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Ready to meet someone charming?
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <p className="text-white/80 text-lg">
            Quick, delightful matching for meaningful connections
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartMatching}
            disabled={!isReady || !isConnected}
            className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isReady ? "🔄 Loading..." : !isConnected ? "🔗 Connecting..." : "💫 Start Matching"}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-white/60 text-sm space-y-2"
        >
          <p>No swiping, no complex flows — just pure, fast matching</p>
          {!isReady && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <span>Setting up mini app...</span>
            </div>
          )}
          {isReady && !isConnected && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Connecting wallet...</span>
            </div>
          )}
          {isReady && isConnected && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Ready to match!</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
