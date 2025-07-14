"use client";

import { CharmProfile, Match, MatchState, MatchRequest, NotificationData } from "@/types/charm-caster";
import { useCallback, useState, useEffect } from "react";

export const useCharmCaster = (currentUserFid?: number) => {
  const initialState: MatchState = {
    currentProfile: null,
    matches: [],
    matchRequests: [],
    notifications: [],
    potentialMatches: [],
    currentIndex: 0
  };
  
  const [matchState, setMatchState] = useState<MatchState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  // Fetch real Farcaster profiles
  const fetchRealProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError(null);
    
    try {
      console.log("🔄 Fetching real Farcaster profiles...");
      const response = await fetch('/api/profiles/real');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Fetched ${data.profiles?.length || 0} real profiles from ${data.source}`);
      
      if (data.profiles && data.profiles.length > 0) {
        // Filter out current user if they're in the results
        const filteredProfiles = data.profiles.filter((profile: CharmProfile) => 
          profile.fid !== currentUserFid
        );
        
        setMatchState(prev => ({
          ...prev,
          potentialMatches: filteredProfiles,
          currentIndex: 0
        }));
        
        console.log(`📋 Loaded ${filteredProfiles.length} potential matches`);
      } else {
        setProfilesError("No profiles available");
      }
    } catch (error) {
      console.error("❌ Error fetching real profiles:", error);
      
      let errorMessage = "Failed to load profiles";
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = "Authentication error - API key issue";
        } else if (error.message.includes('403')) {
          errorMessage = "Access denied - Check API permissions";
        } else if (error.message.includes('429')) {
          errorMessage = "Rate limit exceeded - Try again later";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error - Try again in a moment";
        } else {
          errorMessage = error.message;
        }
      }
      
      setProfilesError(errorMessage);
    } finally {
      setProfilesLoading(false);
    }
  }, [currentUserFid]);

  // Fetch notifications, match requests, and profiles on mount
  useEffect(() => {
    if (currentUserFid) {
      fetchRealProfiles();
      fetchNotifications();
      fetchMatchRequests();
      
      // Set up periodic refresh for notifications
      const interval = setInterval(() => {
        fetchNotifications();
        fetchMatchRequests();
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserFid]);

  // Fetch user's notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUserFid) {
      console.log('🔍 fetchNotifications: No currentUserFid');
      return;
    }
    
    console.log('🔍 fetchNotifications: Fetching for FID:', currentUserFid);
    
    try {
      const response = await fetch(`/api/notifications/${currentUserFid}`);
      console.log('🔍 fetchNotifications: Response status:', response.status);
      
      if (response.ok) {
        const notifications = await response.json();
        console.log('🔍 fetchNotifications: Received notifications:', notifications);
        setMatchState(prev => ({
          ...prev,
          notifications: notifications || []
        }));
      } else {
        console.error('🔍 fetchNotifications: Response not ok:', response.status);
      }
    } catch (error) {
      console.error("🔍 fetchNotifications: Error:", error);
    }
  }, [currentUserFid]);

  // Fetch match requests
  const fetchMatchRequests = useCallback(async () => {
    if (!currentUserFid) return;
    
    try {
      const response = await fetch(`/api/match-requests/${currentUserFid}`);
      if (response.ok) {
        const requests = await response.json();
        setMatchState(prev => ({
          ...prev,
          matchRequests: requests || []
        }));
      }
    } catch (error) {
      console.error("Error fetching match requests:", error);
    }
  }, [currentUserFid]);

  // Get the current profile to show
  const getCurrentProfile = useCallback(() => {
    if (matchState.currentIndex >= matchState.potentialMatches.length) {
      return null; // No more profiles
    }
    return matchState.potentialMatches[matchState.currentIndex];
  }, [matchState.currentIndex, matchState.potentialMatches]);

  // Move to next profile safely
  const nextProfile = useCallback(() => {
    setMatchState(prev => {
      const newIndex = prev.currentIndex + 1;
      console.log(`Moving to next profile. Current index: ${prev.currentIndex}, New index: ${newIndex}, Total profiles: ${prev.potentialMatches.length}`);
      
      return {
        ...prev,
        currentIndex: newIndex,
        currentProfile: null
      };
    });
  }, []);

  // Handle matching with someone - sends match request
  const matchProfile = useCallback(async (profile: CharmProfile) => {
    if (!currentUserFid) {
      console.error("No current user FID");
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log(`💕 Sending match request to ${profile.display_name} (FID: ${profile.fid})`);
      
      // Send match request
      const response = await fetch(`/api/match-requests/${profile.fid}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromFid: currentUserFid,
          fromProfile: {
            fid: currentUserFid,
            username: 'current_user', // In a real app, get this from context
            display_name: 'Current User', // In a real app, get this from context
            pfp_url: '',
            follower_count: 0,
            following_count: 0
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Match request already exists") {
          console.log("Match request already sent to this user");
          nextProfile();
          return null;
        }
        throw new Error('Failed to send match request');
      }

      const requestData = await response.json();
      
      if (requestData.isInstantMatch) {
        // It's an instant match!
        const newMatch: Match = {
          id: crypto.randomUUID(),
          user1Fid: requestData.matchData.user1Fid,
          user2Fid: requestData.matchData.user2Fid,
          user1Profile: requestData.matchData.user1Profile,
          user2Profile: requestData.matchData.user2Profile,
          createdAt: new Date(),
          onChain: false
        };

        setMatchState(prev => ({
          ...prev,
          matches: [...prev.matches, newMatch]
        }));

        console.log("🎉 Instant match!");
        nextProfile();
        return newMatch;
      } else {
        // Regular match request sent - create a notification for the recipient
        await fetch(`/api/notifications/${profile.fid}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'match_request',
            fromFid: currentUserFid,
            fromProfile: {
              fid: currentUserFid,
              username: 'current_user',
              display_name: 'Current User',
              pfp_url: '',
              follower_count: 0,
              following_count: 0
            },
            requestId: requestData.id,
            message: `You have a new match request!`
          })
        });

        console.log("📤 Match request sent successfully");
        nextProfile();
        return null;
      }
    } catch (error) {
      console.error("Error sending match request:", error);
      nextProfile();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentUserFid, nextProfile]);

  // Handle passing on someone
  const passProfile = useCallback(async (profile: CharmProfile) => {
    if (!currentUserFid) {
      console.error("No current user FID");
      return;
    }

    console.log(`Passing on ${profile.display_name} (FID: ${profile.fid})`);
    
    // Just move to next profile for passing
    nextProfile();
  }, [currentUserFid, nextProfile]);

  // Mint match NFT on Celo (placeholder)
  const mintMatchNFT = useCallback(async (match: Match) => {
    setIsLoading(true);
    
    try {
      console.log("Minting NFT for match:", match.id);
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call the smart contract
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      
      setMatchState(prev => ({
        ...prev,
        matches: prev.matches.map(m => 
          m.id === match.id 
            ? { ...m, onChain: true, txHash: mockTxHash }
            : m
        )
      }));

      return mockTxHash;
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset to show more profiles
  const resetMatching = useCallback(() => {
    console.log("Resetting matching to start over");
    setMatchState(prev => ({
      ...prev,
      currentIndex: 0,
      currentProfile: null
    }));
  }, []);

  // Handle match request response (accept/decline)
  const respondToMatchRequest = useCallback(async (requestId: string, status: 'accepted' | 'declined') => {
    if (!currentUserFid) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/match-requests/${currentUserFid}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to respond to match request');
      }

      const updatedRequest = await response.json();

      // Update local state
      setMatchState(prev => ({
        ...prev,
        matchRequests: prev.matchRequests.map(req => 
          req.id === requestId ? updatedRequest : req
        )
      }));

      if (status === 'accepted') {
        // Create a match
        const match: Match = {
          id: crypto.randomUUID(),
          user1Fid: updatedRequest.fromFid,
          user2Fid: currentUserFid,
          user1Profile: updatedRequest.fromProfile,
          user2Profile: {
            fid: currentUserFid,
            username: 'current_user',
            display_name: 'Current User',
            pfp_url: '',
            follower_count: 0,
            following_count: 0
          },
          createdAt: new Date(),
          onChain: false
        };

        setMatchState(prev => ({
          ...prev,
          matches: [...prev.matches, match]
        }));

        // Notify the other person about the match
        await fetch(`/api/notifications/${updatedRequest.fromFid}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'match_confirmed',
            fromFid: currentUserFid,
            fromProfile: {
              fid: currentUserFid,
              username: 'current_user',
              display_name: 'Current User',
              pfp_url: '',
              follower_count: 0,
              following_count: 0
            },
            matchId: match.id,
            message: `🎉 You have a new match!`
          })
        });

        console.log("🎉 Match created successfully!");
      }

      // Refresh data
      fetchMatchRequests();
      fetchNotifications();

    } catch (error) {
      console.error("Error responding to match request:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserFid, fetchMatchRequests, fetchNotifications]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    if (!currentUserFid) return;

    try {
      await fetch(`/api/notifications/${currentUserFid}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId,
          read: true
        })
      });

      // Update local state
      setMatchState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [currentUserFid]);

  // Check if there are more profiles
  const hasMoreProfiles = matchState.currentIndex < matchState.potentialMatches.length;

  // Get current profile
  const currentProfile = getCurrentProfile();

  console.log("useCharmCaster state:", {
    currentIndex: matchState.currentIndex,
    totalProfiles: matchState.potentialMatches.length,
    hasMoreProfiles,
    currentProfile: currentProfile?.display_name || "None",
    matchesCount: matchState.matches.length
  });

  return {
    currentProfile,
    matches: matchState.matches,
    matchRequests: matchState.matchRequests,
    notifications: matchState.notifications,
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
  };
};
