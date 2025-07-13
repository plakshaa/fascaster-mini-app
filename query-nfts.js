// Query minted NFTs from the contract
const { createPublicClient, http } = require('viem');
const { celoAlfajores } = require('viem/chains');

const CONTRACT_ADDRESS = '0x63eb3f3fc921e716f0050861d167c77575834201';
const ALFAJORES_RPC_URL = 'https://alfajores-forno.celo-testnet.org';

// ERC721 ABI for querying
const ERC721_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(ALFAJORES_RPC_URL)
});

async function queryNFTs() {
  console.log('🔍 Querying minted NFTs from contract...\n');
  
  const wallets = [
    '0xB2009F8B8229941E65337d091EF44C997ED9028f', // Your wallet
    '0x1234567890123456789012345678901234567890'  // Test wallet
  ];
  
  for (const wallet of wallets) {
    console.log(`👛 Checking wallet: ${wallet}`);
    
    try {
      // Get balance
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'balanceOf',
        args: [wallet]
      });
      
      console.log(`💎 NFT Balance: ${balance.toString()}`);
      
      if (balance > 0) {
        // Get token IDs for this wallet
        for (let i = 0; i < balance; i++) {
          try {
            const tokenId = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ERC721_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [wallet, i]
            });
            
            console.log(`🎯 Token ID ${i + 1}: ${tokenId.toString()}`);
            
            // Get token URI
            const tokenURI = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ERC721_ABI,
              functionName: 'tokenURI',
              args: [tokenId]
            });
            
            console.log(`🔗 Token URI: ${tokenURI}`);
            
            // Check if it's our IPFS URI
            if (tokenURI.includes('bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4')) {
              console.log('✅ This is our minted NFT with real IPFS metadata!');
            }
            
          } catch (error) {
            console.log(`❌ Error getting token ${i}: ${error.message}`);
          }
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error checking wallet ${wallet}: ${error.message}\n`);
    }
  }
}

// Also check specific token IDs
async function checkSpecificTokens() {
  console.log('🔍 Checking specific token IDs...\n');
  
  // Try common token IDs that might have been minted
  const tokenIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  for (const tokenId of tokenIds) {
    try {
      const owner = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'ownerOf',
        args: [tokenId]
      });
      
      const tokenURI = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'tokenURI',
        args: [tokenId]
      });
      
      console.log(`🎯 Token ID ${tokenId}:`);
      console.log(`   Owner: ${owner}`);
      console.log(`   URI: ${tokenURI}`);
      
      if (tokenURI.includes('bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4')) {
        console.log('   ✅ This is our minted NFT!');
      }
      
      console.log('');
      
    } catch (error) {
      // Token doesn't exist, skip
    }
  }
}

async function runQueries() {
  await queryNFTs();
  await checkSpecificTokens();
  
  console.log('🎉 Query completed!');
  console.log('');
  console.log('🔍 View your NFTs on OpenSea testnet:');
  console.log('https://testnets.opensea.io/assets/celo-alfajores/0x63eb3f3fc921e716f0050861d167c77575834201');
}

runQueries();
