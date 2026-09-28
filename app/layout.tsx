import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Sidebar } from "@/components/nav/Sidebar";
import { DemoScenarioBar } from "@/components/demo/DemoScenarioBar";

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
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body className="bg-[#090D16] text-slate-100 min-h-screen flex antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <Providers>
          <Sidebar />
          <div className="lg:pl-72 flex-1 flex flex-col min-w-0 min-h-screen">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pt-16 lg:pt-8">
              <DemoScenarioBar />
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
