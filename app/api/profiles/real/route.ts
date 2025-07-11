import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  try {
    const API_KEY = env.NEYNAR_API_KEY;
    
    console.log('🔑 API_KEY from env:', API_KEY ? 'Found' : 'Not found');
    console.log('🔑 API_KEY value:', API_KEY.substring(0, 8) + '...');
    
    if (!API_KEY) {
      return NextResponse.json({ 
        error: 'NEYNAR_API_KEY environment variable not set',
        profiles: [],
        source: 'error'
      }, { status: 500 });
    }
    
    // Use a mix of famous Farcaster users and active community members
    const activeFIDs = [
      // Farcaster founders & team
      '3', '2', '1', '194', '99', 
      // Popular crypto/web3 people  
      '13', '5650', '15983', '20591', '388',
      // Active community members (you can add more)
      '576', '680', '829', '1048', '1214',
      '1869', '2433', '3621', '4823', '5678',
      '6789', '7890', '8901', '9012', '10123'
    ];
    
    // Randomly select 15-20 users for variety
    const randomFIDs = activeFIDs
      .sort(() => 0.5 - Math.random())
      .slice(0, 20)
      .join(',');
    
    console.log(`🔄 Fetching profiles for FIDs: ${randomFIDs}`);
    console.log(`🔄 Using API key: ${API_KEY.substring(0, 8)}...`);
    
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${randomFIDs}`, {
      headers: {
        'api_key': API_KEY,
        'accept': 'application/json'
      }
    });

    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Neynar API error: ${response.status} - ${errorText}`);
      throw new Error(`Neynar API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.users?.length || 0} users from Neynar`);
    
    // Transform to CharmProfile format
    const profiles = data.users.map((user: any) => ({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name || user.username,
      pfp_url: user.pfp_url || '',
      bio: user.profile?.bio?.text || "Building amazing things in web3! 🚀",
      follower_count: user.follower_count || 0,
      following_count: user.following_count || 0,
      // Add dating context (realistic ranges)
      age: Math.floor(Math.random() * 15) + 22, // 22-37
      location: getRandomLocation(),
      interests: getInterestsFromBio(user.profile?.bio?.text)
    }));

    return NextResponse.json({ 
      profiles: profiles,
      source: 'neynar',
      count: profiles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching Farcaster users:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to fetch profiles';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Authentication error - API key issue';
      } else if (error.message.includes('403')) {
        errorMessage = 'Access denied - API key permissions';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded - try again later';
      } else {
        errorMessage = error.message;
      }
    }
    
    // Enhanced fallback profiles with more variety
    const fallbackProfiles = [
      {
        fid: 3,
        username: "dwr.eth", 
        display_name: "Dan Romero",
        pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bc698287-5adc-4cc5-a503-de16963ed900/original",
        bio: "Working on Farcaster ⚡",
        follower_count: 579183,
        following_count: 4300,
        age: 34,
        location: "San Francisco, CA",
        interests: ["Web3", "Social", "Building"]
      },
      {
        fid: 2,
        username: "varunsrin.eth",
        display_name: "Varun Srinivasan", 
        pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/aaa6c8c9-40b0-4f9d-a27c-4bb8b303fb60/original",
        bio: "Technowatermelon. Elder Millennial. Building Farcaster.",
        follower_count: 462825,
        following_count: 1681,
        age: 32,
        location: "San Francisco, CA",
        interests: ["Tech", "Building", "Farcaster"]
      },
      {
        fid: 1,
        username: "farcaster",
        display_name: "Farcaster",
        pfp_url: "https://i.imgur.com/I2rEbPF.png",
        bio: "A sufficiently decentralized social network. farcaster.xyz",
        follower_count: 49349,
        following_count: 2,
        age: 28,
        location: "San Francisco, CA",
        interests: ["Social", "Decentralized", "Protocol"]
      },
      {
        fid: 194,
        username: "rish",
        display_name: "rish",
        pfp_url: "https://i.imgur.com/naZWL9n.gif",
        bio: "building farcaster infra @ /neynar 🪐 | casting @ /rish",
        follower_count: 274735,
        following_count: 885,
        age: 29,
        location: "San Francisco, CA",
        interests: ["Infrastructure", "Building", "Farcaster"]
      },
      {
        fid: 99,
        username: "jesse.base.eth",
        display_name: "Jesse Pollak",
        pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/aa4d9c8a-3a6b-4b9c-8b5f-6a7e8c9d0e1f/original",
        bio: "@base builder #001",
        follower_count: 518710,
        following_count: 2201,
        age: 36,
        location: "San Francisco, CA",
        interests: ["Base", "L2", "Building"]
      },
      {
        fid: 13,
        username: "balajis.eth",
        display_name: "Balaji Srinivasan",
        pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bb5d0c4a-7a8b-4c9d-9e0f-1a2b3c4d5e6f/original",
        bio: "Angel investor, entrepreneur, and technologist.",
        follower_count: 445213,
        following_count: 1205,
        age: 43,
        location: "San Francisco, CA",
        interests: ["Crypto", "Tech", "Investing"]
      },
      {
        fid: 5650,
        username: "vitalik.eth",
        display_name: "Vitalik Buterin",
        pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/cc6d1c5a-8b9c-4d0e-9f1a-2b3c4d5e6f7g/original",
        bio: "Founder of Ethereum. Interested in crypto, governance, and effective altruism.",
        follower_count: 464294,
        following_count: 312,
        age: 30,
        location: "Singapore",
        interests: ["Ethereum", "Crypto", "Governance"]
      },
      {
        fid: 576,
        username: "linda.eth",
        display_name: "Linda Xie",
        pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/dd7e2c6a-9c0d-4e1f-a2b3-3c4d5e6f7g8h/original",
        bio: "Co-founder of Scalar Capital. Previously at Coinbase.",
        follower_count: 156432,
        following_count: 892,
        age: 31,
        location: "San Francisco, CA",
        interests: ["Investing", "DeFi", "Crypto"]
      }
    ];
    
    return NextResponse.json({ 
      profiles: fallbackProfiles,
      source: 'fallback',
      count: fallbackProfiles.length,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}

function getRandomLocation() {
  const locations = [
    "San Francisco, CA", "New York, NY", "Austin, TX", "Miami, FL",
    "Seattle, WA", "Denver, CO", "Portland, OR", "Chicago, IL",
    "Los Angeles, CA", "Boston, MA", "Nashville, TN", "Atlanta, GA",
    "London, UK", "Berlin, Germany", "Singapore", "Toronto, Canada"
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function getInterestsFromBio(bio?: string) {
  const allInterests = [
    "DeFi", "NFTs", "Web3", "Crypto", "Ethereum", "Bitcoin",
    "Art", "Music", "Gaming", "Travel", "Photography", "Design",
    "Building", "Investing", "Writing", "Podcasts", "Fitness",
    "Cooking", "Reading", "Startups", "AI", "Tech"
  ];
  
  // Extract interests from bio
  if (bio) {
    const bioInterests = allInterests.filter(interest => 
      bio.toLowerCase().includes(interest.toLowerCase()) ||
      bio.toLowerCase().includes(interest.toLowerCase().slice(0, -1)) // singular forms
    );
    
    if (bioInterests.length >= 2) {
      return bioInterests.slice(0, 3);
    }
  }
  
  // Random interests if bio doesn't provide enough context
  return allInterests
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
}
