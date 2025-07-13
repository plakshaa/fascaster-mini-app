// Test NFT minting with real IPFS metadata
const fetch = require('node-fetch');

async function testRealNFTMinting() {
  console.log('🎨 Testing NFT minting with real IPFS metadata...\n');
  
  // Real IPFS metadata URI
  const realTokenURI = 'https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4';
  
  // Test with different wallet addresses
  const testWallets = [
    '0xB2009F8B8229941E65337d091EF44C997ED9028f', // Your minting wallet
    '0x742d35Cc6634C0532925a3b8D6aC6d9C2d9a5c7c', // Random test wallet
    '0x1234567890123456789012345678901234567890'  // Example wallet
  ];
  
  console.log('🔗 Using real IPFS metadata URI:');
  console.log(realTokenURI);
  console.log('');
  
  for (let i = 0; i < testWallets.length; i++) {
    const walletAddress = testWallets[i];
    
    console.log(`🧪 Test ${i + 1}: Minting to ${walletAddress}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: walletAddress,
          tokenURI: realTokenURI
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Mint successful!');
        console.log(`   Transaction: ${result.transaction.hash}`);
        console.log(`   Token ID: ${result.nft.tokenId || 'Not extracted'}`);
        console.log(`   Gas Used: ${result.transaction.gasUsed}`);
        console.log(`   Explorer: ${result.explorer}`);
        console.log('');
      } else {
        console.log('❌ Mint failed!');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${result.error}`);
        console.log('');
      }
      
      // Add delay between mints to avoid rate limiting
      if (i < testWallets.length - 1) {
        console.log('⏳ Waiting 2 seconds before next mint...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.log('❌ Test failed:', error.message);
      console.log('');
    }
  }
  
  console.log('🎉 All tests completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Check the transactions on the explorer');
  console.log('2. Verify the NFTs were minted correctly');
  console.log('3. Test the metadata loads properly');
  console.log('4. Ready to integrate into your Charmcaster app!');
}

// Also test just fetching the metadata
async function testMetadata() {
  console.log('🔍 Testing metadata accessibility...');
  
  const metadataURI = 'https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4';
  
  try {
    const response = await fetch(metadataURI);
    const metadata = await response.json();
    
    console.log('✅ Metadata loaded successfully:');
    console.log(JSON.stringify(metadata, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Failed to load metadata:', error.message);
    console.log('');
  }
}

// Run both tests
async function runTests() {
  await testMetadata();
  await testRealNFTMinting();
}

runTests();
