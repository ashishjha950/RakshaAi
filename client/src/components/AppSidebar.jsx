import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, LayoutDashboard, Navigation, AlertTriangle, Users,
  Map, Camera, EyeOff, Settings, ChevronLeft, ChevronRight,
  Smartphone, Volume2, Mic, Fingerprint, FileText, Radio, MessageCircle,
  Bot, ScanFace, X
} from "lucide-react";
import { useState } from "react";

const navItems = [
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

const AppSidebar = ({ onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3 }}
      className="h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0"
    >
      {/* Logo + Close button (mobile) */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-display font-bold tracking-tight text-slate-900"
            >
              Raksha
            </motion.span>
          )}
        </div>
        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-rose-50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                // Close sidebar on mobile when a link is clicked
                if (onClose && window.innerWidth < 768) onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                ? "bg-rose-50 text-rose-700 shadow-md shadow-rose-500/10"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-rose-500" : ""}`} />
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle — hidden on mobile (sidebar slides in/out instead) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex p-3 border-t border-slate-200 items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
};

export default AppSidebar;
