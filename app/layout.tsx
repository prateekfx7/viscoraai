import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Viscora — Executive Dashboard (Oil India Limited | SIH26120)",
  description:
    "Autonomous Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Digital Twin for heavy oil well optimization in the Baghewala Field.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/tailwind.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased selection:bg-amber-500/20 selection:text-amber-900">
        <Providers>
          <div className="w-full min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
