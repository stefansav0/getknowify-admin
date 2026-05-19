import type { Metadata } from "next";

import Script from "next/script";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

// ==========================================
// FONTS
// ==========================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ==========================================
// SEO
// ==========================================

export const metadata: Metadata = {
  title: "GetKnowify",
  description:
    "Real-time analytics & quiz platform",
};

// ==========================================
// ROOT LAYOUT
// ==========================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >

      <body className="min-h-full flex flex-col bg-zinc-100">

        {/* ========================================== */}
        {/* WEBSITE CONTENT */}
        {/* ========================================== */}

        {children}

        {/* ========================================== */}
        {/* GOOGLE ANALYTICS */}
        {/* ========================================== */}

        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-9YDEEPLCYP"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer =
                window.dataLayer || [];

              function gtag(){
                dataLayer.push(arguments);
              }

              gtag('js', new Date());

              gtag(
                'config',
                'G-9YDEEPLCYP',
                {
                  page_path:
                    window.location.pathname,
                }
              );
            `,
          }}
        />

      </body>
    </html>
  );
}