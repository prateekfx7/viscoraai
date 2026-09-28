import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Sidebar } from "@/components/nav/Sidebar";

export const metadata: Metadata = {
  title: "Oil India Limited — Well-to-Surface Digital Twin (SIH26120)",
  description:
    "Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Digital Twin for heavy oil well optimization in the Baghewala Field.",
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
      <body className="bg-[#F0F2F5] text-slate-900 min-h-screen flex antialiased selection:bg-amber-500/20 selection:text-amber-900">
        <Providers>
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:pl-64 xl:pl-72 p-4 sm:p-6 lg:p-8 max-w-[1850px] w-full mx-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
