// Usage example for integrating NFT minting into your match flow

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import MintNFTModal from '../components/CharmCaster/MintNFTModal';
import { MintNFTCard } from '../components/CharmCaster/MintNFTCard';
import { EnhancedMatchFrame } from '../components/CharmCaster/EnhancedMatchFrame';

// Example 1: Using the Modal Version
export function MatchPageWithModal() {
  const [showMintModal, setShowMintModal] = useState(false);
  const { address } = useAccount();
  
  const matchedProfile = {
    display_name: "Alice Johnson",
    username: "alice_crypto", 
    pfp_url: "https://example.com/avatar.jpg",
    bio: "DeFi enthusiast building the future of finance"
  };

  const handleMatchDetected = () => {
    // Show NFT minting modal when match is detected
    setShowMintModal(true);
  };

  return (
    <div>
      {/* Your existing match UI */}
      <div className="match-celebration">
        <h1>🎉 It&apos;s a Match!</h1>
        <button onClick={handleMatchDetected}>
          🏆 Mint Your Charm NFT
        </button>
      </div>

      {/* NFT Minting Modal */}
      <MintNFTModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        userWalletAddress={address || ''}
        matchData={{
          matchedUserName: matchedProfile.display_name,
          matchedUserAvatar: matchedProfile.pfp_url
        }}
      />
    </div>
  );
}

// Example 2: Using the Inline Card Version
export function MatchPageWithCard() {
  const { address } = useAccount();
  
  const handleMintSuccess = (result) => {
    console.log('🎉 NFT minted!', result);
    // Handle success - maybe navigate somewhere or update state
  };

  const handleMintError = (error) => {
    console.error('❌ Mint failed:', error);
    // Handle error - maybe show retry option
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Match celebration content */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">🎉 It&apos;s a Match!</h1>
        <p>You matched with Alice Johnson!</p>
      </div>

      {/* Inline NFT Minting Card */}
      <MintNFTCard
        userWalletAddress={address || ''}
        onMintSuccess={handleMintSuccess}
        onMintError={handleMintError}
      />

      {/* Continue button */}
      <button className="w-full py-3 bg-purple-500 text-white rounded-xl">
        Continue Matching
      </button>
    </div>
  );
}

// Example 3: Using the Complete Enhanced Match Frame
export function CompleteMatchPage() {
  const { address } = useAccount();
  
  const matchedProfile = {
    display_name: "Alice Johnson",
    username: "alice_crypto",
    pfp_url: "https://example.com/avatar.jpg",
    bio: "DeFi enthusiast building the future of finance"
  };

  const handleContinue = () => {
    // Navigate back to browsing or wherever
    console.log('Continue matching...');
  };

  return (
    <EnhancedMatchFrame
      matchedProfile={matchedProfile}
      userWalletAddress={address || ''}
      onContinue={handleContinue}
      showAsModal={false} // Set to true for modal version
    />
  );
}

// Example 4: Integration with your existing CharmCasterApp
export function IntegrateWithExistingApp() {
  /*
  In your existing CharmCasterApp.tsx, when a match is detected:
  
  1. Add state for showing NFT minting:
  const [showNFTMinting, setShowNFTMinting] = useState(false);
  
  2. In your match handling:
  const handleMatch = async () => {
    const match = await matchProfile(currentProfile);
    if (match) {
      setCurrentMatch(match);
      setShowNFTMinting(true); // Show NFT minting option
      setAppState("match");
    }
  };
  
  3. In your match state rendering:
  {appState === "match" && currentMatch && currentProfile && (
    <div>
      <MatchFrame
        matchedProfile={currentProfile}
        onContinue={handleContinueMatching}
      />
      
      {showNFTMinting && (
        <MintNFTCard
          userWalletAddress={address || ''}
          onMintSuccess={(result) => {
            console.log('NFT minted!', result);
            setShowNFTMinting(false);
          }}
          onMintError={(error) => {
            console.error('Mint failed:', error);
          }}
        />
      )}
    </div>
  )}
  */
}

const NFTMintingExamples = {
  MatchPageWithModal,
  MatchPageWithCard,
  CompleteMatchPage,
  IntegrateWithExistingApp
};

export default NFTMintingExamples;
