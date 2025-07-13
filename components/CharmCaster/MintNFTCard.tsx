import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MintNFTCardProps {
  userWalletAddress: string;
  onMintSuccess?: (result: any) => void;
  onMintError?: (error: string) => void;
  className?: string;
}

export const MintNFTCard: React.FC<MintNFTCardProps> = ({
  userWalletAddress,
  onMintSuccess,
  onMintError,
  className = ""
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  // Your real IPFS metadata URI
  const CHARM_NFT_URI = 'https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4';

  const handleMintNFT = async () => {
    if (!userWalletAddress) {
      const error = 'No wallet address available';
      setMintError(error);
      onMintError?.(error);
      return;
    }

    setIsMinting(true);
    setMintError(null);

    try {
      console.log('🎨 Minting Charm NFT...');
      
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userWalletAddress,
          tokenURI: CHARM_NFT_URI
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ NFT minted successfully!', result);
        setMintSuccess(true);
        onMintSuccess?.(result);
        
        // Show success message
        alert('🎉 You just minted your Charm Match NFT!');
        
      } else {
        throw new Error(result.error || 'Failed to mint NFT');
      }

    } catch (error) {
      console.error('❌ Minting failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
      setMintError(errorMessage);
      onMintError?.(errorMessage);
      alert(`❌ Minting failed: ${errorMessage}`);
    } finally {
      setIsMinting(false);
    }
  };

  if (mintSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-green-50 border border-green-200 rounded-xl p-6 ${className}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
            🎉
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            NFT Minted Successfully!
          </h3>
          <p className="text-green-600 text-sm">
            Your Charm Match NFT is now in your wallet
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 ${className}`}
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white">
          💎
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Mint Your Charm NFT
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          Commemorate this match with a unique NFT
        </p>

        {/* NFT Preview */}
        <div className="bg-white rounded-lg p-3 mb-4 border">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">✨</span>
            <div className="text-left">
              <div className="font-medium text-gray-800 text-sm">Charm Match NFT</div>
              <div className="text-xs text-gray-500">Epic 🔥 • Mutual Vibe</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {mintError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{mintError}</p>
          </div>
        )}

        {/* Mint Button */}
        <button
          onClick={handleMintNFT}
          disabled={isMinting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isMinting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Minting...</span>
            </>
          ) : (
            <span>✅ Mint Your Charm NFT</span>
          )}
        </button>

        {/* Wallet Info */}
        <div className="mt-3 text-xs text-gray-500">
          Minting to: {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
        </div>
      </div>
    </motion.div>
  );
};

export default MintNFTCard;
