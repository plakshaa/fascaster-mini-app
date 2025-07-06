"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <h2 className="text-3xl font-bold text-white">
              Oops! Something went wrong 😅
            </h2>
            <p className="text-white/80">
              Don&apos;t worry, let&apos;s get you back to finding your charm!
            </p>
            
            {this.state.error && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/80 text-sm font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <button
              onClick={this.resetError}
              className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              ✨ Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
