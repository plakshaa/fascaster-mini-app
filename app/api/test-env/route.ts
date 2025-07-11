import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasNeynarKey: !!process.env.NEYNAR_API_KEY,
    keyLength: process.env.NEYNAR_API_KEY ? process.env.NEYNAR_API_KEY.length : 0,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('NEYNAR')),
    nodeEnv: process.env.NODE_ENV
  });
}
