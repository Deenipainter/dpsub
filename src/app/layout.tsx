import React from 'react';

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Dpsub — Your Data, Your Way.",
    template: "%s · Dpsub",
  },
  description:
    "Buy data, airtime and pay bills in Nigeria. A secure wallet with an auditable ledger, built for speed on mobile.",
  applicationName: "Dpsub",
  keywords: ["data", "airtime", "VTU", "Nigeria", "data subscription", "Dpsub"],
  openGraph: {
    title: "Dpsub — Your Data, Your Way.",
    description: "Nigeria's straightforward way to top up data, airtime and bills.",
    siteName: "Dpsub",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#087F5B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-page text-ink antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
