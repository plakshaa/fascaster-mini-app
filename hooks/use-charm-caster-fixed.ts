"use client";

import { CharmProfile, Match, MatchState, MatchRequest, NotificationData } from "@/types/charm-caster";
import { useCallback, useState, useEffect } from "react";

// Mock data for demo - in a real app, this would come from Neynar API
const MOCK_PROFILES: CharmProfile[] = [
  {
    fid: 12345,
    username: "alice_crypto",
    display_name: "Alice Johnson",
    pfp_url: "https://images.unsplash.com/photo-1494790108755-2616b612b913?w=400&h=400&fit=crop&crop=face",
    bio: "DeFi enthusiast building the future of finance. Love hiking and good coffee ☕",
    follower_count: 2340,
    following_count: 567,
    age: 28,
    location: "San Francisco, CA",
    interests: ["DeFi", "Hiking", "Photography"]
  },
  {
    fid: 54321,
    username: "bob_builder",
    display_name: "Bob Smith",
    pfp_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Full-stack developer and Web3 creator. Always learning, always building 🚀",
    follower_count: 1890,
    following_count: 234,
    age: 32,
    location: "Austin, TX",
    interests: ["Web3", "Gaming", "Music"]
  },
  {
    fid: 67890,
    username: "charlie_art",
    display_name: "Charlie Davis",
    pfp_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    bio: "Digital artist creating NFTs that tell stories. Passionate about creativity and innovation ✨",
    follower_count: 3456,
    following_count: 789,
    age: 26,
    location: "Brooklyn, NY",
    interests: ["NFTs", "Art", "Travel"]
  },
  {
    fid: 98765,
    username: "diana_explorer",
    display_name: "Diana Wilson",
    pfp_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    bio: "Blockchain researcher exploring the intersection of tech and society. Adventure seeker 🌍",
    follower_count: 1567,
    following_count: 432,
    age: 30,
    location: "Denver, CO",
    interests: ["Research", "Adventure", "Tech"]
  },
  {
    fid: 11111,
    username: "emma_designer",
    display_name: "Emma Chen",
    pfp_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
    bio: "UI/UX designer crafting beautiful digital experiences. Coffee addict and cat lover 🐱",
    follower_count: 2890,
    following_count: 445,
    age: 27,
    location: "Seattle, WA",
    interests: ["Design", "Cats", "Coffee"]
  }
];

export const useCharmCaster = (currentUserFid?: number) => {
  const [matchState, setMatchState] = useState<MatchState>({
    currentProfile: null,
    matches: [],
    matchRequests: [],
    notifications: [],
    potentialMatches: MOCK_PROFILES,
    currentIndex: 0
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications and match requests on mount
  useEffect(() => {
    if (currentUserFid) {
      fetchNotifications();
      fetchMatchRequests();
      // Set up periodic refresh for notifications
      const interval = setInterval(() => {
        fetchNotifications();
        fetchMatchRequests();
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [currentUserFid]);

  // Fetch user's notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUserFid) return;
    
    try {
      const response = await fetch(`/api/notifications/${currentUserFid}`);
      if (response.ok) {
        const notifications = await response.json();
        setMatchState(prev => ({
          ...prev,
          notifications: notifications || []
        }));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
    hasMoreProfiles,
    nextProfile,
    matchProfile,
    passProfile,
    mintMatchNFT,
    resetMatching,
    respondToMatchRequest,
    markNotificationRead,
    fetchNotifications,
    fetchMatchRequests
  };
};
