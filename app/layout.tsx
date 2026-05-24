import type { Metadata } from "next";
import { Quicksand, Space_Mono } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "CrownPay Agent",
  description: "AI match rewards, verified on Hedera.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${quicksand.variable} ${spaceMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
