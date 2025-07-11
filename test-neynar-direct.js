// Test the real profiles API logic directly
const API_KEY = '2F7C88CF-53CD-4F67-AD6E-260F8C6DC0DA';

async function testNeynarAPI() {
  try {
    console.log('Testing Neynar API directly...');
    
    // Test with a few known FIDs
    const testFIDs = '3,2,1,194,99';
    
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${testFIDs}`, {
      headers: {
        'api_key': API_KEY,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.users?.length || 0} users from Neynar`);
    
    // Transform to CharmProfile format
    const profiles = data.users.map((user) => ({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name || user.username,
      pfp_url: user.pfp_url || '',
      bio: user.profile?.bio?.text || "Building amazing things in web3! 🚀",
      follower_count: user.follower_count || 0,
      following_count: user.following_count || 0,
      age: Math.floor(Math.random() * 15) + 22, // 22-37
      location: "San Francisco, CA", // Simplified for test
      interests: ["Web3", "Building", "Tech"]
    }));
    
    console.log('Transformed profiles:', profiles);
    console.log('First profile:', profiles[0]);
    
  } catch (error) {
    console.error('❌ Error testing Neynar API:', error);
  }
}

testNeynarAPI();
