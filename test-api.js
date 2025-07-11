const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing the real profiles API...');
    
    const response = await fetch('http://localhost:3000/api/profiles/real');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.profiles && data.profiles.length > 0) {
      console.log(`✅ Successfully fetched ${data.profiles.length} profiles from ${data.source}`);
      console.log('First profile:', data.profiles[0]);
    } else {
      console.log('❌ No profiles returned');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
