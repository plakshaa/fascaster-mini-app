// Test script for the NFT minting API
// Run with: node test-mint-api.js

const fetch = require('node-fetch');

async function testMintAPI() {
  try {
    console.log('🧪 Testing NFT minting API...');
    
    // Test data
    const testData = {
      to: '0x1234567890123456789012345678901234567890', // Replace with a real wallet address
      tokenURI: 'https://example.com/metadata.json' // Replace with real metadata URL
    };
    
    console.log('📤 Sending mint request...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Mint successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.explorer) {
        console.log(`🔍 View transaction: ${result.explorer}`);
      }
    } else {
      console.log('❌ Mint failed!');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test with invalid data first
async function testInvalidData() {
  console.log('\n🧪 Testing with invalid data...');
  
  try {
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'invalid-address',
        tokenURI: 'not-a-url'
      }),
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test wrong HTTP method
async function testWrongMethod() {
  console.log('\n🧪 Testing wrong HTTP method...');
  
  try {
    const response = await fetch('http://localhost:3000/api/mint', {
      method: 'GET',
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting NFT minting API tests...\n');
  
  await testInvalidData();
  await testWrongMethod();
  await testMintAPI();
  
  console.log('\n✅ All tests completed!');
}

runAllTests();
