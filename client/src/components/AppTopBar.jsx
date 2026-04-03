import { Bell, Search, Shield, ScanFace, Bot, Menu, Wifi, WifiOff, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafety } from "../context/SafetyContext";
import { motion, AnimatePresence } from "framer-motion";

const AppTopBar = ({ onHamburger }) => {
  const navigate = useNavigate();
  const { safetyMode, setSafetyMode, globalSosWatch, setGlobalSosWatch, sosTriggered, startFakeCall } = useSafety();
  const [showFakeCallPicker, setShowFakeCallPicker] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const initial = (user?.name || user?.email || "U")[0].toUpperCase();

  const isGuardian = safetyMode === "guardian";

  const fakeCallContacts = ["Mom 💛", "Dad 🧡", "Best Friend 💜", "Police 👮", "Sister 💙"];

  return (
    <header className={`h-16 border-b px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2 transition-colors duration-300
      ${isGuardian
        ? "border-rose-900/40 bg-slate-900"
        : "border-slate-200 bg-white"
      }`}>

      {/* ── Left ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Hamburger */}
        <button
          onClick={onHamburger}
          className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors
            ${isGuardian ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-rose-50"}`}
          aria-label="Open sidebar"
        >
          <Menu className={`w-5 h-5 ${isGuardian ? "text-slate-300" : "text-slate-600"}`} />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search features, contacts..."
            className={`rounded-xl pl-10 pr-4 py-2 text-sm w-48 lg:w-72 outline-none focus:ring-2 focus:ring-rose-500 transition-colors
              ${isGuardian
                ? "bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-rose-700"
                : "bg-slate-100 text-slate-900 placeholder:text-slate-400"
              }`}
          />
        </div>
      </div>

      {/* ── Right ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* ── Adaptive Mode Toggle: Sahayak ↔ Guardian ─────────── */}
        <div className={`hidden sm:flex items-center rounded-full p-1 gap-0.5 transition-colors
          ${isGuardian ? "bg-slate-800" : "bg-slate-100"}`}>
          <button
            onClick={() => setSafetyMode("sahayak")}
            title="Sahayak Mode — visible, interactive protection"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
              ${safetyMode === "sahayak"
                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-sm shadow-indigo-400/40"
                : `${isGuardian ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"}`
              }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sahayak</span>
          </button>

          <button
            onClick={() => setSafetyMode("guardian")}
            title="Guardian Mode — hidden, stealth protection"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
              ${safetyMode === "guardian"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-400/40"
                : `${isGuardian ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"}`
              }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Guardian</span>
          </button>
        </div>

        {/* ── Global SOS Voice Watch toggle ─────────────────────── */}
        <button
          onClick={() => setGlobalSosWatch(!globalSosWatch)}
          title={globalSosWatch ? "Global SOS Watch: ON — click to disable" : "Global SOS Watch: OFF — click to enable"}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border
            ${globalSosWatch
              ? "bg-red-500 text-white border-red-400 shadow-sm shadow-red-400/40 animate-pulse-border"
              : isGuardian
                ? "bg-slate-800 text-slate-400 border-slate-700 hover:border-rose-700 hover:text-rose-400"
                : "bg-slate-100 text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-600"
            }`}
        >
          {globalSosWatch
            ? <Wifi className="w-3.5 h-3.5" />
            : <WifiOff className="w-3.5 h-3.5" />
          }
          <span className="hidden lg:inline">{globalSosWatch ? "SOS ON" : "SOS OFF"}</span>
          {globalSosWatch && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-300 rounded-full animate-ping" />
          )}
        </button>

        {/* ── Fake Call quick-launch (only in Sahayak mode) ──────── */}
        {!isGuardian && (
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowFakeCallPicker(v => !v)}
              title="Start Fake Call"
              className="w-9 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-300/40 flex items-center justify-center transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
            </button>

            <AnimatePresence>
              {showFakeCallPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 6 }}
                  className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50"
                >
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-2 py-1">Fake Call As</p>
                  {fakeCallContacts.map(name => (
                    <button
                      key={name}
                      onClick={() => { startFakeCall(name); setShowFakeCallPicker(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Protection status pill */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
          ${sosTriggered
            ? "bg-red-500/20 text-red-600 animate-pulse"
            : isGuardian
              ? "bg-rose-900/30 text-rose-400"
              : "bg-emerald-500/10 text-emerald-600"
          }`}>
          <Shield className="w-3.5 h-3.5" />
          <span>{sosTriggered ? "SOS ACTIVE" : isGuardian ? "Guardian" : "Protected"}</span>
        </div>

        {/* Notifications */}
        <button className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors
          ${isGuardian ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-rose-50"}`}>
          <Bell className={`w-4 h-4 ${isGuardian ? "text-slate-400" : "text-slate-500"}`} />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center text-white font-display font-semibold text-sm">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;