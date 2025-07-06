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

export interface MatchRequest {
  id: string;
  fromFid: number;
  toFid: number;
  fromProfile: CharmProfile;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
}

export interface Match {
  id: string;
  user1Fid: number;
  user2Fid: number;
  user1Profile: CharmProfile;
  user2Profile: CharmProfile;
  createdAt: Date;
  onChain?: boolean;
  txHash?: string;
  nftMinted?: boolean;
  nftTokenId?: string;
}

export interface NotificationData {
  id: string;
  type: 'match_request' | 'match_confirmed' | 'nft_ready' | 'nft_minted';
  fromFid: number;
  toFid: number;
  fromProfile: CharmProfile;
  matchId?: string;
  requestId?: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export interface MatchState {
  currentProfile: CharmProfile | null;
  matches: Match[];
  matchRequests: MatchRequest[];
  notifications: NotificationData[];
  potentialMatches: CharmProfile[];
  currentIndex: number;
}
