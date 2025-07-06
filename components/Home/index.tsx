"use client";

import CharmCasterApp from "@/components/CharmCaster/CharmCasterApp";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <CharmCasterApp />
    </ErrorBoundary>
  );
}
