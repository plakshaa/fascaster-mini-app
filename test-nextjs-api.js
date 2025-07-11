// Test the actual Next.js API endpoint
async function testNextJSEndpoint() {
  try {
    console.log('🔄 Testing Next.js API endpoint...');
    
    // This will test the actual endpoint
    const response = await fetch('http://localhost:3000/api/profiles/real');
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('❌ API Error:', data.error);
    } else {
      console.log('✅ API working! Got', data.profiles?.length || 0, 'profiles');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNextJSEndpoint();
