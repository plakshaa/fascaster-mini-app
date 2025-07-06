export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio?: string;
  follower_count: number;
  following_count: number;
}

export interface CharmProfile extends FarcasterUser {
  age?: number;
  location?: string;
  interests?: string[];
  isLiked?: boolean;
  matchedAt?: Date;
}

export interface Match {
  id: string;
  user1Fid: number;
  user2Fid: number;
  createdAt: Date;
  onChain?: boolean;
  txHash?: string;
}

export interface MatchState {
  currentProfile: CharmProfile | null;
  matches: Match[];
  potentialMatches: CharmProfile[];
  currentIndex: number;
}
