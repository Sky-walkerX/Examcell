// app/layout.tsx
import type React from "react"; // Keep type import if needed, often optional now
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Keep ThemeProvider
import { Providers } from "@/components/providers"; // <-- Import your new Providers component
import { Toaster } from "@/components/ui/toaster"; // Assuming you still want this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Result Dashboard",
  description: "A modern dashboard for viewing and managing student results",
  generator: 'v0.dev' // Keep if you want
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Wrap ThemeProvider and children with Providers */}
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // Or your preferred theme
            enableSystem
            disableTransitionOnChange
          >
            {children} {/* Your page content */}
            <Toaster /> {/* Place Toaster inside ThemeProvider if its style depends on theme, or outside Providers if not */}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}