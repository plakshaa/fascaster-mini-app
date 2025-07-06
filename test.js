const fetch = require('node-fetch');

async function testBulkUsersAPI() {
  const API_KEY = '2F7C88CF-53CD-4F67-AD6E-260F8C6DC0DA';
  
  console.log('🔍 Testing Neynar Bulk Users API (Free Tier)...\n');
  
  try {
    // Test 1: Single user (Dan Romero)
    console.log('📡 Test 1: Single user lookup (FID 3 - Dan Romero)');
    const singleResponse = await fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=3', {
      headers: {
        'api_key': API_KEY,
        'accept': 'application/json'
      }
    });

    console.log(`Status: ${singleResponse.status}`);
    
    if (singleResponse.ok) {
      const singleData = await singleResponse.json();
      console.log('✅ Single user lookup working!');
      const user = singleData.users[0];
      console.log(`  - Name: ${user.display_name}`);
      console.log(`  - Username: @${user.username}`);
      console.log(`  - FID: ${user.fid}`);
      console.log(`  - Followers: ${user.follower_count}`);
      console.log(`  - Bio: ${user.profile?.bio?.text?.substring(0, 50) || 'No bio'}...`);
    } else {
      const errorData = await singleResponse.text();
      console.log('❌ Single user lookup failed:');
      console.log(`Error: ${errorData}`);
      return;
    }

    // Test 2: Multiple users (Famous Farcaster users)
    console.log('\n📡 Test 2: Multiple users lookup (FIDs 3,2,1,194,99)');
    const multiResponse = await fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=3,2,1,194,99', {
      headers: {
        'api_key': API_KEY,
        'accept': 'application/json'
      }
    });

    console.log(`Status: ${multiResponse.status}`);
    
    if (multiResponse.ok) {
      const multiData = await multiResponse.json();
      console.log(`✅ Multiple users lookup working! Found ${multiData.users.length} users:`);
      
      multiData.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.display_name} (@${user.username}) - FID: ${user.fid}`);
      });
    } else {
      const errorData = await multiResponse.text();
      console.log('❌ Multiple users lookup failed:');
      console.log(`Error: ${errorData}`);
      return;
    }

    // Test 3: Large batch (10 users - what Charm Caster will use)
    console.log('\n📡 Test 3: Large batch lookup (10 famous crypto users)');
    const largeBatchFIDs = '3,2,1,194,99,13,5650,15983,20591,388';
    const largeBatchResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${largeBatchFIDs}`, {
      headers: {
        'api_key': API_KEY,
        'accept': 'application/json'
      }
    });

    console.log(`Status: ${largeBatchResponse.status}`);
    
    if (largeBatchResponse.ok) {
      const largeBatchData = await largeBatchResponse.json();
      console.log(`✅ Large batch lookup working! Found ${largeBatchData.users.length} users:`);
      
      largeBatchData.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.display_name} (@${user.username})`);
        console.log(`     Followers: ${user.follower_count?.toLocaleString() || 'N/A'}`);
        console.log(`     Bio: ${user.profile?.bio?.text?.substring(0, 60) || 'No bio'}${user.profile?.bio?.text?.length > 60 ? '...' : ''}`);
        console.log('');
      });

      console.log('🎯 Perfect! This is exactly what Charm Caster will use.');
      console.log(`📊 API Rate: Successfully fetched ${largeBatchData.users.length} users in one call`);
      
    } else {
      const errorData = await largeBatchResponse.text();
      console.log('❌ Large batch lookup failed:');
      console.log(`Error: ${errorData}`);
    }

    // Test 4: Check rate limits
    console.log('\n📡 Test 4: Testing rate limits (3 quick calls)');
    for (let i = 1; i <= 3; i++) {
      const rateLimitResponse = await fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=3', {
        headers: {
          'api_key': API_KEY,
          'accept': 'application/json'
        }
      });
      
      console.log(`  Call ${i}: Status ${rateLimitResponse.status}`);
      
      if (!rateLimitResponse.ok) {
        const errorData = await rateLimitResponse.text();
        console.log(`  ❌ Rate limit hit: ${errorData}`);
        break;
      } else {
        console.log(`  ✅ Call ${i} successful`);
      }
      
      // Small delay between calls
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('\n🏁 Bulk Users API Test Complete!');
}

testBulkUsersAPI();