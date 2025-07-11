const testAPIKey = async () => {
  try {
    const API_KEY = '2F7C88CF-53CD-4F67-AD6E-260F8C6DC0DA';
    
    console.log('Testing Neynar API key...');
    
    const response = await fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=3', {
      headers: {
        'api_key': API_KEY,
        'accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`API Key test failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Key is working!');
    console.log('User data:', data.users[0]);
    
  } catch (error) {
    console.error('❌ API Key test failed:', error.message);
  }
};

testAPIKey();
