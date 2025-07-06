export async function POST(req) {
  return new Response(
    JSON.stringify({
      frames: [
        {
          image: "https://placehold.co/600x400?text=You+Clicked+It!",
          buttons: ["Go Back"],
          post_url: "https://<your-vercel-url>.vercel.app/api/frame",
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Farcaster-Frame": "vNext",
      },
    }
  );
}
