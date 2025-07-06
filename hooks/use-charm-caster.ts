"use client";

import { CharmProfile, Match, MatchState } from "@/types/charm-caster";
import { useCallback, useEffect, useState } from "react";

export const useCharmCaster = (currentUserFid?: number) => {
  const [matchState, setMatchState] = useState<MatchState>({
    currentProfile: null,
    matches: [],
    potentialMatches: [],
    currentIndex: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedProfiles, setHasLoadedProfiles] = useState(false);

  // Load potential matches from API
  const loadPotentialMatches = useCallback(async () => {
    if (!currentUserFid || hasLoadedProfiles) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/matches/potential', {
        credentials: 'include',
        headers: {
          'x-user-fid': currentUserFid.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMatchState(prev => ({
          ...prev,
          potentialMatches: data.matches || [],
          currentIndex: 0
        }));
        setHasLoadedProfiles(true);
      }
    } catch (error) {
      console.error('Failed to load potential matches:', error);
      // Fallback to mock data
      setMatchState(prev => ({
        ...prev,
        potentialMatches: MOCK_PROFILES,
        currentIndex: 0
      }));
      setHasLoadedProfiles(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserFid, hasLoadedProfiles]);

  // Load potential matches when component mounts
  useEffect(() => {
    if (currentUserFid && !hasLoadedProfiles) {
      loadPotentialMatches();
    }
  }, [currentUserFid, hasLoadedProfiles, loadPotentialMatches]);

  // Get the current profile to show
  const getCurrentProfile = useCallback(() => {
    if (matchState.currentIndex >= matchState.potentialMatches.length) {
      return null; // No more profiles
    }
    return matchState.potentialMatches[matchState.currentIndex];
  }, [matchState.currentIndex, matchState.potentialMatches]);

  // Move to next profile
  const nextProfile = useCallback(() => {
    setMatchState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      currentProfile: null
    }));
  }, []);

  // Handle matching with someone
  const matchProfile = useCallback(async (profile: CharmProfile) => {
    if (!currentUserFid) return null;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-fid': currentUserFid.toString()
        },
        body: JSON.stringify({
          targetFid: profile.fid,
          action: 'like'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.match && data.matchData) {
          // It's a mutual match!
          const newMatch: Match = {
            id: `match_${data.matchData.user1Fid}_${data.matchData.user2Fid}_${Date.now()}`,
            user1Fid: data.matchData.user1Fid,
            user2Fid: data.matchData.user2Fid,
            createdAt: new Date(data.matchData.timestamp),
            onChain: false
          };

          setMatchState(prev => ({
            ...prev,
            matches: [...prev.matches, newMatch],
            currentIndex: prev.currentIndex + 1,
            currentProfile: profile
          }));

          return newMatch;
        } else {
          // No mutual match, just move to next
          nextProfile();
          return null;
        }
      } else {
        // API error, move to next
        nextProfile();
        return null;
      }
    } catch (error) {
      console.error("Error matching profile:", error);
      nextProfile();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentUserFid, nextProfile]);

  // Handle passing on someone
  const passProfile = useCallback(async (profile: CharmProfile) => {
    if (!currentUserFid) return;

    try {
      await fetch('/api/matches', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-fid': currentUserFid.toString()
        },
        body: JSON.stringify({
          targetFid: profile.fid,
          action: 'pass'
        })
      });
    } catch (error) {
      console.error("Error passing profile:", error);
    }
    
    nextProfile();
  }, [currentUserFid, nextProfile]);

  // Mint match NFT on Celo (placeholder)
  const mintMatchNFT = useCallback(async (match: Match) => {
    setIsLoading(true);
    
    try {
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
    setHasLoadedProfiles(false);
    setMatchState(prev => ({
      ...prev,
      currentIndex: 0,
      currentProfile: null,
      potentialMatches: []
    }));
  }, []);

  return {
    currentProfile: getCurrentProfile(),
    matches: matchState.matches,
    isLoading,
    hasMoreProfiles: matchState.currentIndex < matchState.potentialMatches.length,
    nextProfile,
    matchProfile,
    passProfile,
    mintMatchNFT,
    resetMatching,
    loadPotentialMatches
  };
};

// Mock data for fallback
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
  }
];
