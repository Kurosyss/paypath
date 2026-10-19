import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "PayPath — Payment Reliability Lab",
  description:
    "Test PayPal payment flows, uncover reliability failures, and use AI to diagnose and verify fixes.",
  keywords: [
    "PayPal",
    "Payment Reliability",
    "AI Diagnostics",
    "Chaos Engineering",
    "Checkout Testing",
    "Webhooks",
    "Idempotency",
    "State Reconciliation",
    "Developer Diagnostics",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "PayPath — Payment Reliability Lab",
    description:
      "Test PayPal payment flows, uncover reliability failures, and use AI to diagnose and verify fixes.",
    type: "website",
    images: [
      {
        url: "/brand/paypath-social-preview.png",
        width: 1200,
        height: 630,
        alt: "PayPath — Payment Reliability Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PayPath — Payment Reliability Lab",
    description:
      "Test PayPal payment flows, uncover reliability failures, and use AI to diagnose and verify fixes.",
    images: ["/brand/paypath-social-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-ink)] antialiased selection:bg-[var(--text-ink)] selection:text-[var(--bg-canvas)] transition-colors duration-150">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
