import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppTopBar from "./AppTopBar";
import GlobalVoiceButton from "./GlobalVoiceButton";
import { GlobalSOSBanner, FakeCallOverlay } from "./GlobalSafetyOverlays";
import { SafetyProvider } from "../context/SafetyContext";
import { useState } from "react";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SafetyProvider>
      <div className={`flex min-h-screen bg-slate-50 relative ${sidebarOpen ? "overflow-hidden md:overflow-auto" : ""}`}>

        {/* ── Global overlays (always mounted) ─────────────────────────── */}
        <GlobalSOSBanner />
        <FakeCallOverlay />

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full z-[1000] transition-transform duration-300 md:relative md:translate-x-0 md:z-auto md:flex md:shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <AppSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 w-full isolate">
          <AppTopBar onHamburger={() => setSidebarOpen(o => !o)} />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-6">
            <Outlet />
          </main>
        </div>

        {/* Global floating voice button */}
        <GlobalVoiceButton />
      </div>
    </SafetyProvider>
  );
};

export default AppLayout;
