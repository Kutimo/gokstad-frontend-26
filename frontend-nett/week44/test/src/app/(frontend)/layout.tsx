import React from "react";
import "./styles.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

// Content comes from Payload, so render on every request instead of once at build time
export const dynamic = "force-dynamic";

export const metadata = {
  description: "Et starterprosjekt for Payload CMS, bygget med Docker",
  title: "Payload CMS",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="no">
      <body>
        <div className="app-container">
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
};
