import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DisputeAI — AI-Powered Dispute Resolution",
  description: "Resolve parking tickets, credit card disputes, and insurance claims with AI-generated letters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
