import type { Metadata } from "next";
import localFont from "next/font/local";
import ChatPanel from "@/components/chat/ChatPanel";
import Nav from "@/components/shared/Nav";
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
  title: "Courtside — March Madness Analytics",
  description:
    "Trapezoid analysis and bracket builder for NCAA Tournament picks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col bg-background text-text-primary">
          <Nav />
          <main className="flex-1">{children}</main>
        </div>
        <ChatPanel />
      </body>
    </html>
  );
}
