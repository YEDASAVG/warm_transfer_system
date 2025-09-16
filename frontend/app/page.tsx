"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to caller page as the main entry point
    router.push('/caller');
  }, [router]);

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-foreground">Redirecting to caller...</p>
      </div>
    </div>
  );
}
