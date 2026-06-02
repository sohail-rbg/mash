"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }) {
  // Disable automatic client-side polling and window-focus refetching
  // to prevent unexpected session refreshes / reloads from the client.
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}