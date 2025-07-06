import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";

// Sample FIDs for demo - in a real app, you'd have a more sophisticated matching algorithm
const DEMO_FIDS = [
  3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584,
  4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811
];

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
    
    // Get a random selection of FIDs excluding the current user
    const potentialFids = DEMO_FIDS
      .filter(fid => fid !== currentUserFid)
      .sort(() => 0.5 - Math.random())
      .slice(0, 10); // Get 10 random potential matches

    // Fetch user data for each potential match
    const potentialMatches = await Promise.allSettled(
      potentialFids.map(async (fid) => {
        const user = await fetchUser(fid.toString());
        return {
          ...user,
          age: Math.floor(Math.random() * 15) + 22, // Random age 22-36
          location: getRandomLocation(),
          interests: getRandomInterests(),
        };
      })
    );

    // Filter out failed requests and return successful ones
    const validMatches = potentialMatches
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map(result => result.value)
      .filter(user => user && user.username); // Ensure valid user data

    return NextResponse.json({
      matches: validMatches,
      total: validMatches.length
    });

  } catch (error) {
    console.error("Error fetching potential matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

function getRandomLocation(): string {
  const locations = [
    "San Francisco, CA",
    "New York, NY", 
    "Austin, TX",
    "Denver, CO",
    "Brooklyn, NY",
    "Los Angeles, CA",
    "Seattle, WA",
    "Miami, FL",
    "Chicago, IL",
    "Portland, OR"
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function getRandomInterests(): string[] {
  const allInterests = [
    "Web3", "DeFi", "NFTs", "Gaming", "Art", "Music", "Travel", "Photography",
    "Hiking", "Cooking", "Reading", "Tech", "Startups", "Crypto", "Design",
    "Writing", "Fitness", "Yoga", "Coffee", "Dogs", "Cats", "Movies", 
    "Podcasts", "Dancing", "Swimming", "Climbing", "Biking", "Running"
  ];
  
  const numInterests = Math.floor(Math.random() * 4) + 2; // 2-5 interests
  const shuffled = allInterests.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numInterests);
}
