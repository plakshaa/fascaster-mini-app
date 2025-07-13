import React, { useState } from 'react';
import Image from 'next/image';
import MintNFTCard from './MintNFTCard';
import MintNFTModal from './MintNFTModal';

interface EnhancedMatchFrameProps {
  matchedProfile: {
    display_name: string;
    username: string;
    pfp_url: string;
    bio?: string;
  };
  userWalletAddress: string;
  onContinue: () => void;
  showAsModal?: boolean; // Choose between modal or inline card
}

export const EnhancedMatchFrame: React.FC<EnhancedMatchFrameProps> = ({
  matchedProfile,
  userWalletAddress,
  onContinue,
  showAsModal = false
}) => {
  const [showMintModal, setShowMintModal] = useState(false);
  const [showMintCard, setShowMintCard] = useState(true);

  const handleMintSuccess = (result: any) => {
    console.log('🎉 NFT minted successfully!', result);
    setShowMintCard(false);
    
    // You can add additional success handling here
    // For example, update user state, analytics, etc.
  };

  const handleMintError = (error: string) => {
    console.error('❌ NFT minting failed:', error);
    // Handle error - maybe show a retry button or different UI
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        
        {/* Match Celebration Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            It&apos;s a Match!
          </h1>
          <p className="text-xl text-white/90">
            You&apos;ve charmed each other ✨
          </p>
        </div>

        {/* Matched Profile Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <Image
              src={matchedProfile.pfp_url}
              alt={matchedProfile.display_name}
              fill
              className="object-cover rounded-full border-4 border-white"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {matchedProfile.display_name}
            </h3>
            <p className="text-gray-600">@{matchedProfile.username}</p>
          </div>

          {matchedProfile.bio && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {matchedProfile.bio.slice(0, 100)}
              {matchedProfile.bio.length > 100 && '...'}
            </p>
          )}
        </div>

        {/* NFT Minting Section */}
        {showAsModal ? (
          /* Modal Version */
          <div className="space-y-4">
            <button
              onClick={() => setShowMintModal(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg"
            >
              🏆 Mint Your Charm NFT
            </button>
            
            <MintNFTModal
              isOpen={showMintModal}
              onClose={() => setShowMintModal(false)}
              userWalletAddress={userWalletAddress}
              matchData={{
                matchedUserName: matchedProfile.display_name,
                matchedUserAvatar: matchedProfile.pfp_url
              }}
            />
          </div>
        ) : (
          /* Inline Card Version */
          showMintCard && (
            <MintNFTCard
              userWalletAddress={userWalletAddress}
              onMintSuccess={handleMintSuccess}
              onMintError={handleMintError}
            />
          )
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-3 px-6 bg-white text-purple-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          💫 Continue Matching
        </button>

        {/* Fun Facts */}
        <div className="text-white/60 text-sm space-y-2">
          <p>🌟 You both liked each other!</p>
          <p>💬 Start a conversation in Farcaster</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMatchFrame;
