"use client";

import { useState } from "react";
import { useSignIn } from "@/hooks/use-sign-in";
import { useCharmCaster } from "@/hooks/use-charm-caster";
import { useMiniApp } from "@/contexts/miniapp-context";
import WelcomeFrame from "./WelcomeFrame";
import ProfileFrame from "./ProfileFrame";
import MatchFrame from "./MatchFrame";
import { Match } from "@/types/charm-caster";
import { motion, AnimatePresence } from "framer-motion";

type AppState = "welcome" | "sign-in" | "browsing" | "match" | "no-more-profiles";

export default function CharmCasterApp() {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  
  const { context } = useMiniApp();
  const { signIn, isLoading: isSigningIn, isSignedIn, user } = useSignIn({
    autoSignIn: false,
  });

  const currentUserFid = typeof context?.user?.fid === 'number' ? context.user.fid : 
                      typeof user?.fid === 'number' ? user.fid : undefined;
  
  const {
    currentProfile,
    matches,
    isLoading,
    hasMoreProfiles,
    nextProfile,
    matchProfile,
    passProfile,
    mintMatchNFT,
    resetMatching
  } = useCharmCaster(currentUserFid);

  const handleStartMatching = () => {
    if (!isSignedIn) {
      setAppState("sign-in");
    } else {
      setAppState("browsing");
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
      setAppState("browsing");
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleMatch = async () => {
    if (!currentProfile) return;
    
    const match = await matchProfile(currentProfile);
    
    if (match) {
      setCurrentMatch(match);
      setAppState("match");
    } else {
      // No mutual match, continue browsing
      if (hasMoreProfiles) {
        setAppState("browsing");
      } else {
        setAppState("no-more-profiles");
      }
    }
  };

  const handleNext = () => {
    if (!currentProfile) return;
    passProfile(currentProfile);
    if (!hasMoreProfiles) {
      setAppState("no-more-profiles");
    }
  };

  const handleContinueMatching = () => {
    setCurrentMatch(null);
    if (hasMoreProfiles) {
      setAppState("browsing");
    } else {
      setAppState("no-more-profiles");
    }
  };

  const handleMintNFT = async () => {
    if (!currentMatch) return;
    
    try {
      await mintMatchNFT(currentMatch);
      // Could show success message here
    } catch (error) {
      console.error("Failed to mint NFT:", error);
      // Could show error message here
    }
  };

  const handleRestart = () => {
    resetMatching();
    setCurrentMatch(null);
    setAppState("browsing");
  };

  // Render based on current state
  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {appState === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeFrame onStartMatching={handleStartMatching} />
          </motion.div>
        )}

        {appState === "sign-in" && (
          <motion.div
            key="sign-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4"
          >
            <div className="text-center space-y-6 max-w-md">
              <h2 className="text-3xl font-bold text-white">
                Sign in to start matching! ✨
              </h2>
              <p className="text-white/80">
                Connect your Farcaster account to find your charm
              </p>
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
              >
                {isSigningIn ? "Signing in..." : "🔗 Sign in with Farcaster"}
              </button>
            </div>
          </motion.div>
        )}

        {appState === "browsing" && currentProfile && (
          <motion.div
            key={`profile-${currentProfile.fid}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileFrame
              profile={currentProfile}
              onMatch={handleMatch}
              onNext={handleNext}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {appState === "match" && currentMatch && currentProfile && (
          <motion.div
            key="match"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            <MatchFrame
              matchedProfile={currentProfile}
              onContinue={handleContinueMatching}
              onMintNFT={handleMintNFT}
              isNftMinting={isLoading}
            />
          </motion.div>
        )}

        {appState === "no-more-profiles" && (
          <motion.div
            key="no-more"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4"
          >
            <div className="text-center space-y-6 max-w-md">
              <h2 className="text-3xl font-bold text-white">
                You&apos;ve seen everyone! 🌟
              </h2>
              <p className="text-white/80">
                Come back later for more charming profiles, or check out your matches!
              </p>
              
              {matches.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2">
                  <h3 className="text-white font-semibold">Your Matches</h3>
                  <p className="text-white/80 text-sm">
                    You have {matches.length} match{matches.length !== 1 ? "es" : ""}! 💕
                  </p>
                </div>
              )}
              
              <button
                onClick={handleRestart}
                className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                🔄 Browse Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
