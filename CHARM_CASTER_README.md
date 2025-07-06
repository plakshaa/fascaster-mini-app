# ✨ Charm Caster

**Find your charm on Farcaster** - Quick, delightful matching for meaningful connections.

## 🎯 What is Charm Caster?

Charm Caster is a minimal on-chain dating mini app built for Farcaster users. No swiping, no complex flows — just pure, fast, delightful matching.

### Core Features

#### Frame 1: Welcome Screen
- Beautiful gradient welcome screen
- "Ready to meet someone charming?" 
- **Button**: Start Matching ✨

#### Frame 2: Profile Browsing
- Display: Profile image, bio, Farcaster username, age, location, interests
- **Buttons**: ❤️ Match | ⏩ Next
- Real Farcaster user data via Neynar API
- Smooth animations and transitions

#### Frame 3: Match Celebration
- "It's a match! 🎉 You've charmed each other."
- Show matched profile details
- **Optional**: Mint match NFT on Celo blockchain
- **Button**: Continue Matching

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Blockchain**: Celo (for optional match NFTs)
- **Authentication**: Farcaster Quick Auth
- **UI**: Tailwind CSS + Framer Motion
- **Data**: Neynar API for real Farcaster users
- **Wallet**: Wagmi + Farcaster Frame Connector

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env.local`:
```bash
# Your tunnel URL (ngrok for development)
NEXT_PUBLIC_URL=https://your-ngrok-url.ngrok.io

# Farcaster manifest (generate at warpcast.com/~/developers/mini-apps/manifest)
NEXT_PUBLIC_FARCASTER_HEADER=
NEXT_PUBLIC_FARCASTER_PAYLOAD=
NEXT_PUBLIC_FARCASTER_SIGNATURE=

# Neynar API for Farcaster data
NEYNAR_API_KEY=your_neynar_api_key

# JWT secret for auth
JWT_SECRET=your_jwt_secret

# Redis for session management (optional)
REDIS_URL=
REDIS_TOKEN=
```

### 3. Start Development
```bash
npm run dev
```

### 4. Expose with Ngrok
```bash
ngrok http 3000
```

### 5. Update Environment
Update `NEXT_PUBLIC_URL` in `.env.local` with your ngrok URL.

### 6. Generate Farcaster Manifest
1. Go to [Farcaster Manifest Tool](https://warpcast.com/~/developers/mini-apps/manifest)
2. Enter your ngrok URL
3. Copy the generated values to your `.env.local`

## 💖 How It Works

### Matching Algorithm
1. **Browse**: Users see real Farcaster profiles with enhanced data (age, location, interests)
2. **Like**: Tap ❤️ to like someone
3. **Match**: If both users like each other, it's a match!
4. **Celebrate**: Beautiful match screen with optional NFT minting

### Data Flow
- **Profiles**: Fetched from Neynar API with random enhancements
- **Likes**: Stored in-memory (use Redis/database in production)
- **Matches**: Detected when mutual likes occur
- **NFTs**: Optional Celo smart contract integration

## 🏗️ Smart Contract (Optional)

Simple match recording contract on Celo:

```solidity
contract CharmCasterMatches {
    function recordMatch(uint256 fid1, uint256 fid2) external;
    function hasMatched(uint256 fid1, uint256 fid2) external view returns (bool);
    function getUserMatches(uint256 fid) external view returns (bytes32[] memory);
}
```

## 🎨 UI/UX Features

- **Smooth Animations**: Framer Motion for delightful interactions
- **Gradient Backgrounds**: Beautiful pink/purple gradients
- **Profile Cards**: Clean, modern design with user info
- **Match Celebrations**: Exciting success animations
- **Responsive**: Works great on mobile (Farcaster's primary platform)

## 📱 API Endpoints

- `GET /api/matches/potential` - Get potential matches for user
- `POST /api/matches` - Record like/pass action
- `GET /api/matches` - Get user's matches
- `GET /.well-known/farcaster.json` - Farcaster manifest

## 🔮 Future Enhancements

- **Real Database**: Replace in-memory storage with PostgreSQL/MongoDB
- **Advanced Matching**: ML-based compatibility scoring
- **Chat Integration**: Direct messaging between matches
- **Push Notifications**: Match alerts via Farcaster webhooks
- **NFT Marketplace**: Trade/display match NFTs
- **Profile Verification**: Enhanced authenticity checks

## 🌟 Why Charm Caster?

- **Fast**: No complex onboarding or lengthy profiles
- **Social**: Built for the Farcaster community
- **On-chain**: Optional blockchain proof of matches
- **Simple**: Clean, intuitive interface
- **Fun**: Delightful animations and celebrations

Start finding your charm today! ✨💕

---

Built with ❤️ for the Farcaster community
