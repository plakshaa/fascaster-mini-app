"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@/hooks/use-sign-in";
import { useCharmCaster } from "@/hooks/use-charm-caster";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useAccount, useConnect } from "wagmi";
import WelcomeFrame from "./WelcomeFrame";
import ProfileFrame from "./ProfileFrame";
import MatchFrame from "./MatchFrame";
import EnhancedMatchFrame from "./EnhancedMatchFrame";
import { NotificationsFrame } from "./NotificationsFrame";
import { Match } from "@/types/charm-caster";
import { motion, AnimatePresence } from "framer-motion";

type AppState = "welcome" | "sign-in" | "browsing" | "match" | "no-more-profiles" | "notifications";

export default function CharmCasterApp() {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [useEnhancedMatch, setUseEnhancedMatch] = useState(true); // Toggle for enhanced match frame
  
  const { context, isMiniAppReady } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  
  const { signIn, isLoading: isSigningIn, isSignedIn, user, error: signInError } = useSignIn({
    autoSignIn: false,
  });

  // Auto-connect wallet when mini app is ready
  useEffect(() => {
    if (isMiniAppReady && !isConnected && connectors.length > 0) {
      console.log("Auto-connecting wallet...");
      connect({ connector: connectors[0] });
    }
  }, [isMiniAppReady, isConnected, connect, connectors]);

  const currentUserFid = typeof context?.user?.fid === 'number' ? context.user.fid : 
                      typeof user?.fid === 'number' ? user.fid : undefined;
  
  const {
    currentProfile,
    matches,
    matchRequests,
    notifications,
    isLoading,
    profilesLoading,
    profilesError,
    hasMoreProfiles,
    nextProfile,
    matchProfile,
    passProfile,
    mintMatchNFT,
    resetMatching,
    respondToMatchRequest,
    markNotificationRead,
    fetchNotifications,
    fetchMatchRequests,
    fetchRealProfiles
  } = useCharmCaster(currentUserFid);

  // Debug logging
  console.log("CharmCasterApp state:", {
    appState,
    currentUserFid,
    isConnected,
    isSignedIn,
    isMiniAppReady,
    currentProfile: currentProfile?.display_name || "None",
    hasMoreProfiles,
    matchesCount: matches.length,
    profilesLoading,
    profilesError
  });

  const handleRetryProfiles = async () => {
    if (fetchRealProfiles) {
      await fetchRealProfiles();
    }
  };

  const handleStartMatching = () => {
    if (!isMiniAppReady) {
      console.log("Mini app not ready yet");
      return;
    }
    
    if (!isConnected) {
      console.log("Wallet not connected");
      return;
    }
    
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
    if (!currentProfile) {
      console.error("No current profile to match");
      return;
    }
    
    try {
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
    } catch (error) {
      console.error("Error in handleMatch:", error);
      // Continue to next profile on error
      if (hasMoreProfiles) {
        setAppState("browsing");
      } else {
        setAppState("no-more-profiles");
      }
    }
  };

  const handleNext = () => {
    if (!currentProfile) {
      console.error("No current profile to pass");
      return;
    }
    
    try {
      passProfile(currentProfile);
      if (!hasMoreProfiles) {
        setAppState("no-more-profiles");
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
      if (!hasMoreProfiles) {
        setAppState("no-more-profiles");
      }
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

  const handleRestart = async () => {
    resetMatching();
    setCurrentMatch(null);
    setAppState("browsing");
    // Fetch fresh profiles
    if (fetchRealProfiles) {
      await fetchRealProfiles();
    }
  };

  const handleShowNotifications = () => {
    setAppState("notifications");
  };

  const handleCloseNotifications = () => {
    setAppState("browsing");
  };

  const handleRespondToMatchRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    await respondToMatchRequest(requestId, status);
    // Refresh the data
    fetchNotifications();
    fetchMatchRequests();
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length + 
                     matchRequests.filter(r => r.status === 'pending').length;

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
            <WelcomeFrame 
              onStartMatching={handleStartMatching} 
              isReady={isMiniAppReady}
              isConnected={isConnected}
            />
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
              
              {!isConnected && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2">
                  <p className="text-white/80 text-sm">Wallet not connected</p>
                  <button
                    onClick={() => connectors.length > 0 && connect({ connector: connectors[0] })}
                    className="px-6 py-3 bg-white/20 text-white font-medium rounded-full hover:bg-white/30 transition-all duration-300"
                  >
                    🔗 Connect Wallet
                  </button>
                </div>
              )}
              
              {isConnected && (
                <div className="space-y-4">
                  {signInError && (
                    <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-4">
                      <p className="text-white/90 text-sm">Error: {signInError}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isSigningIn ? "Signing in..." : "🔗 Sign in with Farcaster"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {appState === "browsing" && profilesLoading && (
          <motion.div
            key="loading-profiles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white text-lg">Loading real Farcaster profiles...</p>
              <p className="text-white/80 text-sm">Finding your perfect matches ✨</p>
            </div>
          </motion.div>
        )}

        {appState === "browsing" && profilesError && (
          <motion.div
            key="profiles-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4"
          >
            <div className="text-center space-y-6 max-w-md">
              <h2 className="text-3xl font-bold text-white">
                Oops! Something went wrong 😅
              </h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2">
                <p className="text-white/80 text-sm">
                  {profilesError}
                </p>
              </div>
              <button
                onClick={handleRetryProfiles}
                className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                🔄 Try Again
              </button>
            </div>
          </motion.div>
        )}

        {appState === "browsing" && !profilesLoading && !profilesError && currentProfile && (
          <motion.div
            key={`profile-${currentProfile.fid}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Notification button */}
            <motion.button
              onClick={handleShowNotifications}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </motion.button>

            {/* NFT Mode Toggle (for testing) */}
            <motion.button
              onClick={() => setUseEnhancedMatch(!useEnhancedMatch)}
              className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all text-xs font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {useEnhancedMatch ? '🎨 Enhanced' : '🔄 Classic'}
            </motion.button>

            <ProfileFrame
              profile={currentProfile}
              onMatch={handleMatch}
              onNext={handleNext}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {appState === "browsing" && !profilesLoading && !profilesError && !currentProfile && hasMoreProfiles && (
          <motion.div
            key="loading-profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white text-lg">Loading next profile...</p>
            </div>
          </motion.div>
        )}

        {appState === "browsing" && !profilesLoading && !profilesError && !currentProfile && !hasMoreProfiles && (
          <motion.div
            key="auto-redirect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onAnimationComplete={() => setAppState("no-more-profiles")}
            className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4"
          >
            <div className="text-center space-y-4">
              <p className="text-white text-lg">No more profiles to show...</p>
            </div>
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
            {useEnhancedMatch ? (
              <EnhancedMatchFrame
                matchedProfile={currentProfile}
                userWalletAddress={address || ''}
                onContinue={handleContinueMatching}
                showAsModal={false}
              />
            ) : (
              <MatchFrame
                matchedProfile={currentProfile}
                onContinue={handleContinueMatching}
                onMintNFT={handleMintNFT}
                isNftMinting={isLoading}
              />
            )}
          </motion.div>
        )}

        {appState === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400 flex items-center justify-center p-4"
          >
            <NotificationsFrame
              notifications={notifications}
              matchRequests={matchRequests}
              onMarkAsRead={markNotificationRead}
              onRespondToRequest={handleRespondToMatchRequest}
              onClose={handleCloseNotifications}
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
                🔄 Load New Profiles
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
