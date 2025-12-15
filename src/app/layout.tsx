import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DopeWeb",
  description: "A modern multiplayer take on the classic Drug Wars game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
