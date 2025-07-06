"use client";

import { motion } from "framer-motion";

interface WelcomeFrameProps {
  onStartMatching: () => void;
}

export default function WelcomeFrame({ onStartMatching }: WelcomeFrameProps) {
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
            className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            💫 Start Matching
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-white/60 text-sm"
        >
          No swiping, no complex flows — just pure, fast matching
        </motion.div>
      </motion.div>
    </div>
  );
}
