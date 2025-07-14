"use client";

import { useState } from 'react';
import { CharmProfile } from '@/types/charm-caster';

interface DevelopmentControlsProps {
  onSimulateMatch: (profile: CharmProfile) => void;
  onForceMatchState: (profile: CharmProfile) => void;
  onTestNFTMint: () => void;
  lastLikedProfile: CharmProfile | null;
  walletAddress: string;
}

export default function DevelopmentControls({ 
  onSimulateMatch, 
  onForceMatchState,
  onTestNFTMint,
  lastLikedProfile,
  walletAddress 
}: DevelopmentControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development' || 
      process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true') {
    return null;
  }
  
  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-yellow-800">🛠️ Dev Mode</h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-yellow-600 hover:text-yellow-800 font-bold"
          >
            {isOpen ? '▲' : '▼'}
          </button>
        </div>
        
        {isOpen && (
          <div className="space-y-3">
            <div className="text-xs text-yellow-700">
              <p>🎯 Testing Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>Like someone by clicking ❤️</li>
                <li>Click "Simulate Match Back" below</li>
                <li>Check notifications for the match</li>
                <li>Test NFT minting!</li>
              </ol>
              <p className="mt-2 font-medium">Wallet: {walletAddress || 'Not connected'}</p>
            </div>
            
            {lastLikedProfile && (
              <div className="bg-white p-2 rounded border">
                <p className="text-xs font-medium text-gray-700">Last Liked:</p>
                <p className="text-xs text-gray-600">{lastLikedProfile.display_name}</p>
              </div>
            )}
            
            <button
              onClick={() => {
                if (lastLikedProfile) {
                  console.log('🎯 Attempting to simulate match with:', lastLikedProfile);
                  onSimulateMatch(lastLikedProfile);
                } else {
                  alert('First like someone, then simulate them matching back!');
                }
              }}
              disabled={!lastLikedProfile}
              className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                lastLikedProfile 
                  ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {lastLikedProfile ? '🎯 Simulate Match Back' : '❤️ Like Someone First'}
            </button>
            
            <button
              onClick={() => {
                if (lastLikedProfile) {
                  console.log('🚀 Force match state for NFT testing:', lastLikedProfile);
                  onForceMatchState(lastLikedProfile);
                } else {
                  alert('First like someone to test match state!');
                }
              }}
              disabled={!lastLikedProfile}
              className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                lastLikedProfile 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {lastLikedProfile ? '🚀 Force Match State (NFT Test)' : '❤️ Like Someone First'}
            </button>
            
            <button
              onClick={() => {
                window.open(`http://localhost:3001/api/debug/1108732`, '_blank');
              }}
              className="w-full px-3 py-2 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white"
            >
              🔍 Debug Redis Data
            </button>
            
            <button
              onClick={onTestNFTMint}
              className="w-full px-3 py-2 rounded text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white"
            >
              🎨 Test NFT Mint Directly
            </button>
            
            <div className="text-xs text-yellow-600">
              <p>💡 This simulates {lastLikedProfile?.display_name || 'the user'} matching back with you!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
