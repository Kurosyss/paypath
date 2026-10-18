import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayPath — PayPal Payment Reliability Lab & AI Diagnostic Engine",
  description:
    "Test real PayPal payment flows, expose failure-handling weaknesses, and use AI to diagnose payment integration errors and verify proposed fixes.",
  keywords: [
    "PayPal",
    "AI",
    "Payment Reliability",
    "Chaos Engineering",
    "Checkout Testing",
    "Webhooks",
    "Idempotency",
    "State Reconciliation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#070A0F] text-slate-100">{children}</body>
    </html>
  );
}
