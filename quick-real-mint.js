// Quick test with your exact data
const fetch = require('node-fetch');

async function quickRealMint() {
  console.log('🎨 Quick NFT mint test with real IPFS data...\n');
  
  // Your exact data structure
  const mintData = {
    "to": "0xB2009F8B8229941E65337d091EF44C997ED9028f", // Using your wallet address
    "tokenURI": "https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4"
  };
  
  console.log('📤 Minting NFT with data:');
  console.log(JSON.stringify(mintData, null, 2));
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mintData)
    });
    
    const result = await response.json();
    
    console.log('📋 Response:');
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! NFT minted with real IPFS metadata!');
      console.log(`🔍 View transaction: ${result.explorer}`);
      console.log(`💎 Token ID: ${result.nft.tokenId || 'Check explorer'}`);
      console.log(`⛽ Gas used: ${result.transaction.gasUsed}`);
    } else {
      console.log('\n❌ Mint failed. Check the error above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickRealMint();
