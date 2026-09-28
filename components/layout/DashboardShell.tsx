"use client";

import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/app-1-utils/sidebar";
import { App1Sidebar } from "@/components/ui/app-1-utils/app-1-sidebar";
import { app1User } from "@/components/ui/app-1-utils/app-1-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";

export function DashboardShell({
  children,
  title = "Viscora Cockpit",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <SidebarProvider>
      <App1Sidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="flex items-center gap-2 truncate">
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground font-sans">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
              SIH26120 • OIL INDIA LTD
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Search" className="size-8">
              <Search className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="size-8">
              <Bell className="size-4" />
            </Button>
            <Avatar className="ml-1 size-8">
              <AvatarImage
                src={app1User.avatar}
                alt={app1User.name}
                className="object-[50%_15%]"
              />
              <AvatarFallback>{app1User.initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
