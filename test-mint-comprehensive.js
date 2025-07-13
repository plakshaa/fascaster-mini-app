// Comprehensive test for mint API
const fetch = require('node-fetch');

async function testMintAPI() {
  console.log('🚀 Starting comprehensive mint API tests...\n');
  
  // Test 1: Check if server is running
  console.log('📡 Test 1: Server connectivity');
  try {
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'GET'
    });
    
    console.log('Status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
    
    if (response.status === 405) {
      console.log('✅ Server is running and method restriction works');
    } else {
      console.log('❌ Unexpected response');
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    console.log('Make sure the dev server is running: npm run dev');
    return;
  }
  
  // Test 2: Invalid data
  console.log('\n🧪 Test 2: Invalid data validation');
  try {
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'invalid-address',
        tokenURI: 'not-a-url'
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 400) {
      console.log('✅ Input validation works');
    } else {
      console.log('❌ Input validation failed');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  // Test 3: Missing fields
  console.log('\n🧪 Test 3: Missing fields validation');
  try {
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '0x1234567890123456789012345678901234567890'
        // Missing tokenURI
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 400) {
      console.log('✅ Missing fields validation works');
    } else {
      console.log('❌ Missing fields validation failed');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  // Test 4: Valid request (will likely fail due to test wallet)
  console.log('\n🧪 Test 4: Valid request');
  try {
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '0x1234567890123456789012345678901234567890',
        tokenURI: 'https://example.com/metadata.json'
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Mint successful!');
    } else if (response.status === 500) {
      console.log('⚠️  Server error (likely wallet/gas issue)');
      if (result.error?.includes('insufficient funds')) {
        console.log('💡 Tip: Add CELO tokens to your wallet from https://faucet.celo.org/alfajores');
      }
    } else {
      console.log('❌ Unexpected response');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Next steps:');
  console.log('1. If you see wallet/gas errors, fund your wallet with CELO tokens');
  console.log('2. Get testnet tokens from: https://faucet.celo.org/alfajores');
  console.log('3. Your wallet address (from private key) needs testnet CELO');
}

testMintAPI();
