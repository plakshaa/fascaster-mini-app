import { NextRequest, NextResponse } from "next/server";
import { MatchRequest } from "@/types/charm-caster";
import { redis } from "@/lib/redis";

function getMatchRequestsKey(fid: number): string {
  return `charm:match_requests:${fid}`;
}

function getSentRequestsKey(fid: number): string {
  return `charm:sent_requests:${fid}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    
    if (!fid || isNaN(fid)) {
      return NextResponse.json(
        { error: "Invalid FID" },
        { status: 400 }
      );
    }

    if (!redis) {
      console.warn("Redis not available, returning empty match requests");
      return NextResponse.json([]);
    }

    // Get all match requests for this user
    const requestsJson = await redis.get(getMatchRequestsKey(fid));
    const requests: MatchRequest[] = requestsJson || [];

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching match requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch match requests" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const toFid = parseInt(params.fid);
    
    if (!toFid || isNaN(toFid)) {
      return NextResponse.json(
        { error: "Invalid FID" },
        { status: 400 }
      );
    }

    const { fromFid, fromProfile } = await request.json();

    if (!fromFid || !fromProfile) {
      return NextResponse.json(
        { error: "Missing fromFid or fromProfile" },
        { status: 400 }
      );
    }

    // Check if request already exists
    if (redis) {
      const existingRequests: MatchRequest[] = 
        (await redis.get(getMatchRequestsKey(toFid))) || [];
      
      const existingRequest = existingRequests.find(
        req => req.fromFid === fromFid && req.status === 'pending'
      );

      if (existingRequest) {
        return NextResponse.json(
          { error: "Match request already exists" },
          { status: 400 }
        );
      }

      // Check if the recipient has already sent a request to the sender (instant match!)
      const recipientSentRequests: MatchRequest[] = 
        (await redis.get(getSentRequestsKey(toFid))) || [];
      
      const mutualRequest = recipientSentRequests.find(
        req => req.toFid === fromFid && req.status === 'pending'
      );

      if (mutualRequest) {
        // It's an instant match! Both users have liked each other
        console.log("🎉 Instant match detected!");

        // Update both requests to accepted
        mutualRequest.status = 'accepted';
        mutualRequest.respondedAt = new Date();

        const newRequest: MatchRequest = {
          id: crypto.randomUUID(),
          fromFid,
          toFid,
          fromProfile,
          status: 'accepted',
          createdAt: new Date(),
          respondedAt: new Date()
        };

        // Update recipient's sent requests
        const updatedRecipientSent = recipientSentRequests.map(req => 
          req.id === mutualRequest.id ? mutualRequest : req
        );
        await redis.set(getSentRequestsKey(toFid), updatedRecipientSent);

        // Update sender's received requests  
        const senderReceivedRequests: MatchRequest[] = 
          (await redis.get(getMatchRequestsKey(fromFid))) || [];
        const updatedSenderReceived = senderReceivedRequests.map(req => 
          req.id === mutualRequest.id ? mutualRequest : req
        );
        await redis.set(getMatchRequestsKey(fromFid), updatedSenderReceived);

        // Store the new request for both users
        existingRequests.unshift(newRequest);
        await redis.set(getMatchRequestsKey(toFid), existingRequests.slice(0, 100));

        const fromSentRequests: MatchRequest[] = 
          (await redis.get(getSentRequestsKey(fromFid))) || [];
        fromSentRequests.unshift(newRequest);
        await redis.set(getSentRequestsKey(fromFid), fromSentRequests.slice(0, 100));

        // Create notifications for both users
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/${toFid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'match_confirmed',
            fromFid,
            fromProfile,
            message: `🎉 You have a new match with ${fromProfile.display_name}!`
          })
        });

        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/${fromFid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'match_confirmed',
            fromFid: toFid,
            fromProfile: {
              fid: toFid,
              username: 'recipient_user',
              display_name: 'Recipient User',
              pfp_url: '',
              follower_count: 0,
              following_count: 0
            },
            message: `🎉 You have a new match!`
          })
        });

        return NextResponse.json({
          ...newRequest,
          isInstantMatch: true,
          matchData: {
            user1Fid: fromFid,
            user2Fid: toFid,
            user1Profile: fromProfile,
            user2Profile: {
              fid: toFid,
              username: 'recipient_user',
              display_name: 'Recipient User',
              pfp_url: '',
              follower_count: 0,
              following_count: 0
            }
          }
        });
      }
    }

    const newRequest: MatchRequest = {
      id: crypto.randomUUID(),
      fromFid,
      toFid,
      fromProfile,
      status: 'pending',
      createdAt: new Date()
    };

    if (!redis) {
      console.warn("Redis not available, match request not stored");
      return NextResponse.json(newRequest);
    }

    // Store the request for the recipient
    const existingRequests: MatchRequest[] = 
      (await redis.get(getMatchRequestsKey(toFid))) || [];
    existingRequests.unshift(newRequest);
    await redis.set(getMatchRequestsKey(toFid), existingRequests.slice(0, 100));

    // Store in sender's sent requests
    const sentRequests: MatchRequest[] = 
      (await redis.get(getSentRequestsKey(fromFid))) || [];
    sentRequests.unshift(newRequest);
    await redis.set(getSentRequestsKey(fromFid), sentRequests.slice(0, 100));

    return NextResponse.json(newRequest);
  } catch (error) {
    console.error("Error creating match request:", error);
    return NextResponse.json(
      { error: "Failed to create match request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    
    if (!fid || isNaN(fid)) {
      return NextResponse.json(
        { error: "Invalid FID" },
        { status: 400 }
      );
    }

    const { requestId, status } = await request.json();

    if (!requestId || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid requestId or status" },
        { status: 400 }
      );
    }

    if (!redis) {
      console.warn("Redis not available, match request not updated");
      return NextResponse.json({ success: false });
    }

    // Get existing requests
    const requests: MatchRequest[] = 
      (await redis.get(getMatchRequestsKey(fid))) || [];

    // Find and update the request
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: "Match request not found" },
        { status: 404 }
      );
    }

    const updatedRequest = {
      ...requests[requestIndex],
      status: status as 'accepted' | 'declined',
      respondedAt: new Date()
    };

    requests[requestIndex] = updatedRequest;

    // Store back to Redis
    await redis.set(getMatchRequestsKey(fid), requests);

    // Also update in sender's sent requests
    const sentRequests: MatchRequest[] = 
      (await redis.get(getSentRequestsKey(updatedRequest.fromFid))) || [];
    
    const sentIndex = sentRequests.findIndex(req => req.id === requestId);
    if (sentIndex !== -1) {
      sentRequests[sentIndex] = updatedRequest;
      await redis.set(getSentRequestsKey(updatedRequest.fromFid), sentRequests);
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating match request:", error);
    return NextResponse.json(
      { error: "Failed to update match request" },
      { status: 500 }
    );
  }
}
