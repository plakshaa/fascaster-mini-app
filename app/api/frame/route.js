export async function GET(req) {
  return new Response(
    JSON.stringify({
      name: "My Mini App",
      icon: "https://placehold.co/600x400?text=Mini+App",
      frames: [
        {
          image: "https://placehold.co/600x400?text=Welcome+to+My+Mini+App",
          buttons: ["Click Me"],
          post_url: `${process.env.NEXT_PUBLIC_URL}/api/handle-click`,
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
