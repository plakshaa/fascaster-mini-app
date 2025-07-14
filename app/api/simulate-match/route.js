import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export async function POST(request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development' || 
        process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const { user1Fid, user2Fid, user2Profile } = await request.json();
    
    console.log('🎯 Simulating match back:', { user1Fid, user2Fid, user2Profile });
    
    // Create the reverse match request (user2 -> user1)
    const reverseMatchRequest = {
      id: `${user2Fid}_${user1Fid}`,
      fromUser: user2Fid,
      toUser: user1Fid,
      status: 'pending',
      createdAt: new Date().toISOString(),
      profile: user2Profile
    };
    
    // Store the reverse match request
    await redis.set(
      `match_request:${user2Fid}_${user1Fid}`,
      JSON.stringify(reverseMatchRequest)
    );
    
    // Immediately accept it to create a match
    setTimeout(async () => {
      try {
        // Create the match
        const match = {
          id: `match_${user1Fid}_${user2Fid}`,
          user1Fid,
          user2Fid,
          createdAt: new Date().toISOString(),
          status: 'active',
          onChain: false
        };
        
        // Store the match
        await redis.set(`match:${user1Fid}_${user2Fid}`, JSON.stringify(match));
        await redis.set(`match:${user2Fid}_${user1Fid}`, JSON.stringify(match));
        
        // Create notifications for both users
        const notification1 = {
          id: `notif_${Date.now()}_${user1Fid}`,
          type: 'match_confirmed',
          fromFid: user2Fid,
          toFid: user1Fid,
          fromProfile: {
            fid: user2Profile.fid,
            display_name: user2Profile.display_name,
            username: user2Profile.username,
            pfp_url: user2Profile.pfp_url,
            bio: user2Profile.bio || '',
            follower_count: user2Profile.follower_count || 0,
            following_count: user2Profile.following_count || 0
          },
          message: `🎉 You matched with ${user2Profile.display_name}!`,
          read: false,
          createdAt: new Date().toISOString(),
          matchId: match.id
        };
        
        const notification2 = {
          id: `notif_${Date.now()}_${user2Fid}`,
          type: 'match_confirmed',
          fromFid: user1Fid,
          toFid: user2Fid,
          fromProfile: {
            fid: user1Fid,
            display_name: 'Test User',
            username: 'testuser',
            pfp_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            bio: 'Test user for development',
            follower_count: 100,
            following_count: 50
          },
          message: `🎉 You matched with User ${user1Fid}!`,
          read: false,
          createdAt: new Date().toISOString(),
          matchId: match.id
        };
        
        // Store notifications using the same format as the notifications API
        const notificationsKey1 = `charm:notifications:${user1Fid}`;
        const notificationsKey2 = `charm:notifications:${user2Fid}`;
        
        // Get existing notifications
        const existingNotifications1 = await redis.get(notificationsKey1) || [];
        const existingNotifications2 = await redis.get(notificationsKey2) || [];
        
        // Add new notifications
        const updatedNotifications1 = [notification1, ...existingNotifications1];
        const updatedNotifications2 = [notification2, ...existingNotifications2];
        
        // Store updated notifications
        await redis.set(notificationsKey1, updatedNotifications1);
        await redis.set(notificationsKey2, updatedNotifications2);
        
        console.log(`✅ Stored ${updatedNotifications1.length} notifications for user ${user1Fid}`);
        console.log(`✅ Stored ${updatedNotifications2.length} notifications for user ${user2Fid}`);
        
        // Verify storage
        const verifyNotifications1 = await redis.get(notificationsKey1);
        console.log(`🔍 Verification - User ${user1Fid} notifications:`, verifyNotifications1?.length || 0);
        
        // Remove the original match request
        await redis.del(`match_request:${user1Fid}_${user2Fid}`);
        await redis.del(`match_request:${user2Fid}_${user1Fid}`);
        
        console.log('✅ Match simulation completed successfully');
        
      } catch (error) {
        console.error('❌ Error in match simulation:', error);
      }
    }, 1000); // 1 second delay to simulate real user response
    
    return NextResponse.json({ 
      success: true, 
      message: 'Match simulation started! Check notifications in a moment.' 
    });
    
  } catch (error) {
    console.error('❌ Error in match simulation:', error);
    return NextResponse.json(
      { error: 'Failed to simulate match' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Use POST to simulate matches' },
    { status: 405 }
  );
}
