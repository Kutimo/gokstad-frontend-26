import type { Metadata } from "next";
import Link from "next/link";
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
  title: { default: "Lord of the Rings", template: "%s | Lord of the Rings" },
  description: "Encyclopedia with data from three APIs",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-stone-300">
          <nav className="mx-auto flex max-w-5xl gap-6 p-4 font-semibold">
            <Link href="/">Home</Link>
            <Link href="/books">Books</Link>
            <Link href="/characters">Characters</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
