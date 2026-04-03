import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, LayoutDashboard, Navigation, AlertTriangle, Users,
  Map, Camera, EyeOff, Settings, ChevronLeft, ChevronRight,
  MessageCircle, Bot, ScanFace, X, Eye
} from "lucide-react";
import { useState } from "react";
import { useSafety } from "../context/SafetyContext";

const sahayakItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/safe-journey", icon: Navigation, label: "Safe Journey" },
  { to: "/sos", icon: AlertTriangle, label: "SOS Triggers" },
  { to: "/inner-circle", icon: Users, label: "Inner Circle" },
  { to: "/community", icon: MessageCircle, label: "Community" },
  { to: "/heatmap", icon: Map, label: "Safety Heatmap" },
  { to: "/evidence", icon: Camera, label: "Evidence Capture" },
  { to: "/disguise", icon: EyeOff, label: "Disguise Mode" },
  { to: "/sahayak", icon: Bot, label: "Sahayak" },
  { to: "/gupt", icon: ScanFace, label: "Gupt" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

// In Guardian mode, show only the critical tools
const guardianItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/sos", icon: AlertTriangle, label: "SOS Triggers" },
  { to: "/evidence", icon: Camera, label: "Evidence" },
  { to: "/gupt", icon: Eye, label: "Gupt (Stealth)" },
  { to: "/safe-journey", icon: Navigation, label: "Safe Journey" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const AppSidebar = ({ onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { safetyMode } = useSafety();

  const isGuardian = safetyMode === "guardian";
  const navItems = isGuardian ? guardianItems : sahayakItems;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3 }}
      className={`h-screen sticky top-0 flex flex-col overflow-hidden shrink-0 transition-colors duration-300 border-r
        ${isGuardian
          ? "bg-slate-900 border-rose-900/30"
          : "bg-white border-slate-200"
        }`}
    >
      {/* Logo */}
      <div className={`p-4 flex items-center justify-between border-b transition-colors
        ${isGuardian ? "border-slate-800" : "border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
            ${isGuardian
              ? "bg-gradient-to-br from-rose-700 to-pink-900"
              : "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700"
            }`}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className={`text-xl font-display font-bold tracking-tight ${isGuardian ? "text-white" : "text-slate-900"}`}>
                Raksha
              </span>
              {isGuardian && (
                <span className="ml-2 text-[9px] bg-rose-800 text-rose-300 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Guardian
                </span>
              )}
            </motion.div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              ${isGuardian ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-rose-50"}`}
            aria-label="Close sidebar"
          >
            <X className={`w-4 h-4 ${isGuardian ? "text-slate-400" : "text-slate-500"}`} />
          </button>
        )}
      </div>

      {/* Mode label */}
      {!collapsed && (
        <div className={`mx-3 mt-3 mb-1 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2
          ${isGuardian
            ? "bg-rose-900/30 text-rose-400 border border-rose-900/50"
            : "bg-violet-50 text-violet-700 border border-violet-100"
          }`}>
          {isGuardian ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <Bot className="w-3.5 h-3.5 shrink-0" />}
          {isGuardian ? "Stealth — limited view" : "Sahayak — full protection"}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (onClose && window.innerWidth < 768) onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? isGuardian
                    ? "bg-rose-900/40 text-rose-400 shadow-sm"
                    : "bg-rose-50 text-rose-700 shadow-md shadow-rose-500/10"
                  : isGuardian
                    ? "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? isGuardian ? "text-rose-400" : "text-rose-500" : ""}`} />
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isGuardian ? "bg-rose-500" : "bg-rose-500"}`} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`hidden md:flex p-3 border-t items-center justify-center transition-colors
          ${isGuardian
            ? "border-slate-800 text-slate-600 hover:text-slate-300"
            : "border-slate-200 text-slate-500 hover:text-slate-900"
          }`}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
};

export default AppSidebar;
