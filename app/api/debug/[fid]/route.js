import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export async function GET(request, { params }) {
  try {
    const { fid } = params;
    
    // Check what's in Redis for this user
    const notifications = await redis.lrange(`notifications:${fid}`, 0, -1);
    const matches = await redis.get(`match:${fid}_*`);
    const matchRequests = await redis.lrange(`match_requests:${fid}`, 0, -1);
    
    console.log(`🔍 Debug data for FID ${fid}:`, {
      notifications: notifications?.length || 0,
      matches,
      matchRequests: matchRequests?.length || 0
    });
    
    return NextResponse.json({
      fid,
      notifications: notifications || [],
      matches,
      matchRequests: matchRequests || [],
      raw: {
        notifications: notifications,
        matches,
        matchRequests
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug API:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}
