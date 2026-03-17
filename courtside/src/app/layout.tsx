import type { Metadata } from "next";
import localFont from "next/font/local";
import { ChatProvider } from "@/components/chat/ChatContext";
import { ThemeProvider } from "@/components/shared/ThemeContext";
import ChatPanel from "@/components/chat/ChatPanel";
import Nav from "@/components/shared/Nav";
import StatsGuide from "@/components/shared/StatsGuide";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  title: "Courtside — March Madness Bracket Analyzer",
  description:
    "Analyze every matchup using KenPom data and the Trapezoid framework. AI-powered bracket builder for all 68 teams.",
  keywords: ["March Madness", "NCAA Tournament", "Bracket Builder", "KenPom", "Trapezoid of KenPom", "2026"],
  authors: [{ name: "Courtside" }],
  openGraph: {
    title: "Courtside — March Madness Bracket Analyzer",
    description: "Analyze every matchup using KenPom data and the Trapezoid framework. AI-powered bracket builder for all 68 teams.",
    type: "website",
    siteName: "Courtside",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Courtside — Trapezoid of KenPom visualization showing all 68 tournament teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Courtside — March Madness Bracket Analyzer",
    description: "Analyze every matchup using KenPom data and the Trapezoid framework. AI-powered bracket builder for all 68 teams.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0b0f" />
        {/* Inline script to apply saved theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark')}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ChatProvider>
            <div className="flex min-h-screen flex-col bg-background text-text-primary">
              <Nav />
              <main className="flex-1">{children}</main>
            </div>
            <ChatPanel />
            <StatsGuide />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
