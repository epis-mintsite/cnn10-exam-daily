import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "CNN10 入試英語長文対策",
  description:
    "CNN10から厳選した入試頻出テーマの動画を毎日配信。早慶高・MARCH附属高・関西最難関高の2027年度入試対策に。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-red-700 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90">
              <span className="text-2xl font-bold tracking-tight">
                CNN10 入試対策
              </span>
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              <Link
                href="/"
                className="hover:text-red-200 transition-colors"
              >
                最新
              </Link>
              <Link
                href="/archive"
                className="hover:text-red-200 transition-colors"
              >
                バックナンバー
              </Link>
            </nav>
          </div>
          <div className="bg-red-800 text-red-200 text-xs text-center py-1">
            早慶高・MARCH附属高・関西最難関高 ― 2027年度入試 英語長文読解対策
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-800 text-gray-400 text-center py-6 text-xs">
          <p>CNN10 入試英語長文対策 Daily Picks</p>
          <p className="mt-1">
            Source: CNN 10 &mdash; Updated daily at 7:00 AM JST
          </p>
        </footer>
      </body>
    </html>
  );
}
