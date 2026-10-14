import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const font = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });

export const metadata: Metadata = {
    title: { default: "Nettbutikken", template: "%s | Nettbutikken" },
    description: "Nettbutikken fra frontend-nett, nå i Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no" className={font.variable}>
            <body className="min-h-screen bg-background font-sans text-foreground antialiased">
                <Navbar />
                <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">{children}</main>
            </body>
        </html>
    );
}
