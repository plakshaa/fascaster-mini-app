// Utility functions for NFT minting in Charmcaster app

/**
 * Mint a Charm NFT for a matched user
 * @param {string} walletAddress - The wallet address to mint to
 * @param {string} tokenURI - The metadata URI for the NFT
 * @returns {Promise<Object>} - The mint result
 */
export async function mintCharmNFT(walletAddress, tokenURI) {
  try {
    console.log(`🎨 Minting Charm NFT for ${walletAddress}...`);
    
    const response = await fetch('/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: walletAddress,
        tokenURI: tokenURI
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to mint NFT');
    }
    
    console.log('✅ Charm NFT minted successfully!');
    console.log('Transaction:', result.transaction.hash);
    
    return {
      success: true,
      txHash: result.transaction.hash,
      tokenId: result.nft.tokenId,
      explorerUrl: result.explorer,
      contractAddress: result.nft.contractAddress
    };
    
  } catch (error) {
    console.error('❌ Failed to mint Charm NFT:', error.message);
    throw error;
  }
}

/**
 * Create metadata for a Charm NFT based on match data
 * @param {Object} matchData - The match data containing user profiles
 * @returns {Object} - The NFT metadata
 */
export function createCharmMetadata(matchData) {
  const { user1Profile, user2Profile, matchedAt } = matchData;
  
  return {
    name: `Charm Match #${Date.now()}`,
    description: `A magical connection between ${user1Profile.display_name} and ${user2Profile.display_name} on Charmcaster ✨`,
    image: "https://your-app.com/charm-nft-image.png", // Replace with your NFT image URL
    attributes: [
      {
        trait_type: "Match Date",
        value: matchedAt.toISOString().split('T')[0]
      },
      {
        trait_type: "User 1",
        value: user1Profile.display_name
      },
      {
        trait_type: "User 2", 
        value: user2Profile.display_name
      },
      {
        trait_type: "User 1 FID",
        value: user1Profile.fid.toString()
      },
      {
        trait_type: "User 2 FID",
        value: user2Profile.fid.toString()
      },
      {
        trait_type: "Platform",
        value: "Charmcaster"
      },
      {
        trait_type: "Network",
        value: "Farcaster"
      }
    ],
    external_url: "https://your-app.com", // Replace with your app URL
    background_color: "FF69B4" // Pink color for charm theme
  };
}

/**
 * Upload metadata to IPFS or your preferred storage
 * @param {Object} metadata - The metadata object
 * @returns {Promise<string>} - The metadata URI
 */
export async function uploadMetadata(metadata) {
  // This is a placeholder - you'll need to implement actual metadata upload
  // Options:
  // 1. Upload to IPFS using services like Pinata, Infura, or web3.storage
  // 2. Upload to your own server/database
  // 3. Use a metadata service like OpenSea's metadata API
  
  // For now, returning a placeholder URI
  // In production, replace this with actual upload logic
  console.log('📤 Uploading metadata...', metadata);
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a placeholder URI - replace with actual upload result
  return `https://your-metadata-storage.com/metadata/${Date.now()}.json`;
}

/**
 * Complete NFT minting process for a match
 * @param {Object} matchData - The match data
 * @param {string} recipientAddress - The wallet address to mint to
 * @returns {Promise<Object>} - The complete mint result
 */
export async function mintMatchNFT(matchData, recipientAddress) {
  try {
    console.log('🎯 Starting complete NFT minting process...');
    
    // 1. Create metadata
    const metadata = createCharmMetadata(matchData);
    
    // 2. Upload metadata to get URI
    const tokenURI = await uploadMetadata(metadata);
    
    // 3. Mint the NFT
    const mintResult = await mintCharmNFT(recipientAddress, tokenURI);
    
    return {
      ...mintResult,
      metadata,
      tokenURI
    };
    
  } catch (error) {
    console.error('❌ Complete NFT minting failed:', error);
    throw error;
  }
}

// Example usage in your main app:
/*
import { mintMatchNFT } from './utils/nft-minting';

// In your match confirmation handler:
const handleMintNFT = async (match, userWalletAddress) => {
  try {
    setIsLoading(true);
    
    const result = await mintMatchNFT(match, userWalletAddress);
    
    console.log('🎉 NFT minted!', result);
    
    // Update your UI to show success
    // You can display the transaction hash, token ID, etc.
    
  } catch (error) {
    console.error('Minting failed:', error);
    // Handle error in UI
  } finally {
    setIsLoading(false);
  }
};
*/
