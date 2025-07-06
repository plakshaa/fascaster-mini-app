import { NextRequest, NextResponse } from "next/server";
import { Match, CharmProfile } from "@/types/charm-caster";
import { redis } from "@/lib/redis";

// Redis keys for storing matches
function getMatchesKey(fid: number): string {
  return `charm:matches:${fid}`;
}

function getGlobalMatchKey(fid1: number, fid2: number): string {
  const [user1, user2] = [fid1, fid2].sort();
  return `charm:match:${user1}:${user2}`;
}

export async function POST(request: NextRequest) {
  try {
    const { user1Fid, user2Fid, user1Profile, user2Profile } = await request.json();

    if (!user1Fid || !user2Fid || !user1Profile || !user2Profile) {
      return NextResponse.json(
        { error: "Missing required match data" },
        { status: 400 }
      );
    }

    // Check if match already exists
    const matchKey = getGlobalMatchKey(user1Fid, user2Fid);
    
    if (redis) {
      const existingMatch = await redis.get(matchKey);
      if (existingMatch) {
        return NextResponse.json(
          { error: "Match already exists" },
          { status: 400 }
        );
      }
    }

    const newMatch: Match = {
      id: crypto.randomUUID(),
      user1Fid,
      user2Fid,
      user1Profile,
      user2Profile,
      createdAt: new Date(),
      onChain: false
    };

    if (!redis) {
      console.warn("Redis not available, match not stored");
      return NextResponse.json(newMatch);
    }

    // Store the match for both users
    await redis.set(matchKey, newMatch);

    // Add to each user's matches list
    const user1Matches: Match[] = (await redis.get(getMatchesKey(user1Fid))) || [];
    const user2Matches: Match[] = (await redis.get(getMatchesKey(user2Fid))) || [];

    user1Matches.unshift(newMatch);
    user2Matches.unshift(newMatch);

    await redis.set(getMatchesKey(user1Fid), user1Matches.slice(0, 100));
    await redis.set(getMatchesKey(user2Fid), user2Matches.slice(0, 100));

    return NextResponse.json(newMatch);
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userFid = request.headers.get("x-user-fid");
    
    if (!userFid) {
      return NextResponse.json(
        { error: "User FID required" },
        { status: 401 }
      );
    }

    const currentUserFid = parseInt(userFid);

    if (!redis) {
      console.warn("Redis not available, returning empty matches");
      return NextResponse.json([]);
    }
    
    // Get all matches for this user
    const matches: Match[] = (await redis.get(getMatchesKey(currentUserFid))) || [];

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching user matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
