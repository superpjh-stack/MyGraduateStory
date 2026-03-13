"use client";

import { useState } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { QuickCapture } from "@/components/session/quick-capture";
import { OfflineBanner } from "@/components/common/offline-banner";
import { PwaInstallBanner } from "@/components/common/pwa-install-banner";
import { Subject } from "@/types/database";

export function AppShell({
  children,
  header,
  subjects = [],
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  subjects?: Subject[];
}) {
  const [captureOpen, setCaptureOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <OfflineBanner />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden">{header}</div>
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5 page-with-bottom-nav md:pb-5">
          {children}
        </main>
      </div>
      <div className="md:hidden">
        <BottomNav onCapture={() => setCaptureOpen(true)} />
      </div>
      <QuickCapture subjects={subjects} open={captureOpen} onClose={() => setCaptureOpen(false)} />
      <PwaInstallBanner />
    </div>
  );
}
