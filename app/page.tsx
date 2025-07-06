import App from "@/components/App";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Find Your Charm ✨",
    action: {
      type: "launch_frame",
      name: "Charm Caster",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#ff6b9d",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Charm Caster",
    openGraph: {
      title: "Charm Caster",
      description: "Find your charm on Farcaster - Quick, delightful matching for meaningful connections",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
