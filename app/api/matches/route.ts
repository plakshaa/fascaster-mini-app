import { NextRequest, NextResponse } from "next/server";

interface MatchRequest {
  targetFid: number;
  action: "like" | "pass";
}

// In-memory storage for demo - in production, use a real database
const userLikes = new Map<string, Set<number>>();
const matches = new Map<string, Array<{ user1Fid: number, user2Fid: number, timestamp: Date }>>();

export async function POST(request: NextRequest) {
  try {
    const userFid = request.headers.get("x-user-fid");
    
    if (!userFid) {
      return NextResponse.json(
        { error: "User FID required" },
        { status: 401 }
      );
    }

    const currentUserFid = parseInt(userFid);
    const { targetFid, action }: MatchRequest = await request.json();

    if (!targetFid || !action) {
      return NextResponse.json(
        { error: "Missing targetFid or action" },
        { status: 400 }
      );
    }

    if (action === "like") {
      // Record the like
      const userKey = currentUserFid.toString();
      if (!userLikes.has(userKey)) {
        userLikes.set(userKey, new Set());
      }
      userLikes.get(userKey)!.add(targetFid);

      // Check if it's a mutual match
      const targetKey = targetFid.toString();
      const targetLikes = userLikes.get(targetKey);
      
      if (targetLikes && targetLikes.has(currentUserFid)) {
        // It's a match!
        const matchKey = [currentUserFid, targetFid].sort().join('-');
        
        if (!matches.has(matchKey)) {
          const newMatch = {
            user1Fid: Math.min(currentUserFid, targetFid),
            user2Fid: Math.max(currentUserFid, targetFid),
            timestamp: new Date()
          };

          if (!matches.has('global')) {
            matches.set('global', []);
          }
          matches.get('global')!.push(newMatch);
          matches.set(matchKey, [newMatch]);

          return NextResponse.json({
            match: true,
            matchData: newMatch
          });
        }
      }
    }

    return NextResponse.json({
      match: false,
      action: action
    });

  } catch (error) {
    console.error("Error processing match action:", error);
    return NextResponse.json(
      { error: "Failed to process match action" },
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
    
    // Get all matches for this user
    const userMatches = Array.from(matches.entries())
      .filter(([key, matchList]) => {
        if (key === 'global') return false;
        return matchList.some(match => 
          match.user1Fid === currentUserFid || match.user2Fid === currentUserFid
        );
      })
      .map(([key, matchList]) => matchList[0]);

    return NextResponse.json({
      matches: userMatches,
      total: userMatches.length
    });

  } catch (error) {
    console.error("Error fetching user matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
