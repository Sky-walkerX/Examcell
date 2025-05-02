// app/providers.tsx (or components/providers.tsx)
"use client"; // This component must be a Client Component

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  // You might pass the session from a Server Component parent if needed, but usually not required here
  // session?: any;
}

export function Providers({ children }: ProvidersProps) {
  // Wrap children with SessionProvider
  // No need to pass session prop here if SessionProvider fetches it automatically
  return <SessionProvider>{children}</SessionProvider>;
}