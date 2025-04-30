import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exit Interview Sentiment Analysis",
  description: "Analyze sentiment in exit interview comments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
