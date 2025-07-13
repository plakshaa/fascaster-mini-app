import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWalletAddress: string;
  matchData?: {
    matchedUserName?: string;
    matchedUserAvatar?: string;
  };
}

export const MintNFTModal: React.FC<MintNFTModalProps> = ({
  isOpen,
  onClose,
  userWalletAddress,
  matchData
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  // Your real IPFS metadata URI
  const CHARM_NFT_URI = 'https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4';

  const handleMintNFT = async () => {
    if (!userWalletAddress) {
      setMintError('No wallet address available');
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
        
        // Show success toast
        showToast('🎉 You just minted your Charm Match NFT!', 'success');
        
        // Optional: Auto-close modal after success
        setTimeout(() => {
          onClose();
        }, 3000);
        
      } else {
        throw new Error(result.error || 'Failed to mint NFT');
      }

    } catch (error) {
      console.error('❌ Minting failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
      setMintError(errorMessage);
      showToast(`❌ Minting failed: ${errorMessage}`, 'error');
    } finally {
      setIsMinting(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation - you can replace with your preferred toast library
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">🎉 Match Celebration!</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            {matchData?.matchedUserName && (
              <p className="text-purple-100 mt-1">
                You matched with {matchData.matchedUserName}!
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {!mintSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                    💎
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Mint Your Charm NFT
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Commemorate this magical match with a unique NFT on the Celo blockchain
                  </p>
                </div>

                {/* NFT Preview */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Charm Match NFT</h4>
                      <p className="text-sm text-gray-600">Epic 🔥 • Mutual Vibe</p>
                    </div>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="bg-blue-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Minting to:</span>
                  </p>
                  <p className="text-xs text-blue-600 font-mono mt-1 break-all">
                    {userWalletAddress}
                  </p>
                </div>

                {/* Error Display */}
                {mintError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">{mintError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleMintNFT}
                    disabled={isMinting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isMinting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Minting...</span>
                      </>
                    ) : (
                      <>
                        <span>✅ Mint Your Charm NFT</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  🎉
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  NFT Minted Successfully!
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your Charm Match NFT has been minted and added to your wallet
                </p>
                <button
                  onClick={onClose}
                  className="bg-green-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-600 transition-colors"
                >
                  Awesome!
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MintNFTModal;
