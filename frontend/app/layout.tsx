import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SegmentIQ AI — Customer intelligence, automated",
  description:
    "Upload customer transaction data and get instant, explainable segmentation. RFM feature engineering + K-Means clustering, validated three ways.",
  openGraph: {
    title: "SegmentIQ AI — Customer intelligence, automated",
    description: "Every customer leaves patterns. AI reveals them.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
