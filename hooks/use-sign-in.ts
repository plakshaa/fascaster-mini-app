import { useMiniApp } from "@/contexts/miniapp-context";
import sdk from "@farcaster/frame-sdk";

import { NeynarUser } from "@/lib/neynar";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useApiQuery } from "./use-api-query";

export const useSignIn = ({ autoSignIn = false }: { autoSignIn?: boolean }) => {
  const { context } = useMiniApp();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const {
    data: user,
    isLoading: isLoadingNeynarUser,
    refetch: refetchUser,
  } = useApiQuery<NeynarUser>({
    url: "/api/users/me",
    method: "GET",
    isProtected: true,
    queryKey: ["user"],
    enabled: !!isSignedIn,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const handleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wait a bit for wallet to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!address) {
        console.error("No wallet connected");
        setError("Wallet not connected. Please connect your wallet first.");
        return;
      }

      if (!context) {
        console.error("Not in mini app context");
        setError("Farcaster context not available. Please try again.");
        return;
      }

      if (!context.user?.fid) {
        console.error("No user FID available");
        setError("Farcaster user data not available. Please try again.");
        return;
      }

      console.log("Getting Farcaster token...");
      const { token } = await sdk.quickAuth.getToken();
      if (!token) {
        console.error("Sign in failed, no farcaster token");
        setError("Failed to get Farcaster authentication token.");
        return;
      }

      console.log("Sending sign-in request...");
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          fid: context.user.fid,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Sign-in API error:", errorData);
        setError(errorData.message || `Sign in failed (${res.status})`);
        return;
      }

      const data = await res.json();
      console.log("Sign-in successful!");
      setIsSignedIn(true);
      refetchUser();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      console.error("Sign-in error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [refetchUser, address, context]);

  useEffect(() => {
    // if autoSignIn is true, sign in automatically on mount
    if (autoSignIn && context && address) {
      if (!isSignedIn) {
        handleSignIn();
      }
    }
  }, [autoSignIn, handleSignIn, isSignedIn, context, address]);

  return { signIn: handleSignIn, isSignedIn, isLoading, error, user };
};
