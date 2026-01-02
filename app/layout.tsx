import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOTKO.IN Admin Portal",
  description: "Admin dashboard for DOTKO.IN MSME Trust Platform",
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
